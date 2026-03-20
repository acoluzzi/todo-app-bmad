import type { FastifyInstance } from "fastify";
import type { ZodError } from "zod";

import { createTodoSchema, todoIdParamSchema, updateTodoSchema } from "./todo.schema.js";
import { TodoNotFoundError, type TodoService } from "./todo.service.js";

const formatZodError = (error: ZodError) => ({
  error: {
    code: "VALIDATION_ERROR",
    message: "Request validation failed",
    details: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }))
  }
});

const notFoundEnvelope = (id: string) => ({
  error: {
    code: "TODO_NOT_FOUND",
    message: `Todo with id "${id}" not found`
  }
});

export const createTodoRoutes = (service: TodoService) => {
  return async (app: FastifyInstance): Promise<void> => {

  app.post("/todos", async (request, reply) => {
    const parsed = createTodoSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(formatZodError(parsed.error));
    }
    const todo = await service.create({ description: parsed.data.description });
    return reply.status(201).send({ data: todo });
  });

  app.get("/todos", async (_request, reply) => {
    const todos = await service.list();
    return reply.status(200).send({ data: todos });
  });

  app.patch("/todos/:id", async (request, reply) => {
    const paramsParsed = todoIdParamSchema.safeParse(request.params);
    if (!paramsParsed.success) {
      return reply.status(400).send(formatZodError(paramsParsed.error));
    }

    const bodyParsed = updateTodoSchema.safeParse(request.body);
    if (!bodyParsed.success) {
      return reply.status(400).send(formatZodError(bodyParsed.error));
    }

    try {
      const todo = await service.setCompleted(paramsParsed.data.id, bodyParsed.data.is_completed);
      return reply.status(200).send({ data: todo });
    } catch (error) {
      if (error instanceof TodoNotFoundError) {
        return reply.status(404).send(notFoundEnvelope(paramsParsed.data.id));
      }
      throw error;
    }
  });

  app.delete("/todos/:id", async (request, reply) => {
    const paramsParsed = todoIdParamSchema.safeParse(request.params);
    if (!paramsParsed.success) {
      return reply.status(400).send(formatZodError(paramsParsed.error));
    }

    try {
      await service.delete(paramsParsed.data.id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof TodoNotFoundError) {
        return reply.status(404).send(notFoundEnvelope(paramsParsed.data.id));
      }
      throw error;
    }
  });
  };
};
