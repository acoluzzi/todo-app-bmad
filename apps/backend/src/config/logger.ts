import type { FastifyBaseLogger, FastifyServerOptions } from "fastify";

const allowedLogLevels = new Set(["fatal", "error", "warn", "info", "debug", "trace", "silent"]);
const requestedLogLevel = process.env.LOG_LEVEL;

export const loggerConfig: FastifyServerOptions["logger"] = {
  level: requestedLogLevel && allowedLogLevels.has(requestedLogLevel) ? requestedLogLevel : "info"
};

export const logStartup = (logger: FastifyBaseLogger, port: number): void => {
  logger.info({ port }, "Backend service is ready");
};
