/* eslint-disable indent */ //TODO: Remove this.
import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { removeFollowerSchema } from "../types/removeFollowerSchema";
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
import db from "../../../libs/db/db";
import type { FollowRequestsStatus } from "../types/types";

export const removeFollower = async (
  request: FastifyRequest<{ Body: z.infer<typeof removeFollowerSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;

  const user = request.user as User;

  const queryString = `
    WITH follower_user AS (
    SELECT id FROM "user" WHERE username = $1 LIMIT 1
    ), follow_request AS (
        SELECT follow.id, follow.follower_id, follow.followed_id, follow.status
        FROM follow
        LEFT JOIN follower_user u ON follow.follower_id = u.id
        WHERE follow.followed_id = $2
        LIMIT 1
    )
     DELETE FROM follow
     USING follow_request
     WHERE follow_request.id = follow.id
     AND follow_request.status = 'accepted'
     RETURNING
     CASE
        WHEN follow_request.status = 'accepted' THEN 'done'
        ELSE 'already_done'
     END as result
    `;
  try {
    const {
      rows: [{ result } = { result: undefined }], //In case if the username, which user has claimed to be follower's username, cannot be found.
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
      .code(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
