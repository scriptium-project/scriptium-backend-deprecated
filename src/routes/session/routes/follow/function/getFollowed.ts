import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import {
  HTTP_OK_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { getFollowedSchema } from "../types/getFollowedSchema";
import type { FollowerGetType } from "../types/types";

export const getFollowed = async (
  request: FastifyRequest<{ Params: z.infer<typeof getFollowedSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { type } = request.params; //variable type can be 2 possible strings: "pending" | "accepted"

  const user = request.user as User;

  const queryString = `
      SELECT u.username, u.name, u.surname, follow.occurred_at
      FROM follow
      JOIN "user" u ON follow.followed_id = u.id
      WHERE follow.status = $1 AND follow.follower_id = $2;
    `;

  try {
    const { rows: followed } = await db.query<FollowerGetType>(queryString, [
      type,
      user.id,
    ]);

    return response.code(HTTP_OK_CODE).send({
      data: {
        followedCount: followed.length,
        followed,
      },
    });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
