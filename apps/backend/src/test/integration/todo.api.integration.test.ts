import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../../app.js";

const testDatabaseUrl = process.env.DATABASE_URL_TEST;
const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

const splitSqlStatements = (sql: string): string[] => {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
};

const createTestPrismaClient = (): PrismaClient => {
  const adapter = new PrismaPg({ connectionString: testDatabaseUrl! });
  return new PrismaClient({ adapter });
};

describeWithDatabase("Todo API persistence (PostgreSQL)", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = createTestPrismaClient();

    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "todos" CASCADE');

    const migrationPath = resolve(
      process.cwd(),
      "prisma/migrations/20260320161000_init_todos/migration.sql"
    );
    const migrationSql = readFileSync(migrationPath, "utf8");
    for (const statement of splitSqlStatements(migrationSql)) {
      await prisma.$executeRawUnsafe(statement);
    }

    await prisma.$disconnect();
  });

  afterAll(async () => {
    const cleanupClient = createTestPrismaClient();
    await cleanupClient.$executeRawUnsafe('DELETE FROM "todos"');
    await cleanupClient.$disconnect();
  });

  it("persists a created todo across app restart", async () => {
    const client1 = createTestPrismaClient();
    const app1 = createApp({ prismaClient: client1 });

    const createResponse = await app1.inject({
      method: "POST",
      url: "/api/v1/todos",
      payload: { description: "survives restart" }
    });
    expect(createResponse.statusCode).toBe(201);
    const createdTodo = createResponse.json().data;

    await app1.close();

    const client2 = createTestPrismaClient();
    const app2 = createApp({ prismaClient: client2 });

    const listResponse = await app2.inject({
      method: "GET",
      url: "/api/v1/todos"
    });
    expect(listResponse.statusCode).toBe(200);

    const todos = listResponse.json().data;
    const found = todos.find(
      (todo: { id: string }) => todo.id === createdTodo.id
    );
    expect(found).toBeDefined();
    expect(found.description).toBe("survives restart");
    expect(found.is_completed).toBe(false);

    await app2.close();
  });

  it("persists completion state across app restart", async () => {
    const client1 = createTestPrismaClient();
    const app1 = createApp({ prismaClient: client1 });

    const createResponse = await app1.inject({
      method: "POST",
      url: "/api/v1/todos",
      payload: { description: "will be completed" }
    });
    expect(createResponse.statusCode).toBe(201);
    const createdTodo = createResponse.json().data;

    const patchResponse = await app1.inject({
      method: "PATCH",
      url: `/api/v1/todos/${createdTodo.id}`,
      payload: { is_completed: true }
    });
    expect(patchResponse.statusCode).toBe(200);
    expect(patchResponse.json().data.is_completed).toBe(true);

    await app1.close();

    const client2 = createTestPrismaClient();
    const app2 = createApp({ prismaClient: client2 });

    const listResponse = await app2.inject({
      method: "GET",
      url: "/api/v1/todos"
    });
    const todos = listResponse.json().data;
    const found = todos.find(
      (todo: { id: string }) => todo.id === createdTodo.id
    );
    expect(found).toBeDefined();
    expect(found.is_completed).toBe(true);

    await app2.close();
  });

  it("persists deletion across app restart", async () => {
    const client1 = createTestPrismaClient();
    const app1 = createApp({ prismaClient: client1 });

    const createResponse = await app1.inject({
      method: "POST",
      url: "/api/v1/todos",
      payload: { description: "will be deleted" }
    });
    expect(createResponse.statusCode).toBe(201);
    const createdTodo = createResponse.json().data;

    const deleteResponse = await app1.inject({
      method: "DELETE",
      url: `/api/v1/todos/${createdTodo.id}`
    });
    expect(deleteResponse.statusCode).toBe(204);

    await app1.close();

    const client2 = createTestPrismaClient();
    const app2 = createApp({ prismaClient: client2 });

    const listResponse = await app2.inject({
      method: "GET",
      url: "/api/v1/todos"
    });
    const todos = listResponse.json().data;
    const found = todos.find(
      (todo: { id: string }) => todo.id === createdTodo.id
    );
    expect(found).toBeUndefined();

    await app2.close();
  });
});
