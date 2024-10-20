import type { FastifyReply, FastifyRequest } from "fastify";
import {
  CreatedResponse,
  HTTP_CREATED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_UNAUTHORIZED_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import type { createNoteSchema } from "../types/createNoteSchema";

export const createNote = async (
  request: FastifyRequest<{ Body: z.infer<typeof createNoteSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { scriptureNumber, sectionNumber, chapterNumber, verseNumber, note } =
    request.body;

  const user = request.user as User;

  const queryString = `
  WITH verse_id AS (
    SELECT verse.id FROM verse LEFT JOIN chapter ON chapter.Id = verse.chapter_id LEFT JOIN section ON section.Id = chapter.section_id WHERE verse.verse_number = $1 AND chapter.chapter_number = $2 AND section.section_number = $3 AND section.scripture_id = $4
  )
    INSERT INTO note (user_id, text, verse_id) 
    VALUES ($5, $6, (SELECT id FROM verse_id));
  `;

  try {
    const { rowCount } = await db.query(queryString, [
      verseNumber,
      chapterNumber,
      sectionNumber,
      scriptureNumber,
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
