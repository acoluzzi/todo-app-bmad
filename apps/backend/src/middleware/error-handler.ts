import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export const errorHandler = (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
): void => {
  reply.status(500).send({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: error.message
    }
  });
};
