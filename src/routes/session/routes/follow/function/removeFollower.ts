import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { removeFollowerSchema } from "../types/removeFollowerSchema";
import type { ProcessResult } from "../../../../../libs/utility/types/types";

export const removeFollower = async (
  request: FastifyRequest<{ Body: z.infer<typeof removeFollowerSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;

  const user = request.user as User;

  try {
    const queryString = `SELECT success, message, code FROM remove_follower($1, $2)`;

    /*
    Declaration of function remove_follower:

    CREATE TYPE follow_process_result AS (
    success BOOLEAN,
    message TEXT,
    code INT
    );

    CREATE OR REPLACE FUNCTION remove_follower(p_followed_id UUID, p_follower_username TEXT)
      RETURNS follow_process_result AS $$
        DECLARE
            result follow_process_result;
            p_follower_id UUID;
            is_following BOOLEAN;
            affected_rows INT;
            p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
        BEGIN
            -- Validate input parameters
            IF p_followed_id IS NULL OR p_follower_username IS NULL THEN
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

            -- Check if the follower is actually following the followed user with status 'accepted'
            SELECT EXISTS (
                SELECT 1 FROM follow
                WHERE follower_id = p_follower_id
                  AND followed_id = p_followed_id
                  AND status = 'accepted'
            ) INTO is_following;

            IF NOT is_following THEN
                result.success := FALSE;
                result.message := 'The user is not following you.';
                result.code := 400;  -- Bad Request
                RETURN result;
            END IF;

            -- Delete the follow relationship
            DELETE FROM follow
            WHERE follower_id = p_follower_id
              AND followed_id = p_followed_id
              AND status = 'accepted';

            GET DIAGNOSTICS affected_rows = ROW_COUNT;

            IF affected_rows > 0 THEN
                -- Insert a record into follow_r table with status 'removed'
                INSERT INTO follow_r (follower_id, followed_id, status, occurred_at)
                VALUES (
                    p_follower_id,
                    p_followed_id,
                    'removed'::FOLLOW_R_STATUS,
                    p_occurred_at
                );

                GET DIAGNOSTICS affected_rows = ROW_COUNT;

                IF affected_rows > 0 THEN
                    result.success := TRUE;
                    result.message := 'Follower has been removed successfully.';
                    result.code := 200;  -- OK
                    RETURN result;
                ELSE
                    RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation that would prevent the insertion process in the follow_r table.
                END IF;
            ELSE
                result.success := FALSE;
                result.message := 'Failed to remove follower.';
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
    } = await db.query<ProcessResult>(queryString, [user.id, username]);

    // This shouldn't happen; the function always returns a result, in expected states.
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
