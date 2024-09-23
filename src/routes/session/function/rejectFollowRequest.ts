/* eslint-disable indent */ //TODO: Remove this.
import type { FastifyReply, FastifyRequest } from "fastify";
import db from "../../../libs/db/db";
import {
  AlreadyAcceptedResponse,
  DoneResponse,
  HTTP_BAD_REQUEST_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type { User } from "../../../libs/session/passport/type";
import type { FollowRequestsStatus } from "../types/types";
import type { z } from "zod";
import type { rejectFollowRequestSchema } from "../types/rejectFollowRequestSchema";

export const rejectFollowRequest = async (
  request: FastifyRequest<{ Body: z.infer<typeof rejectFollowRequestSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;

  const user = request.user as User;

  const queryString = `
WITH follower_user AS (
  SELECT id FROM "user" WHERE username = $1 LIMIT 1
), follow_status AS (
  SELECT f.id, f.status
  FROM follow f
  JOIN follower_user u ON f.follower_id = u.id
  WHERE f.followed_id = $2
  LIMIT 1
)
  DELETE FROM follow
  USING follow_status
  WHERE follow.id = follow_status.id
  AND follow_status.status = 'pending'
  RETURNING  
    CASE 
      WHEN follow_status.status = 'pending' THEN 'done'
      ELSE 'already_done'
    END AS result;
  `;

  try {
    const {
      rows: [{ result } = { result: undefined }],
    } = await db.query<FollowRequestsStatus>(queryString, [username, user.id]);

    switch (result) {
      case "already_done":
        return response
          .code(HTTP_BAD_REQUEST_CODE)
          .send(AlreadyAcceptedResponse);
      case "done":
        return response.code(HTTP_OK_CODE).send(DoneResponse);
      default:
        return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);
    }
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
