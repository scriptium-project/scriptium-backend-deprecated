/* eslint-disable indent */ //TODO:Remove this.
import type { FastifyReply, FastifyRequest } from "fastify";
import type { User } from "../../../libs/session/passport/type";
import type { z } from "zod";
import type { acceptFollowRequestSchema } from "../types/acceptFollowRequestSchema";
import db from "../../../libs/db/db";
import {
  AlreadyAcceptedResponse,
  DoneResponse,
  HTTP_BAD_REQUEST_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type { FollowRequestsStatus } from "../types/types";

export const acceptFollowRequest = async (
  request: FastifyRequest<{ Body: z.infer<typeof acceptFollowRequestSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;
  const user = request.user as User;

  const queryString = `
    WITH follower_user AS (
      SELECT id FROM "user" WHERE username = $1 LIMIT 1
    ),
    follow_status AS (
      SELECT follow.id, follow.status
      FROM follow
      JOIN follower_user u ON follow.follower_id = u.id
      WHERE follow.followed_id = $2
      LIMIT 1
    )
    UPDATE follow
    SET status = CASE 
      WHEN follow.status = 'pending' THEN 'accepted'
      ELSE follow.status
    END
    FROM follow_status
    WHERE follow.id = follow_status.id
    RETURNING 
      CASE 
        WHEN follow_status.status = 'accepted' THEN 'already_done'
        WHEN follow_status.status = 'pending' THEN 'done'
        ELSE 'not_found'
      END AS result;
  `;

  try {
    const {
      rows: [{ result } = { result: undefined }], //In case if the username, which user has claimed to be follower's username, cannot be found.
    } = await db.query<FollowRequestsStatus>(queryString, [username, user.id]);

    switch (result) {
      case "done":
        return response.code(HTTP_OK_CODE).send(DoneResponse);
      case "already_done":
        return response
          .code(HTTP_BAD_REQUEST_CODE)
          .send(AlreadyAcceptedResponse);
      default:
        return response.code(HTTP_BAD_REQUEST_CODE).send(NotFoundResponse);
    }
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
