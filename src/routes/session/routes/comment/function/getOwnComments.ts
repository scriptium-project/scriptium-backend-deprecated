import type { FastifyReply, FastifyRequest } from "fastify";
import {
  HTTP_OK_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";

export const getOwnComments = async (
  request: FastifyRequest,
  response: FastifyReply
): Promise<FastifyReply> => {
  const user = request.user as User;

  try {
    const queryString = `
    -- Comments attached to verses or notes
    SELECT
      c.id,
      u.username AS creator,
      c.text AS content,
      c.created_at, 
      c.updated_at,
      ch.chapter_number,
      v.verse_number,
      cn.note_id,
      CASE
        WHEN c.parent_comment_id IS NOT NULL THEN 
          JSON_BUILD_OBJECT(
            'comment', cc.text,
            'author', CASE 
              WHEN cu.id = $1 THEN cu.username
              WHEN f.status = 'accepted' THEN cu.username 
              ELSE '@unknown' 
            END
          )
        ELSE NULL 
      END AS parentComment
    FROM comment c
    LEFT JOIN comment_verse cv ON c.id = cv.comment_id
    LEFT JOIN verse v ON cv.verse_id = v.id
    LEFT JOIN chapter ch ON v.chapter_id = ch.id
    LEFT JOIN comment_note cn ON c.id = cn.comment_id
    LEFT JOIN comment cc ON cc.id = c.parent_comment_id
    LEFT JOIN "user" u ON u.id = c.user_id
    LEFT JOIN "user" cu ON cc.user_id = cu.id
    LEFT JOIN follow f ON f.follower_id = $1 AND f.followed_id = cu.id
    WHERE c.user_id = $1;
  `;

    const { rows: data, rowCount: count } = await db.query(queryString, [
      user.id,
    ]);

    return response.code(HTTP_OK_CODE).send({
      data: {
        count,
        comments: data,
      },
    });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
