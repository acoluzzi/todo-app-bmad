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

  it("optimistically toggles todo completion before API responds", async () => {
    let resolveToggle!: (value: Todo) => void;
    mockedSetTodoCompleted.mockImplementation(() => new Promise((resolve) => { resolveToggle = resolve; }));

    render(<TodoApp />);

    await screen.findByText("Write tests");

    await userEvent.click(screen.getByRole("button", { name: "Mark complete" }));

    expect(screen.queryByRole("button", { name: "Mark complete" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Mark active" })).toHaveLength(2);

    resolveToggle({ ...baseTodos[0], isCompleted: true });

    await waitFor(() => {
      const items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveAttribute("aria-busy", "false");
    });
    expect(mockedSetTodoCompleted).toHaveBeenCalledWith("todo-1", true);
  });

  it("reverts optimistic toggle on API failure", async () => {
    mockedSetTodoCompleted.mockRejectedValue(
      new apiClient.ApiClientError("Toggle failed", "INTERNAL_ERROR", 500)
    );

    render(<TodoApp />);

    await screen.findByText("Write tests");

    await userEvent.click(screen.getByRole("button", { name: "Mark complete" }));

    await waitFor(() => {
      expect(screen.getByText("Toggle failed")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Mark complete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark complete" })).not.toBeDisabled();
  });

  it("optimistically deletes a todo before API responds", async () => {
    let resolveDelete!: (value: void) => void;
    mockedDeleteTodo.mockImplementation(() => new Promise((resolve) => { resolveDelete = resolve; }));

    render(<TodoApp />);

    await screen.findByText("Write tests");

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await userEvent.click(deleteButtons[0]);

    expect(screen.queryByText("Write tests")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    resolveDelete();

    expect(mockedDeleteTodo).toHaveBeenCalledWith("todo-1");
  });

  it("reverts optimistic delete on API failure", async () => {
    let rejectDelete!: (error: Error) => void;
    mockedDeleteTodo.mockImplementation(() => new Promise((_resolve, reject) => { rejectDelete = reject; }));

    render(<TodoApp />);

    await screen.findByText("Write tests");

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await userEvent.click(deleteButtons[0]);

    expect(screen.queryByText("Write tests")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    rejectDelete(new apiClient.ApiClientError("Delete failed", "INTERNAL_ERROR", 500));

    await waitFor(() => {
      expect(screen.getByText("Delete failed")).toBeInTheDocument();
    });

    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows empty state when the API returns no todos", async () => {
    mockedListTodos.mockResolvedValue([]);

    render(<TodoApp />);

    expect(await screen.findByText("No todos yet")).toBeInTheDocument();
    expect(screen.getByText("Add one above to get started!")).toBeInTheDocument();

    const statusContainer = screen.getByRole("status");
    expect(statusContainer).toBeInTheDocument();

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("shows loading skeleton before the initial fetch resolves", async () => {
    let resolveList!: (value: Todo[]) => void;
    mockedListTodos.mockImplementation(() => new Promise((resolve) => { resolveList = resolve; }));

    render(<TodoApp />);

    const loadingRegion = screen.getByLabelText("Loading todos");
    expect(loadingRegion).toBeInTheDocument();
    expect(loadingRegion).toHaveAttribute("aria-busy", "true");

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    resolveList(baseTodos);

    await screen.findByText("Write tests");
    expect(screen.queryByLabelText("Loading todos")).not.toBeInTheDocument();
  });

  it("shows error state when the initial fetch fails", async () => {
    mockedListTodos.mockRejectedValue(new Error("Network error"));

    render(<TodoApp />);

    expect(await screen.findByText("Failed to load todos")).toBeInTheDocument();
    expect(screen.getByText("Check your connection and try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();

    expect(screen.getByText("Network error")).toBeInTheDocument();

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("retries list fetch when clicking Try again after failure", async () => {
    mockedListTodos.mockRejectedValueOnce(new Error("Network error"));
    mockedListTodos.mockResolvedValueOnce(baseTodos);

    render(<TodoApp />);

    expect(await screen.findByText("Failed to load todos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Write tests")).toBeInTheDocument();
    expect(screen.queryByText("Failed to load todos")).not.toBeInTheDocument();
    expect(mockedListTodos).toHaveBeenCalledTimes(2);
  });

  it("shows loading skeleton during retry fetch", async () => {
    mockedListTodos.mockRejectedValueOnce(new Error("Network error"));

    let resolveRetry!: (value: Todo[]) => void;
    mockedListTodos.mockImplementationOnce(() => new Promise((resolve) => { resolveRetry = resolve; }));

    render(<TodoApp />);

    expect(await screen.findByText("Failed to load todos")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByLabelText("Loading todos")).toBeInTheDocument();
    expect(screen.queryByText("Failed to load todos")).not.toBeInTheDocument();

    resolveRetry(baseTodos);

    expect(await screen.findByText("Write tests")).toBeInTheDocument();
  });

  it("dismisses the error banner when clicking Dismiss", async () => {
    mockedSetTodoCompleted.mockRejectedValue(
      new apiClient.ApiClientError("Server error", "INTERNAL_ERROR", 500)
    );

    render(<TodoApp />);

    await screen.findByText("Write tests");

    await userEvent.click(screen.getByRole("button", { name: "Mark complete" }));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Dismiss error" }));

    expect(screen.queryByText("Server error")).not.toBeInTheDocument();
  });

  it("shows mutation loading state when toggling a todo", async () => {
    let resolveToggle!: (value: Todo) => void;
    mockedSetTodoCompleted.mockImplementation(() => new Promise((resolve) => { resolveToggle = resolve; }));

    render(<TodoApp />);

    await screen.findByText("Write tests");

    await userEvent.click(screen.getByRole("button", { name: "Mark complete" }));

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("aria-busy", "true");

    expect(screen.getAllByRole("button", { name: "Mark active" })).toHaveLength(2);

    resolveToggle({ ...baseTodos[0], isCompleted: true });

    await waitFor(() => {
      expect(items[0]).toHaveAttribute("aria-busy", "false");
    });
  });
});
