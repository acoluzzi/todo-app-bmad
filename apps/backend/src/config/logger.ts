import type { FastifyBaseLogger, FastifyServerOptions } from "fastify";

export const loggerConfig: FastifyServerOptions["logger"] = {
  level: process.env.LOG_LEVEL ?? "info"
};

export const logStartup = (logger: FastifyBaseLogger, port: number): void => {
  logger.info({ port }, "Backend service is ready");
};
