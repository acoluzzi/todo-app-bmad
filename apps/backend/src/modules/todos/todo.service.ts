import type { TodoRepository, TodoRecord, CreateTodoInput } from "./todo.repository.js";

export class TodoNotFoundError extends Error {
  constructor(id: string) {
    super(`Todo with id "${id}" not found`);
    this.name = "TodoNotFoundError";
  }
}

export class TodoService {
  constructor(private readonly repository: TodoRepository) {}

  async create(input: CreateTodoInput): Promise<TodoRecord> {
    return this.repository.create(input);
  }

  async list(): Promise<TodoRecord[]> {
    return this.repository.list();
  }

  async setCompleted(id: string, isCompleted: boolean): Promise<TodoRecord> {
    const result = await this.repository.setCompleted(id, isCompleted);
    if (result === null) {
      throw new TodoNotFoundError(id);
    }
    return result;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new TodoNotFoundError(id);
    }
  }
}
