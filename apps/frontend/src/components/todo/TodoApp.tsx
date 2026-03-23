"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiClientError, createTodo, deleteTodo, listTodos, setTodoCompleted } from "@/lib/api-client";
import type { Todo } from "@/types/todo";

import { TodoForm } from "./TodoForm";
import { TodoList } from "./TodoList";

type AsyncStatus = "idle" | "loading" | "success" | "error";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while updating todos.";
};

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [listStatus, setListStatus] = useState<AsyncStatus>("loading");
  const [createStatus, setCreateStatus] = useState<AsyncStatus>("idle");
  const [mutationStatus, setMutationStatus] = useState<Record<string, AsyncStatus>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTodos = async () => {
    setListStatus("loading");
    setErrorMessage(null);

    try {
      const nextTodos = await listTodos();
      setTodos(nextTodos);
      setListStatus("success");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setListStatus("error");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTodos();
  }, []);

  const pendingTodoIds = useMemo(() => {
    return Object.entries(mutationStatus)
      .filter(([, status]) => status === "loading")
      .map(([id]) => id);
  }, [mutationStatus]);

  const handleCreate = async (description: string): Promise<boolean> => {
    setCreateStatus("loading");
    setErrorMessage(null);

    try {
      const createdTodo = await createTodo(description);
      setTodos((currentTodos) => [createdTodo, ...currentTodos]);
      setCreateStatus("success");
      setListStatus("success");
      return true;
    } catch (error) {
      setCreateStatus("error");
      setErrorMessage(getErrorMessage(error));
      return false;
    }
  };

  const handleToggleCompleted = async (todo: Todo) => {
    const previousTodos = todos;
    setMutationStatus((current) => ({ ...current, [todo.id]: "loading" }));
    setErrorMessage(null);

    setTodos((currentTodos) =>
      currentTodos.map((t) => (t.id === todo.id ? { ...t, isCompleted: !t.isCompleted } : t))
    );

    try {
      const updatedTodo = await setTodoCompleted(todo.id, !todo.isCompleted);
      setTodos((currentTodos) =>
        currentTodos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
      );
      setMutationStatus((current) => ({ ...current, [todo.id]: "success" }));
    } catch (error) {
      setTodos(previousTodos);
      setMutationStatus((current) => ({ ...current, [todo.id]: "error" }));
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    const previousTodos = todos;
    setMutationStatus((current) => ({ ...current, [id]: "loading" }));
    setErrorMessage(null);

    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));

    try {
      await deleteTodo(id);
      setMutationStatus((current) => ({ ...current, [id]: "success" }));
    } catch (error) {
      setTodos(previousTodos);
      setMutationStatus((current) => ({ ...current, [id]: "error" }));
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Todo App</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Manage your tasks</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Create, complete, and delete todos using the shared backend API.
        </p>
      </header>

      <TodoForm onCreate={handleCreate} isSubmitting={createStatus === "loading"} />

      {errorMessage ? (
        <div role="alert" aria-live="assertive" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {listStatus === "loading" ? (
        <div aria-busy="true" aria-label="Loading todos" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-3.5 w-3.5 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/3 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {listStatus === "error" ? (
        <div role="status" className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-base font-medium text-red-700">Failed to load todos</p>
          <p className="mt-1 text-sm text-red-600">Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => void fetchTodos()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            Try again
          </button>
        </div>
      ) : null}

      {listStatus === "success" ? (
        <TodoList
          todos={todos}
          pendingTodoIds={pendingTodoIds}
          onToggleCompleted={handleToggleCompleted}
          onDelete={handleDelete}
        />
      ) : null}
    </main>
  );
}
