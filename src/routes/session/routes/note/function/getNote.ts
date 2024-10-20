// src/routes/comment/getOwnComments.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import db from "../../../../../libs/db/db";
import type { z } from "zod";
import type { User } from "../../../../../libs/session/passport/type";
import type { getNotesSchema } from "../types/getNotesSchema";

export const getNote = async (
  request: FastifyRequest<{
    Params: z.infer<typeof getNotesSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { scriptureNumber, sectionNumber, chapterNumber, verseNumber } =
    "scriptureNumber" in request.params ? request.params : {};

  console.log(request.params);

  const user = request.user as User;

  const queryString = `
    WITH verse_id AS (
      SELECT verse.id 
      FROM verse
      LEFT JOIN chapter c ON c.id = verse.chapter_id
      LEFT JOIN section s ON s.id = c.section_id
      WHERE ($1::text IS NULL OR verse.verse_number = $1::integer) 
        AND ($2::text IS NULL OR c.chapter_number = $2::integer)
        AND ($3::text IS NULL OR s.section_number = $3::integer)
        AND ($4::text IS NULL OR s.scripture_id = $4::integer)
    )

    SELECT 
      note.id, 
      note.user_id, 
      note.text, 
      note.verse_id, 
      note.created_at, 
      note.updated_at,
      
      -- Count of comments associated with the note
      (SELECT COUNT(*) FROM comment_note WHERE comment_note.note_id = note.id) AS comment_count,
      
      -- Count of likes associated with the note
      (SELECT COUNT(*) FROM like_note WHERE like_note.note_id = note.id) AS like_count
      
    FROM note 
    JOIN verse_id ON note.verse_id = verse_id.id 
    WHERE note.user_id = $5;
  `;

  try {
    const { rows: data, rowCount: count } = await db.query(queryString, [
      verseNumber ?? null,
      chapterNumber ?? null,
      sectionNumber ?? null,
      scriptureNumber ?? null,
      user.id,
    ]);

    return response.code(HTTP_ACCEPTED_CODE).send({
      data: {
        scriptureNumber,
        sectionNumber,
        chapterNumber,
        verseNumber,
        count,
        notes: data,
      },
    });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
