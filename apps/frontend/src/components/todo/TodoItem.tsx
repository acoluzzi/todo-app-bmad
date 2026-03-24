"use client";

import type { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  isMutating: boolean;
  onToggleCompleted: (todo: Todo) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function TodoItem({ todo, isMutating, onToggleCompleted, onDelete }: TodoItemProps) {
  return (
    <li
      aria-busy={isMutating}
      className={`flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-opacity sm:flex-row sm:items-start sm:justify-between ${
        isMutating ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          role="img"
          aria-label={`Completion state: ${todo.isCompleted ? "completed" : "active"}`}
          className={`mt-1 inline-flex h-3.5 w-3.5 rounded-full ${
            todo.isCompleted ? "bg-emerald-500" : "bg-slate-300"
          }`}
        />
        <div className="min-w-0 space-y-2">
          <p
            className={`break-words text-base font-medium ${
              todo.isCompleted ? "text-slate-500 line-through" : "text-slate-900"
            }`}
          >
            {todo.description}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
            <span>{todo.isCompleted ? "Completed" : "Active"}</span>
            <span>Created {dateFormatter.format(new Date(todo.createdAt))}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 sm:shrink-0">
        <button
          type="button"
          onClick={() => onToggleCompleted(todo)}
          disabled={isMutating}
          className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {todo.isCompleted ? "Mark active" : "Mark complete"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          disabled={isMutating}
          className="min-h-10 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
