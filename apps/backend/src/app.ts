import Fastify from "fastify";

import type { PrismaClient } from "./generated/prisma/client.js";
import { loggerConfig } from "./config/logger.js";
import { disconnectPrisma, getPrismaClient } from "./config/prisma.js";
import { errorHandler } from "./middleware/error-handler.js";
import { registerHealthRoute } from "./modules/health.route.js";
import { TodoRepository } from "./modules/todos/todo.repository.js";
import { createTodoRoutes } from "./modules/todos/todo.route.js";
import { TodoService } from "./modules/todos/todo.service.js";

export type AppOptions = {
  prismaClient?: PrismaClient;
};

export const createApp = (options?: AppOptions) => {
  const app = Fastify({ logger: loggerConfig });

  const usesManagedPrismaClient = options?.prismaClient === undefined;
  const prismaClient = options?.prismaClient ?? getPrismaClient();
  const todoRepository = new TodoRepository(prismaClient);
  const todoService = new TodoService(todoRepository);

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
