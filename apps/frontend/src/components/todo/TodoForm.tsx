"use client";

import { useState } from "react";

type TodoFormProps = {
  onCreate: (description: string) => Promise<boolean>;
  isSubmitting: boolean;
};

export function TodoForm({ onCreate, isSubmitting }: TodoFormProps) {
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedDescription = description.trim();

    if (trimmedDescription.length < 1) {
      setErrorMessage("Enter a todo description.");
      return;
    }

    if (trimmedDescription.length > 120) {
      setErrorMessage("Todo descriptions must be 120 characters or less.");
      return;
    }

    setErrorMessage(null);
    const success = await onCreate(trimmedDescription);
    if (success) {
      setDescription("");
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <label className="text-sm font-medium text-slate-700" htmlFor="todo-description">
        Add a todo
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="todo-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What needs to get done?"
          className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-slate-500"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Adding..." : "Add todo"}
        </button>
      </div>
      {errorMessage ? <p role="alert" className="text-sm text-red-600">{errorMessage}</p> : null}
    </form>
  );
}
