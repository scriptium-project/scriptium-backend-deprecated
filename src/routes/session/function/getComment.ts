import type { FastifyReply, FastifyRequest } from "fastify";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import db from "../../../libs/db/db";
import type { getCommentSchema } from "../types/getCommentSchema";
import type { User } from "../../../libs/session/passport/type";

export const getComment = async (
  request: FastifyRequest<{ Querystring: z.infer<typeof getCommentSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { chapterNumber, verseNumber } = request.query;

  const user = request.user as User;

  const queryString = `
           WITH verseId AS (
              SELECT id FROM verse WHERE ($1::text IS NULL OR verseNumber = $1::integer) AND ($2::text IS NULL OR chapterId = $2::integer)
          )

        SELECT 
            comment.userId as creator,
            comment.text as content,
            comment.created_at, 
            comment.updated_at,
            CASE 
                WHEN comment_comment.child_comment_id IS NOT NULL THEN true
                ELSE false
            END AS isSubComment
        FROM comment
        JOIN verseId ON comment.verseId = verseId.id
        LEFT JOIN comment_comment ON comment.id = comment_comment.child_comment_id
        WHERE comment.userId = $3`;

  try {
    const { rows: data } = await db.query(queryString, [
      verseNumber ?? null,
      chapterNumber ?? null,
      user.id,
    ]);

    return response
      .code(HTTP_OK_CODE)
      .send({ data: { chapterNumber, verseNumber, comments: data } });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
