import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { retrieveRequestSchema } from "../types/retrieveRequestSchema";
import type { ProcessResult } from "../../../../../libs/utility/types/types";

export const retrieveRequest = async (
  request: FastifyRequest<{ Body: z.infer<typeof retrieveRequestSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;

  const user = request.user as User;

  try {
    const queryString = `SELECT success, message, code FROM retrieve_follow_request($1, $2)`;

    /*
    Declaration of function retrieve_follow_request:

    CREATE TYPE follow_process_result AS (
    success BOOLEAN,
    message TEXT,
    code INT
    );

    CREATE OR REPLACE FUNCTION retrieve_follow_request(p_follower_id UUID, p_followed_username TEXT)
      RETURNS follow_process_result AS $$
        DECLARE
            result follow_process_result;
            p_followed_id UUID;
            is_pending BOOLEAN;
            affected_rows INT;
            p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
        BEGIN
            -- Validate input parameters
            IF p_follower_id IS NULL OR p_followed_username IS NULL THEN
                result.success := FALSE;
                result.message := 'Invalid input parameters.';
                result.code := 400;  -- Bad Request
                RETURN result;
            END IF;

            -- Get the followed user's ID
            SELECT id INTO p_followed_id
            FROM "user"
            WHERE username = p_followed_username;

            IF p_followed_id IS NULL THEN
                result.success := FALSE;
                result.message := 'User not found.';
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
                result.message := 'No pending follow request to retrieve.';
                result.code := 400;  -- Bad Request
                RETURN result;
            END IF;

            -- Delete the pending follow request from the follow table
            DELETE FROM follow
            WHERE follower_id = p_follower_id
              AND followed_id = p_followed_id
              AND status = 'pending';

            GET DIAGNOSTICS affected_rows = ROW_COUNT;

            IF affected_rows > 0 THEN
                -- Insert a record into follow_r table with status 'retrieved'
                INSERT INTO follow_r (follower_id, followed_id, status, occurred_at)
                VALUES (
                    p_follower_id,
                    p_followed_id,
                    'retrieved'::FOLLOW_R_STATUS,
                    p_occurred_at
                );

                GET DIAGNOSTICS affected_rows = ROW_COUNT;

                IF affected_rows > 0 THEN
                    result.success := TRUE;
                    result.message := 'Follow request retrieved successfully.';
                    result.code := 200;  -- OK
                    RETURN result;
                ELSE
                    RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation that would prevent the insertion process in the follow_r table.
                END IF;
            ELSE
                result.success := FALSE;
                result.message := 'Failed to retrieve follow request.';
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

    // This shouldn't happen; the function always returns a result
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
