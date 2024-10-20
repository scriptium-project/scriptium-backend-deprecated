import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { acceptFollowRequestSchema } from "../types/acceptFollowRequestSchema";
import type { ProcessResult } from "../../../../../libs/utility/types/types";

export const acceptFollowRequest = async (
  request: FastifyRequest<{ Body: z.infer<typeof acceptFollowRequestSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;
  const user = request.user as User;

  const queryString = `SELECT success, message, code FROM accept_follow_request($1, $2)`;

  /*
  Declaration of function accept_follow_request:

  CREATE TYPE follow_process_result AS (
    success BOOLEAN,
    message TEXT,
    code INT
  );

  CREATE OR REPLACE FUNCTION accept_follow_request(p_follower_username TEXT, p_followed_id UUID)
    RETURNS follow_process_result AS $$
      DECLARE
          affected_rows INT;
          p_follower_id UUID;
          p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
          result follow_process_result;
      BEGIN
          -- Select follower ID
          SELECT id INTO p_follower_id
          FROM "user"
          WHERE "user".username = p_follower_username;

          -- Check if follower or followed ID is NULL
          IF p_follower_id IS NULL THEN
              result.success := FALSE;
              result.message := 'Follower not found, rolling back.';
              result.code := 404;
              RETURN result;
          ELSIF p_followed_id IS NULL THEN
              result.success := FALSE;
              result.message := 'Followed user not found, rolling back.';
              result.code := 404;
              RETURN result;
          END IF;

          UPDATE follow
          SET status = 'accepted', occurred_at = p_occurred_at
          WHERE follow.follower_id = p_follower_id
            AND follow.followed_id = p_followed_id
            AND follow.status = 'pending';

          GET DIAGNOSTICS affected_rows = ROW_COUNT;

          IF affected_rows > 0 THEN
              INSERT INTO follow_r (follower_id, followed_id, status, occurred_at)
              VALUES (p_follower_id, p_followed_id, 'accepted', p_occurred_at);

              GET DIAGNOSTICS affected_rows = ROW_COUNT;

              IF affected_rows > 0 THEN
                  result.success := TRUE;
                  result.message := 'Follow request accepted.';
                  result.code := 200;
                  RETURN result;
              ELSE
                  result.success := FALSE;
                  result.message := 'Failed to accept the follow request.';
                  result.code := 400;
                  RETURN result;
              END IF;
          ELSE
              result.success := FALSE;
              result.message := 'No pending follow request found.';
              result.code := 404;
              RETURN result;
          END IF;

      EXCEPTION
          WHEN OTHERS THEN
              result.success := FALSE;
              result.message := 'Transaction failed. Error: ' || SQLERRM;
              result.code := 503;
              RETURN result;
    END;
    $$ LANGUAGE plpgsql;

  */

  try {
    const {
      rows: [result],
    } = await db.query<ProcessResult>(queryString, [username, user.id]);

    // This shouldn't happen as the function always returns a result. TODO: Remove this.
    if (result === null) throw new Error("Something went unexpectedly wrong??");

    const { message, code } = result;

    return response.code(code).send({
      message,
      code,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
