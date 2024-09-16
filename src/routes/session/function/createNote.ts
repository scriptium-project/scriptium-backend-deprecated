import type { FastifyReply } from "fastify";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import type { createNoteSchema } from "../types/createNoteSchema";
import type { AuthenticatedRequest } from "../types/utility";
import type { User } from "../../../libs/session/passport/type";

export const createNote = async (
  request: AuthenticatedRequest<{ Body: z.infer<typeof createNoteSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  try {
    //TODO: Implement the rest. For now, this endpoint's purpose is only testing!

    const User: User = request.user;

    return response.code(HTTP_ACCEPTED_CODE).send({ user: request.user });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
