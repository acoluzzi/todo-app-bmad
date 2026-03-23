import Fastify from "fastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { errorHandler } from "../../middleware/error-handler.js";
import { createTodoRoutes } from "../../modules/todos/todo.route.js";
import { TodoNotFoundError, TodoService } from "../../modules/todos/todo.service.js";
import type { TodoRecord } from "../../modules/todos/todo.repository.js";

const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const UNKNOWN_UUID = "00000000-0000-0000-0000-000000000000";

const makeTodoRecord = (overrides?: Partial<TodoRecord>): TodoRecord => ({
  id: VALID_UUID,
  description: "Test todo",
  is_completed: false,
  created_at: "2026-03-20T12:00:00.000Z",
  ...overrides
});

const createMockService = () => ({
  create: vi.fn(),
  list: vi.fn(),
  setCompleted: vi.fn(),
  delete: vi.fn()
});

const buildApp = (mockService: ReturnType<typeof createMockService>) => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  app.register(createTodoRoutes(mockService as unknown as TodoService), {
    prefix: "/api/v1"
  });
  return app;
};

describe("Todo CRUD routes", () => {
  let mockService: ReturnType<typeof createMockService>;
  let app: ReturnType<typeof Fastify>;

  beforeEach(() => {
    mockService = createMockService();
    app = buildApp(mockService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /api/v1/todos", () => {
    it("creates a todo and returns 201 with data envelope", async () => {
      const record = makeTodoRecord();
      mockService.create.mockResolvedValue(record);

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { description: "Test todo" }
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual({ data: record });
      expect(mockService.create).toHaveBeenCalledWith({ description: "Test todo" });
    });

    it("returns 400 when description is empty", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { description: "" }
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "description" })
        ])
      );
    });

    it("returns 400 when description contains only whitespace", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { description: "   " }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when description exceeds 120 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { description: "x".repeat(121) }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when description field is missing", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: {}
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when description is not a string", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { description: 42 }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when body is missing entirely", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/todos"
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 validation error when body contains malformed JSON", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        headers: {
          "content-type": "application/json"
        },
        payload: "{"
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: [
            {
              path: "body",
              message: "Body is not valid JSON but content-type is set to 'application/json'"
            }
          ]
        }
      });
    });
  });

  describe("GET /api/v1/todos", () => {
    it("returns 200 with data array", async () => {
      const records = [makeTodoRecord(), makeTodoRecord({ id: UNKNOWN_UUID, description: "Second" })];
      mockService.list.mockResolvedValue(records);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/todos"
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ data: records });
    });

    it("returns 200 with empty array when no todos exist", async () => {
      mockService.list.mockResolvedValue([]);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/todos"
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ data: [] });
    });
  });

  describe("PATCH /api/v1/todos/:id", () => {
    it("updates completion state and returns 200", async () => {
      const record = makeTodoRecord({ is_completed: true });
      mockService.setCompleted.mockResolvedValue(record);

      const response = await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${VALID_UUID}`,
        payload: { is_completed: true }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ data: record });
      expect(mockService.setCompleted).toHaveBeenCalledWith(VALID_UUID, true);
    });

    it("returns 404 when todo not found", async () => {
      mockService.setCompleted.mockRejectedValue(new TodoNotFoundError(UNKNOWN_UUID));

      const response = await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${UNKNOWN_UUID}`,
        payload: { is_completed: true }
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error.code).toBe("TODO_NOT_FOUND");
    });

    it("returns 400 when body is empty object", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${VALID_UUID}`,
        payload: {}
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when is_completed is null", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${VALID_UUID}`,
        payload: { is_completed: null }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when is_completed is not a boolean", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${VALID_UUID}`,
        payload: { is_completed: "yes" }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when id is not a valid UUID", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/api/v1/todos/not-a-uuid",
        payload: { is_completed: true }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("DELETE /api/v1/todos/:id", () => {
    it("deletes a todo and returns 204 with no body", async () => {
      mockService.delete.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/v1/todos/${VALID_UUID}`
      });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe("");
      expect(mockService.delete).toHaveBeenCalledWith(VALID_UUID);
    });

    it("returns 404 when todo not found", async () => {
      mockService.delete.mockRejectedValue(new TodoNotFoundError(UNKNOWN_UUID));

      const response = await app.inject({
        method: "DELETE",
        url: `/api/v1/todos/${UNKNOWN_UUID}`
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error.code).toBe("TODO_NOT_FOUND");
    });

    it("returns 400 when id is not a valid UUID", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/api/v1/todos/not-a-uuid"
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("unexpected errors", () => {
    it("returns 500 via global error handler when service throws", async () => {
      mockService.list.mockRejectedValue(new Error("DB connection lost"));

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/todos"
      });

      expect(response.statusCode).toBe(500);
      expect(response.json().error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  describe("error envelope consistency", () => {
    const errorEnvelopeShape = (body: Record<string, unknown>) => {
      expect(body).toHaveProperty("error");
      const envelope = body.error as Record<string, unknown>;
      expect(envelope).toHaveProperty("code");
      expect(envelope).toHaveProperty("message");
      expect(typeof envelope.code).toBe("string");
      expect(typeof envelope.message).toBe("string");
    };

    it("returns consistent envelope for validation, not-found, and server errors", async () => {
      const validationRes = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { description: "" }
      });
      expect(validationRes.statusCode).toBe(400);
      errorEnvelopeShape(validationRes.json());

      mockService.setCompleted.mockRejectedValue(new TodoNotFoundError(UNKNOWN_UUID));
      const notFoundRes = await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${UNKNOWN_UUID}`,
        payload: { is_completed: true }
      });
      expect(notFoundRes.statusCode).toBe(404);
      errorEnvelopeShape(notFoundRes.json());

      mockService.list.mockRejectedValue(new Error("DB down"));
      const serverRes = await app.inject({
        method: "GET",
        url: "/api/v1/todos"
      });
      expect(serverRes.statusCode).toBe(500);
      errorEnvelopeShape(serverRes.json());
    });
  });
});
