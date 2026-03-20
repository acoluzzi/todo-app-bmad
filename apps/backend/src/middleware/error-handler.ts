import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

const isBodyParsingError = (error: FastifyError): boolean => {
  return error.code === "FST_ERR_CTP_EMPTY_JSON_BODY" || error.code === "FST_ERR_CTP_INVALID_JSON_BODY";
};

export const errorHandler = (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const statusCode = error.statusCode ?? 500;

  if (isBodyParsingError(error)) {
    reply.status(400).send({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: [
          {
            path: "body",
            message: isProduction ? "Request body must contain valid JSON." : error.message
          }
        ]
      }
    });
    return;
  }

  if (statusCode >= 400 && statusCode < 500) {
    reply.status(statusCode).send({
      error: {
        code: error.code ?? "BAD_REQUEST",
        message: error.message
      }
    });
    return;
  }

  reply.status(500).send({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isProduction ? "Internal server error" : error.message
    }
  });
};
