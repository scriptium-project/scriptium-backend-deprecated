import type { FastifyReply, FastifyRequest } from "fastify";
import {
  CreatedResponse,
  HTTP_CREATED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import db from "../../../libs/db/db";
import type { createCommentSchema } from "../types/createCommentSchema";
import type { User } from "../../../libs/session/passport/type";
import type { Comment } from "../types/types";

export const createComment = async (
  request: FastifyRequest<{ Body: z.infer<typeof createCommentSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { chapterNumber, verseNumber, parentCommentId, comment } = request.body;

  const user = request.user as User;

  let queryString = `
    WITH verse_id AS (
    SELECT id FROM verse WHERE verseNumber = $1 AND chapterId = $2
  )
    INSERT INTO comment (userId, text, verseId) 
    VALUES ($3, $4, (SELECT id FROM verse_id)) RETURNING *;
    `;

  try {
    const {
      rows: [insertedComment],
    } = await db.query<Comment>(queryString, [
      verseNumber,
      chapterNumber,
      user.id,
      comment,
    ]);

    if (parentCommentId) {
      queryString =
        "INSERT INTO comment_comment (parent_comment_id, child_comment_id) VALUES ($1,$2)";
      await db.query(queryString, [parentCommentId, insertedComment.id]);
    }

    return response.code(HTTP_CREATED_CODE).send(CreatedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
