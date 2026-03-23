"use client";

import type { Todo } from "@/types/todo";

import { TodoItem } from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  pendingTodoIds: string[];
  onToggleCompleted: (todo: Todo) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function TodoList({
  todos,
  pendingTodoIds,
  onToggleCompleted,
  onDelete
}: TodoListProps) {
  return (
    <ul className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isMutating={pendingTodoIds.includes(todo.id)}
          onToggleCompleted={onToggleCompleted}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
