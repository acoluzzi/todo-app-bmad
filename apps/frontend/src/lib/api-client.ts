import { getApiBaseUrl } from "@/lib/env";
import { mapTodoRecord, toUpdateTodoPayload } from "@/lib/mappers";
import type { ApiErrorDetail, Todo, TodoRecord } from "@/types/todo";

type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
};

type ApiDataEnvelope<T> = {
  data: T;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const buildUrl = (path: string): string => {
  return `${getApiBaseUrl()}${path}`;
};

const parseErrorResponse = async (response: Response): Promise<ApiClientError> => {
  try {
    const payload = (await response.json()) as ApiErrorEnvelope;
    return new ApiClientError(
      payload.error.message,
      payload.error.code,
      response.status,
      payload.error.details
    );
  } catch {
    return new ApiClientError("Request failed", "REQUEST_FAILED", response.status);
  }
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string> ?? {}) };
  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path), { ...init, headers });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return (await response.json()) as T;
};

export const listTodos = async (): Promise<Todo[]> => {
  const payload = await requestJson<ApiDataEnvelope<TodoRecord[]>>("/api/v1/todos");
  return payload.data.map(mapTodoRecord);
};

export const createTodo = async (description: string): Promise<Todo> => {
  const payload = await requestJson<ApiDataEnvelope<TodoRecord>>("/api/v1/todos", {
    method: "POST",
    body: JSON.stringify({ description })
  });

  return mapTodoRecord(payload.data);
};

export const setTodoCompleted = async (id: string, isCompleted: boolean): Promise<Todo> => {
  const payload = await requestJson<ApiDataEnvelope<TodoRecord>>(`/api/v1/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toUpdateTodoPayload(isCompleted))
  });

  return mapTodoRecord(payload.data);
};

export const deleteTodo = async (id: string): Promise<void> => {
  const response = await fetch(buildUrl(`/api/v1/todos/${id}`), {
    method: "DELETE"
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
};
