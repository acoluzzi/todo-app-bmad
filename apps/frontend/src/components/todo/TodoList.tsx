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
  if (todos.length === 0) {
    return (
      <div role="status" className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
        <p className="text-base font-medium text-slate-500">No todos yet</p>
        <p className="mt-1 text-sm text-slate-400">Add one above to get started!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-live="polite">
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
