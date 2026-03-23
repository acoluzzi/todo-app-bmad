import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TodoApp } from "@/components/todo/TodoApp";
import * as apiClient from "@/lib/api-client";
import type { Todo } from "@/types/todo";

vi.mock("@/lib/api-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-client")>("@/lib/api-client");

  return {
    ...actual,
    listTodos: vi.fn(),
    createTodo: vi.fn(),
    setTodoCompleted: vi.fn(),
    deleteTodo: vi.fn()
  };
});

const mockedListTodos = vi.mocked(apiClient.listTodos);
const mockedCreateTodo = vi.mocked(apiClient.createTodo);
const mockedSetTodoCompleted = vi.mocked(apiClient.setTodoCompleted);
const mockedDeleteTodo = vi.mocked(apiClient.deleteTodo);

const baseTodos: Todo[] = [
  {
    id: "todo-1",
    description: "Write tests",
    isCompleted: false,
    createdAt: "2026-03-20T12:00:00.000Z"
  },
  {
    id: "todo-2",
    description: "Ship UI",
    isCompleted: true,
    createdAt: "2026-03-20T11:00:00.000Z"
  }
];

describe("TodoApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedListTodos.mockResolvedValue(baseTodos);
  });

  it("renders todos returned by the API on initial load in API order", async () => {
    render(<TodoApp />);

    expect(await screen.findByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Ship UI")).toBeInTheDocument();
    expect(mockedListTodos).toHaveBeenCalledTimes(1);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Write tests");
    expect(items[1]).toHaveTextContent("Ship UI");
  });

  it("creates a todo and updates the rendered list", async () => {
    const createdTodo: Todo = {
      id: "todo-3",
      description: "Review UI",
      isCompleted: false,
      createdAt: "2026-03-20T13:00:00.000Z"
    };
    mockedCreateTodo.mockResolvedValue(createdTodo);

    render(<TodoApp />);

    await screen.findByText("Write tests");

    await userEvent.type(screen.getByLabelText("Add a todo"), "Review UI");
    await userEvent.click(screen.getByRole("button", { name: "Add todo" }));

    await screen.findByText("Review UI");
    expect(mockedCreateTodo).toHaveBeenCalledWith("Review UI");
  });

  it("toggles todo completion and updates the rendered state", async () => {
    mockedSetTodoCompleted.mockResolvedValue({
      ...baseTodos[0],
      isCompleted: true
    });

    render(<TodoApp />);

    await screen.findByText("Write tests");

    await userEvent.click(screen.getByRole("button", { name: "Mark complete" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Mark complete" })).not.toBeInTheDocument();
    });
    expect(screen.getAllByRole("button", { name: "Mark active" })).toHaveLength(2);
    expect(mockedSetTodoCompleted).toHaveBeenCalledWith("todo-1", true);
  });

  it("deletes a todo and removes it from the rendered list", async () => {
    mockedDeleteTodo.mockResolvedValue(undefined);

    render(<TodoApp />);

    await screen.findByText("Write tests");

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Write tests")).not.toBeInTheDocument();
    });
    expect(mockedDeleteTodo).toHaveBeenCalledWith("todo-1");
  });
});
