import { Prisma } from "../../generated/prisma/client.js";
import type { PrismaClient, Todo } from "../../generated/prisma/client.js";

export type TodoRecord = {
  id: string;
  description: string;
  is_completed: boolean;
  created_at: string;
};

export type CreateTodoInput = {
  description: string;
};

type TodoClient = Pick<PrismaClient, "todo">;

const toTodoRecord = (todo: Todo): TodoRecord => {
  return {
    id: todo.id,
    description: todo.description,
    is_completed: todo.isCompleted,
    created_at: todo.createdAt.toISOString()
  };
};

const isNotFoundError = (error: unknown): boolean => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return true;
  }

  const maybeCode = (error as { code?: unknown } | null | undefined)?.code;
  return maybeCode === "P2025";
};

export class TodoRepository {
  constructor(private readonly client: TodoClient) {}

  async create(input: CreateTodoInput): Promise<TodoRecord> {
    const todo = await this.client.todo.create({
      data: {
        description: input.description
      }
    });

    return toTodoRecord(todo);
  }

  async list(): Promise<TodoRecord[]> {
    const todos = await this.client.todo.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return todos.map(toTodoRecord);
  }

  async setCompleted(id: string, isCompleted: boolean): Promise<TodoRecord | null> {
    try {
      const updated = await this.client.todo.update({
        where: { id },
        data: { isCompleted }
      });
      return toTodoRecord(updated);
    } catch (error) {
      if (isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.client.todo.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      if (isNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }
}
