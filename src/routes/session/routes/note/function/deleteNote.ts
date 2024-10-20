import type { FastifyReply, FastifyRequest } from "fastify";
import db from "../../../../../libs/db/db";
import {
  DoneResponse,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../../../libs/utility/types/utility";
import type { z } from "zod";
import type { User } from "../../../../../libs/session/passport/type";
import type { deleteNoteSchema } from "../types/deleteNoteSchema";

export const deleteNote = async (
  request: FastifyRequest<{ Body: z.infer<typeof deleteNoteSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { noteId } = request.body;

  const user = request.user as User;

  const queryString = `DELETE FROM note WHERE id = $1 AND user_id = $2`;

  try {
    const { rowCount } = await db.query(queryString, [noteId, user.id]);

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_OK_CODE).send(DoneResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
