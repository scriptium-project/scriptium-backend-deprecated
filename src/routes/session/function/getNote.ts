import type { FastifyReply, FastifyRequest } from "fastify";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import db from "../../../libs/db/db";
import type { z } from "zod";
import type { getNotesSchema } from "../types/getNotesSchema";
import type { User } from "../../../libs/session/passport/type";

export const getNote = async (
  request: FastifyRequest<{
    Querystring: z.infer<typeof getNotesSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { chapterNumber, verseNumber } = request.query;

  const user = request.user as User;

  const queryString = `
    WITH verseId AS (
      SELECT id FROM verse WHERE ($1::text IS NULL OR verseNumber = $1::integer) AND ($2::text IS NULL OR chapterId = $2::integer)
    )

    SELECT * FROM notes JOIN verseId ON notes.verseId = verseId.id WHERE notes.userId = $3;`;

  try {
    const { rows: data } = await db.query(queryString, [
      verseNumber ?? null,
      chapterNumber ?? null,
      user.id,
    ]);

    return response
      .code(HTTP_ACCEPTED_CODE)
      .send({ data: { chapterNumber, verseNumber, notes: data } });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
