import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../../../libs/utility/types/utility";
import type { User } from "../../../../../libs/session/passport/type";
import type { updateNoteSchema } from "../types/updateNoteSchema";
import { ContentSavedResponse } from "../../../types/utility";

export const updateNote = async (
  request: FastifyRequest<{ Body: z.infer<typeof updateNoteSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { noteId, note } = request.body;

  const user = request.user as User;

  const queryString = `UPDATE note SET text = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`;

  try {
    const { rowCount } = await db.query(queryString, [note, noteId, user.id]);

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_OK_CODE).send(ContentSavedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
