import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { TodoRepository } from "../../modules/todos/todo.repository.js";

const testDatabaseUrl = process.env.DATABASE_URL_TEST;
const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

const splitSqlStatements = (sql: string): string[] => {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
};

describeWithDatabase("TodoRepository integration (PostgreSQL)", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    const adapter = new PrismaPg({ connectionString: testDatabaseUrl! });
    prisma = new PrismaClient({ adapter });

    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "todos" CASCADE');

    const migrationPath = resolve(
      process.cwd(),
      "prisma/migrations/20260320161000_init_todos/migration.sql"
    );
    const migrationSql = readFileSync(migrationPath, "utf8");
    for (const statement of splitSqlStatements(migrationSql)) {
      await prisma.$executeRawUnsafe(statement);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("applies migration and creates required todos columns", async () => {
    const columns = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'todos'`
    );
    const columnNames = columns.map((row) => row.column_name).sort();

    expect(columnNames).toEqual(["created_at", "description", "id", "is_completed"]);
  });

  it("persists todos across client reinitialization", async () => {
    const repository = new TodoRepository(prisma as never);
    const created = await repository.create({ description: "integration persistence" });

    await prisma.$disconnect();
    const nextPrisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: testDatabaseUrl! }) });
    prisma = nextPrisma;

    const reloadedRepository = new TodoRepository(nextPrisma as never);
    const todos = await reloadedRepository.list();

    expect(todos.some((todo) => todo.id === created.id)).toBe(true);
  });
});
