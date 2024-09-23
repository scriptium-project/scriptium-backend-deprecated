import type { FastifyReply, FastifyRequest } from "fastify";
import {
  CreatedResponse,
  HTTP_CREATED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_UNAUTHORIZED_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import type { createNoteSchema } from "../types/createNoteSchema";
import db from "../../../libs/db/db";
import type { User } from "../../../libs/session/passport/type";

export const createNote = async (
  request: FastifyRequest<{ Body: z.infer<typeof createNoteSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { chapterNumber, verseNumber, note } = request.body;

  const user = request.user as User;

  const queryString = `
  WITH verse_id AS (
    SELECT id FROM verse WHERE verseNumber = $1 AND chapterId = $2
  )
    INSERT INTO notes (userId, text, verseId) 
    VALUES ($3, $4, (SELECT id FROM verse_id));
  `;

  try {
    const { rowCount } = await db.query(queryString, [
      verseNumber,
      chapterNumber,
      user.id,
      note,
    ]);

    if ((rowCount ?? 0) === 0)
      return response
        .code(HTTP_UNAUTHORIZED_CODE)
        .send({ msg: "Exceeded the limit per verse." });

    return response.code(HTTP_CREATED_CODE).send(CreatedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
