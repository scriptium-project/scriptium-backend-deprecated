import type { FastifyReply } from "fastify";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import db from "../../../libs/db/db";
import type { z } from "zod";
import type { getNotesSchema } from "../types/getNotesSchema";
import type { AuthenticatedRequest } from "../types/utility";

export const getNote = async (
  request: AuthenticatedRequest<{
    Querystring: z.infer<typeof getNotesSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { surahNumber, verseNumber } = request.query;
  const queryString = `
    WITH verseId AS (
      SELECT id FROM verse WHERE ($1::text IS NULL OR verseNumber = $1::integer) AND ($2::text IS NULL OR surahId = $2::integer)
    )

    SELECT * FROM notes WHERE notes.verseId = verseId AND notes.userId = $3
  `;

  try {
    const data = (
      await db.query(queryString, [
        verseNumber ?? null,
        surahNumber ?? null,
        request.user.id,
      ])
    ).rows;

    return response.code(HTTP_ACCEPTED_CODE).send({ data });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
