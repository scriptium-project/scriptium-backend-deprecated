import type { FastifyReply, FastifyRequest } from "fastify";
import type { unfollowUserSchema } from "../types/unfollowSchema";
import db from "../../../libs/db/db";
import {
  DoneResponse,
  NotFoundResponse,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { User } from "../../../libs/session/passport/type";
import type { z } from "zod";

export const unfollowUser = async (
  request: FastifyRequest<{ Body: z.infer<typeof unfollowUserSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;
  const user = request.user as User;

  const queryString = `
    WITH followed_user AS (
      SELECT id FROM "user" WHERE username = $1 LIMIT 1
    )
    DELETE FROM follow
    USING followed_user
    WHERE follow.follower_id = $2
    AND follow.followed_id = followed_user.id
    AND follow.status = 'accepted'
    RETURNING follow.id;
  `;

  try {
    const {
      rows: [result],
    } = await db.query(queryString, [username, user.id]);

    if (!result)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_OK_CODE).send(DoneResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
