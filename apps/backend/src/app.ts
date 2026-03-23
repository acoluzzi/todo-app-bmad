import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";

import type { PrismaClient } from "./generated/prisma/client.js";
import { loggerConfig } from "./config/logger.js";
import { disconnectPrisma, getPrismaClient } from "./config/prisma.js";
import { errorHandler } from "./middleware/error-handler.js";
import { registerHealthRoute } from "./modules/health.route.js";
import { TodoRepository } from "./modules/todos/todo.repository.js";
import { createTodoRoutes } from "./modules/todos/todo.route.js";
import { TodoService } from "./modules/todos/todo.service.js";

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN?.trim() || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export type AppOptions = {
  prismaClient?: PrismaClient;
};

export const createApp = (options?: AppOptions) => {
  const app = Fastify({ logger: loggerConfig });

  const usesManagedPrismaClient = options?.prismaClient === undefined;
  const prismaClient = options?.prismaClient ?? getPrismaClient();
  const todoRepository = new TodoRepository(prismaClient);
  const todoService = new TodoService(todoRepository);

  app.register(cors, { origin: ALLOWED_ORIGINS, methods: ["GET", "POST", "PATCH", "DELETE"] });
  app.register(helmet, { global: true });
  app.setErrorHandler(errorHandler);
  app.register(registerHealthRoute, { prefix: "/api/v1" });
  app.register(createTodoRoutes(todoService), { prefix: "/api/v1" });
  app.addHook("onClose", async () => {
    if (usesManagedPrismaClient) {
      await disconnectPrisma();
      return;
    }

    const injectedClient = options.prismaClient as { $disconnect?: (() => Promise<void>) | undefined };
    if (typeof injectedClient.$disconnect === "function") {
      await injectedClient.$disconnect();
    }
  });

  return app;
};
