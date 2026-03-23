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
  const [listStatus, setListStatus] = useState<AsyncStatus>("idle");
  const [createStatus, setCreateStatus] = useState<AsyncStatus>("idle");
  const [mutationStatus, setMutationStatus] = useState<Record<string, AsyncStatus>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadTodos = async () => {
      setListStatus("loading");

      try {
        const nextTodos = await listTodos();
        if (!isActive) {
          return;
        }

        setTodos(nextTodos);
        setListStatus("success");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
        setListStatus("error");
      }
    };

    void loadTodos();

    return () => {
      isActive = false;
    };
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
      return true;
    } catch (error) {
      setCreateStatus("error");
      setErrorMessage(getErrorMessage(error));
      return false;
    }
  };

  const handleToggleCompleted = async (todo: Todo) => {
    setMutationStatus((current) => ({ ...current, [todo.id]: "loading" }));
    setErrorMessage(null);

    try {
      const updatedTodo = await setTodoCompleted(todo.id, !todo.isCompleted);
      setTodos((currentTodos) =>
        currentTodos.map((currentTodo) => (currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo))
      );
      setMutationStatus((current) => ({ ...current, [todo.id]: "success" }));
    } catch (error) {
      setMutationStatus((current) => ({ ...current, [todo.id]: "error" }));
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    setMutationStatus((current) => ({ ...current, [id]: "loading" }));
    setErrorMessage(null);

    try {
      await deleteTodo(id);
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
      setMutationStatus((current) => ({ ...current, [id]: "success" }));
    } catch (error) {
      setMutationStatus((current) => ({ ...current, [id]: "error" }));
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Todo App</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Manage your tasks</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Create, complete, and delete todos using the shared backend API.
        </p>
      </header>

      <TodoForm onCreate={handleCreate} isSubmitting={createStatus === "loading"} />

      {errorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      {listStatus === "loading" ? (
        <p className="text-sm text-slate-500">Loading todos...</p>
      ) : null}

      {listStatus !== "loading" ? (
        <TodoList
          todos={todos}
          pendingTodoIds={pendingTodoIds}
          onToggleCompleted={handleToggleCompleted}
          onDelete={handleDelete}
        />
      ) : null}
    </section>
  );
}
