import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { rejectFollowRequestSchema } from "../types/rejectFollowRequestSchema";
import type { ProcessResult } from "../../../../../libs/utility/types/types";

export const rejectFollowRequest = async (
  request: FastifyRequest<{ Body: z.infer<typeof rejectFollowRequestSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;

  const user = request.user as User;

  try {
    const queryString = `SELECT success, message, code FROM reject_follow_request($1, $2)`;

    /*
    Declaration of function reject_follow_request:

    CREATE TYPE follow_process_result AS (
    success BOOLEAN,
    message TEXT,
    code INT
    );

    CREATE OR REPLACE FUNCTION reject_follow_request(p_follower_username TEXT, p_followed_id UUID)
      RETURNS follow_process_result AS $$
        DECLARE
            result follow_process_result;
            p_follower_id UUID;
            is_pending BOOLEAN;
            affected_rows INT;
            p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
        BEGIN
            -- Validate input parameters
            IF p_follower_username IS NULL OR p_followed_id IS NULL THEN
                result.success := FALSE;
                result.message := 'Invalid input parameters.';
                result.code := 400;  -- Bad Request
                RETURN result;
            END IF;

            -- Get the follower's ID
            SELECT id INTO p_follower_id
            FROM "user"
            WHERE username = p_follower_username;

            IF p_follower_id IS NULL THEN
                result.success := FALSE;
                result.message := 'Follower user not found.';
                result.code := 404;  -- Not Found
                RETURN result;
            END IF;

            -- Check if there is a pending follow request
            SELECT EXISTS (
                SELECT 1 FROM follow
                WHERE follower_id = p_follower_id
                  AND followed_id = p_followed_id
                  AND status = 'pending'
            ) INTO is_pending;

            IF NOT is_pending THEN
                result.success := FALSE;
                result.message := 'No pending follow request to reject.';
                result.code := 404;  -- Not Found
                RETURN result;
            END IF;

            -- Delete the pending follow request from the follow table
            DELETE FROM follow
            WHERE follower_id = p_follower_id
              AND followed_id = p_followed_id
              AND status = 'pending';

            GET DIAGNOSTICS affected_rows = ROW_COUNT;

            IF affected_rows > 0 THEN
                -- Insert a record into follow_r table with status 'rejected'
                INSERT INTO follow_r (follower_id, followed_id, status, occurred_at)
                VALUES (
                    p_follower_id,
                    p_followed_id,
                    'rejected'::FOLLOW_R_STATUS,
                    p_occurred_at
                );

                GET DIAGNOSTICS affected_rows = ROW_COUNT;

                IF affected_rows > 0 THEN
                    result.success := TRUE;
                    result.message := 'Follow request rejected successfully.';
                    result.code := 200;  -- OK
                    RETURN result;
                END IF;
                    RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation to prevent insertion process of follow_r table.
            ELSE
                result.success := FALSE;
                result.message := 'Failed to reject follow request.';
                result.code := 400;  -- Bad Request
                RETURN result;
            END IF;

        EXCEPTION
            WHEN OTHERS THEN
                RAISE EXCEPTION 'Internal server error: %', SQLERRM;
      END;
    $$ LANGUAGE plpgsql;

    */
    const {
      rows: [result],
    } = await db.query<ProcessResult>(queryString, [username, user.id]);

    // This shouldn't happen; the function always returns a result in possible cases.
    if (result === null) throw new Error("Something went unexpectedly wrong??");

    const { message, code } = result;

    return response.status(code).send({
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
