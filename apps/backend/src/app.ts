import Fastify from "fastify";

import { loggerConfig } from "./config/logger.js";
import { disconnectPrisma } from "./config/prisma.js";
import { errorHandler } from "./middleware/error-handler.js";
import { registerHealthRoute } from "./modules/health.route.js";

export const createApp = () => {
  const app = Fastify({ logger: loggerConfig });

  app.setErrorHandler(errorHandler);
  app.register(registerHealthRoute, { prefix: "/api/v1" });
  app.addHook("onClose", async () => {
    await disconnectPrisma();
  });

  return app;
};
