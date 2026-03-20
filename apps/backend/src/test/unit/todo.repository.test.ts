import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { TodoRepository } from "../../modules/todos/todo.repository.js";

type StoredTodo = {
  id: string;
  description: string;
  isCompleted: boolean;
  createdAt: Date;
};

class InMemoryTodoDelegate {
  private readonly store = new Map<string, StoredTodo>();
  private idCounter = 1;

  async create(input: { data: { description: string } }): Promise<StoredTodo> {
    const todo: StoredTodo = {
      id: `todo-${this.idCounter++}`,
      description: input.data.description,
      isCompleted: false,
      createdAt: new Date()
    };
    this.store.set(todo.id, todo);
    return todo;
  }

  async findMany(): Promise<StoredTodo[]> {
    return [...this.store.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(input: { where: { id: string }; data: { isCompleted: boolean } }): Promise<StoredTodo> {
    const todo = this.store.get(input.where.id);
    if (!todo) {
      throw Object.assign(new Error("not found"), { code: "P2025" });
    }

    const updated = {
      ...todo,
      isCompleted: input.data.isCompleted
    };
    this.store.set(updated.id, updated);
    return updated;
  }

  async delete(input: { where: { id: string } }): Promise<StoredTodo> {
    const todo = this.store.get(input.where.id);
    if (!todo) {
      throw Object.assign(new Error("not found"), { code: "P2025" });
    }
    this.store.delete(input.where.id);
    return todo;
  }
}

const createRepository = (todoDelegate: {
  create: (input: { data: { description: string } }) => Promise<StoredTodo>;
  findMany: () => Promise<StoredTodo[]>;
  update: (input: { where: { id: string }; data: { isCompleted: boolean } }) => Promise<StoredTodo>;
  delete: (input: { where: { id: string } }) => Promise<StoredTodo>;
}): TodoRepository => {
  return new TodoRepository({ todo: todoDelegate } as never);
};

describe("TodoRepository", () => {
  it("creates and lists todos with snake_case output fields", async () => {
    const delegate = new InMemoryTodoDelegate();
    const repository = createRepository(delegate);

    const created = await repository.create({ description: "buy milk" });

    expect(created.id).toBeDefined();
    expect(created.description).toBe("buy milk");
    expect(created.is_completed).toBe(false);
    expect(new Date(created.created_at).toISOString()).toBe(created.created_at);

    const todos = await repository.list();
    expect(todos).toHaveLength(1);
    expect(todos[0]?.id).toBe(created.id);
  });

  it("updates completion and supports delete semantics", async () => {
    const delegate = new InMemoryTodoDelegate();
    const repository = createRepository(delegate);
    const created = await repository.create({ description: "review PR" });

    const updated = await repository.setCompleted(created.id, true);
    expect(updated?.is_completed).toBe(true);

    const deleted = await repository.delete(created.id);
    expect(deleted).toBe(true);

    const missingDelete = await repository.delete(created.id);
    expect(missingDelete).toBe(false);
  });

  it("retains persisted state across repository instances sharing storage", async () => {
    const delegate = new InMemoryTodoDelegate();
    const writerRepository = createRepository(delegate);
    const readerRepository = createRepository(delegate);

    const created = await writerRepository.create({ description: "persist me" });
    const loaded = await readerRepository.list();

    expect(loaded.some((todo) => todo.id === created.id)).toBe(true);
  });

  it("rethrows non-not-found errors from repository operations", async () => {
    const repository = createRepository({
      create: async () => {
        throw new Error("db unavailable");
      },
      findMany: async () => [],
      update: async () => {
        throw new Error("db unavailable");
      },
      delete: async () => {
        throw new Error("db unavailable");
      }
    });

    await expect(repository.create({ description: "x" })).rejects.toThrow("db unavailable");
    await expect(repository.setCompleted("x", true)).rejects.toThrow("db unavailable");
    await expect(repository.delete("x")).rejects.toThrow("db unavailable");
  });
});

describe("Prisma migration artifact", () => {
  it("defines todos table with required snake_case columns", () => {
    const migrationPath = resolve(
      process.cwd(),
      "prisma/migrations/20260320161000_init_todos/migration.sql"
    );
    const migrationSql = readFileSync(migrationPath, "utf8");

    expect(migrationSql).toContain('CREATE TABLE "todos"');
    expect(migrationSql).toContain('"id" UUID NOT NULL');
    expect(migrationSql).toContain('"description" TEXT NOT NULL');
    expect(migrationSql).toContain('"is_completed" BOOLEAN NOT NULL DEFAULT false');
    expect(migrationSql).toContain('"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP');
  });
});
