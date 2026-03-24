import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TodoItem } from "@/components/todo/TodoItem";
import type { Todo } from "@/types/todo";

const activeTodo: Todo = {
  id: "todo-1",
  description: "Write unit tests",
  isCompleted: false,
  createdAt: "2026-03-20T14:30:00.000Z"
};

const completedTodo: Todo = {
  id: "todo-2",
  description: "Ship feature",
  isCompleted: true,
  createdAt: "2026-03-19T09:00:00.000Z"
};

const noop = async () => {};

describe("TodoItem", () => {
  it("renders the description, status label, and formatted timestamp", () => {
    render(
      <TodoItem todo={activeTodo} isMutating={false} onToggleCompleted={noop} onDelete={noop} />
    );

    expect(screen.getByText("Write unit tests")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText(/Created.*Mar.*2026/)).toBeInTheDocument();
  });

  it("applies active styling when todo is not completed", () => {
    render(
      <TodoItem todo={activeTodo} isMutating={false} onToggleCompleted={noop} onDelete={noop} />
    );

    const description = screen.getByText("Write unit tests");
    expect(description.className).toContain("text-slate-900");
    expect(description.className).not.toContain("line-through");

    const indicator = screen.getByLabelText("Completion state: active");
    expect(indicator.className).toContain("bg-slate-300");
  });

  it("applies completed styling with line-through and green indicator", () => {
    render(
      <TodoItem todo={completedTodo} isMutating={false} onToggleCompleted={noop} onDelete={noop} />
    );

    const description = screen.getByText("Ship feature");
    expect(description.className).toContain("text-slate-500");
    expect(description.className).toContain("line-through");

    expect(screen.getByText("Completed")).toBeInTheDocument();

    const indicator = screen.getByLabelText("Completion state: completed");
    expect(indicator.className).toContain("bg-emerald-500");
  });

  it("shows Mark complete button for active todos and Mark active for completed", () => {
    const { rerender } = render(
      <TodoItem todo={activeTodo} isMutating={false} onToggleCompleted={noop} onDelete={noop} />
    );

    expect(screen.getByRole("button", { name: "Mark complete" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mark active" })).not.toBeInTheDocument();

    rerender(
      <TodoItem todo={completedTodo} isMutating={false} onToggleCompleted={noop} onDelete={noop} />
    );

    expect(screen.getByRole("button", { name: "Mark active" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mark complete" })).not.toBeInTheDocument();
  });

  it("disables buttons and reduces opacity while mutating", () => {
    render(
      <TodoItem todo={activeTodo} isMutating={true} onToggleCompleted={noop} onDelete={noop} />
    );

    const listItem = screen.getByRole("listitem");
    expect(listItem).toHaveAttribute("aria-busy", "true");
    expect(listItem.className).toContain("opacity-60");

    expect(screen.getByRole("button", { name: "Mark complete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("calls onToggleCompleted with the todo when toggle button is clicked", async () => {
    const onToggle = vi.fn();

    render(
      <TodoItem todo={activeTodo} isMutating={false} onToggleCompleted={onToggle} onDelete={noop} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Mark complete" }));
    expect(onToggle).toHaveBeenCalledWith(activeTodo);
  });

  it("calls onDelete with the todo id when delete button is clicked", async () => {
    const onDelete = vi.fn();

    render(
      <TodoItem todo={activeTodo} isMutating={false} onToggleCompleted={noop} onDelete={onDelete} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("todo-1");
  });
});
