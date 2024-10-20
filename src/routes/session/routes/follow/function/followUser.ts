import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { followUserSchema } from "../types/followUserSchema";
import type { ProcessResult } from "../../../../../libs/utility/types/types";

export const followUser = async (
  request: FastifyRequest<{ Body: z.infer<typeof followUserSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;
  const user = request.user as User;

  try {
    const queryString = `SELECT success, message, code FROM follow_user($1, $2)`;
    /*
    Declaration of function follow_user:

    CREATE TYPE follow_process_result AS (
    success BOOLEAN,
    message TEXT,
    code INT
    );

    CREATE OR REPLACE FUNCTION follow_user(p_follower_id UUID, p_followed_username TEXT)
      RETURNS follow_process_result AS $$
        DECLARE
            result follow_process_result;
            p_followed_id UUID;
            is_private TIMESTAMP;
            is_blocked BOOLEAN;
            is_already_following BOOLEAN;
            p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
            follow_status FOLLOW_STATUS;
            affected_rows INT;
        BEGIN
            IF p_follower_id IS NULL OR p_followed_username IS NULL THEN
                result.success := FALSE;
                result.message := 'Invalid input parameters.';
                result.code := 400;
                RETURN result;
            END IF;

            SELECT u.id, u.is_private
            INTO p_followed_id, is_private
            FROM "user" u
            WHERE u.username = p_followed_username;

            IF p_followed_id IS NULL THEN
                result.success := FALSE;
                result.message := 'Followed user not found.';
                result.code := 404;
                RETURN result;
            END IF;

            IF p_follower_id = p_followed_id THEN
                result.success := FALSE;
                result.message := 'You cannot follow yourself.';
                result.code := 409;
                RETURN result;
            END IF;

            -- Check if the follower is blocked by the followed user
            SELECT EXISTS (
                SELECT 1 FROM block
                WHERE blocker_id = p_followed_id AND blocked_id = p_follower_id
            ) INTO is_blocked;

            IF is_blocked THEN
                result.success := FALSE;
                result.message := 'Something went wrong.';
                result.code := 403;
                RETURN result;
            END IF;

            -- Check if the follower is already following the followed user
            SELECT EXISTS (
                SELECT 1 FROM follow
                WHERE follower_id = p_follower_id AND followed_id = p_followed_id
            ) INTO is_already_following;

            IF is_already_following THEN
                result.success := FALSE;
                result.message := 'You are already following this user.';
                result.code := 409;
                RETURN result;
            END IF;

            -- Determine the follow status based on the followed user's privacy setting
            IF is_private IS NOT NULL THEN
                follow_status := 'pending';
            ELSE
                follow_status := 'accepted';
            END IF;

            -- Insert into the follow table
            INSERT INTO follow (follower_id, followed_id, status, occurred_at)
            VALUES (p_follower_id, p_followed_id, follow_status, p_occurred_at);

            GET DIAGNOSTICS affected_rows = ROW_COUNT;

            IF affected_rows > 0 THEN
                INSERT INTO follow_r (follower_id, followed_id, status, occurred_at)
                VALUES (
                    p_follower_id,
                    p_followed_id,
                     (CASE WHEN follow_status = 'accepted' THEN 'automatically_accepted' ELSE 'pending' END)::FOLLOW_R_STATUS,
                    p_occurred_at
                );

                GET DIAGNOSTICS affected_rows = ROW_COUNT;

                IF affected_rows > 0 THEN
                    result.code := 201;
                    result.message := CASE WHEN follow_status = 'accepted' THEN 'Followed!' ELSE 'Follow request has been sent!' END;
                    result.success := TRUE;
                    RETURN result;
                END IF;
                    RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation to prevent insertion process of follow_r table.
            ELSE
                result.code := 400;
                result.message := 'Follow process could not be completed for an unknown reason.';
                result.success := FALSE;
                RETURN result;
            END IF;

        EXCEPTION
            WHEN unique_violation THEN
                result.success := FALSE;
                result.message := 'A follow request already exists.';
                result.code := 409;
                RETURN result;
            WHEN OTHERS THEN
                RAISE EXCEPTION 'Internal server error: %', SQLERRM;
      END;
    $$ LANGUAGE plpgsql;
    */

    const {
      rows: [result],
    } = await db.query<ProcessResult>(queryString, [user.id, username]);

    // This shouldn't happen; the function always returns a result in possible situations. TODO: Remove this.
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
