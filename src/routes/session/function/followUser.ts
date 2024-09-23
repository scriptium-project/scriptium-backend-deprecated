import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { followUserSchema } from "../types/followUserSchema";
import type { User } from "../../../libs/session/passport/type";
import db from "../../../libs/db/db";
import {
  CreatedResponse,
  HTTP_BAD_REQUEST_CODE,
  HTTP_CONFLICT_CODE,
  HTTP_CREATED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_FORBIDDEN_CODE,
  InformationConflictedResponse,
  InternalServerErrorResponse,
  SomethingWentWrongResponse,
} from "../../../libs/utility/types/utility";
import type { FollowInformation } from "../types/types";

export const followUser = async (
  request: FastifyRequest<{ Body: z.infer<typeof followUserSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;

  const user = request.user as User;

  let queryString = `
  SELECT 
    u.id, 
    u.is_private, 
    b.blocker_id IS NOT NULL AS is_blocked, 
    f.follower_id IS NOT NULL AS is_already_following
  FROM "user" u
  LEFT JOIN block b ON b.blocker_id = u.id AND b.blocked_id = $1
  LEFT JOIN follow f ON f.follower_id = $1 AND f.followed_id = u.id
  WHERE u.username = $2
  LIMIT 1;
`;

  try {
    const {
      rows: [result],
    } = await db.query<FollowInformation>(queryString, [user.id, username]);

    if (!result)
      return response
        .code(HTTP_BAD_REQUEST_CODE)
        .send(SomethingWentWrongResponse);

    if (result.is_blocked)
      return response
        .code(HTTP_FORBIDDEN_CODE)
        .send(SomethingWentWrongResponse);

    if (result.is_already_following)
      return response
        .code(HTTP_CONFLICT_CODE)
        .send(InformationConflictedResponse);

    queryString = `
      INSERT INTO follow (follower_id, followed_id, status) 
      VALUES ($1, $2, $3)
    `;

    const { rowCount } = await db.query(queryString, [
      user.id,
      result.id,
      result.is_private ? "pending" : "accepted",
    ]);

    if ((rowCount ?? 0) === 0)
      return response
        .code(HTTP_BAD_REQUEST_CODE)
        .send(SomethingWentWrongResponse);

    return response.code(HTTP_CREATED_CODE).send(CreatedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
