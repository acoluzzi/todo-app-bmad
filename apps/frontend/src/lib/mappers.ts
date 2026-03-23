import type { Todo, TodoRecord } from "@/types/todo";

export const mapTodoRecord = (todo: TodoRecord): Todo => {
  return {
    id: todo.id,
    description: todo.description,
    isCompleted: todo.is_completed,
    createdAt: todo.created_at
  };
};

export const toUpdateTodoPayload = (isCompleted: boolean): Pick<TodoRecord, "is_completed"> => {
  return { is_completed: isCompleted };
};
