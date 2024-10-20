import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_UNAUTHORIZED_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { User } from "../../../libs/session/passport/type";
import { isPasswordTrue } from "../../../libs/utility/function/isPasswordTrue";
import { BadCredentialsResponse } from "../../auth/types/utility";
import db from "../../../libs/db/db";
import type { freezeUserSchema } from "../types/freezeUserSchema";
import type { ProcessResult } from "../../../libs/utility/types/types";

/*
  Implementation of function named: freeze_user_account():

    CREATE TYPE process_result AS (
      success BOOLEAN,
      message TEXT,
      code INT
    )
  CREATE OR REPLACE FUNCTION freeze_user_account(p_user_id UUID)
    RETURNS follow_process_result AS $$
    DECLARE
        result process_result
        last_status FREEZE_STATUS;
        last_freeze TIMESTAMPTZ;
        affected_rows INT;
    BEGIN
        -- Fetch the latest status and proceed_at for the user
        SELECT status, proceed_at INTO last_status, last_freeze
        FROM freeze_r
        WHERE user_id = p_user_id
        ORDER BY proceed_at DESC
        LIMIT 1
        -- Check for consecutive identical status
        IF last_status = 'frozen' THEN
            result.message := 'You cannot freeze your account again without unfreezing it first.';
            result.success := FALSE;
            result.code := 409; -- Unauthorized.
            RETURN result;
        END IF
        IF last_freeze IS NOT NULL AND CURRENT_TIMESTAMP < last_freeze + INTERVAL '7 days' THEN
            result.message := 'You cannot freeze your account within 7 days of the last freeze.';
            result.success := FALSE;
            result.code := 409; --Unauthorized.
            RETURN result;
        END IF
        -- Perform the insert
        INSERT INTO freeze_r (status, user_id) VALUES ('frozen', p_user_id)
        UPDATE "user" SET is_frozen = CURRENT_TIMESTAMP WHERE "user".id = p_user_id
        GET DIAGNOSTICS affected_rows = ROW_COUNT
        IF affected_rows = 0 THEN
          RAISE EXCEPTION 'Something went unexpectedly wrong.'
        END IF
        DELETE FROM session WHERE session.user_id = p_user_id
        GET DIAGNOSTICS affected_rows = ROW_COUNT
        IF affected_rows = 0 THEN
          RAISE EXCEPTION 'Something went unexpectedly wrong.'
        END IF
        result.message := 'Account frozen successfully.';
        result.code := 200; -- OK
        result.success := TRUE;
        RETURN result;
    END;
  $$ LANGUAGE plpgsql;
*/

export const freezeUser = async (
  request: FastifyRequest<{ Body: z.infer<typeof freezeUserSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { password } = request.body;

  const user = request.user as User;

  if (!(await isPasswordTrue(user, password)))
    return response.code(HTTP_UNAUTHORIZED_CODE).send(BadCredentialsResponse);

  try {
    const freezeUserQuery = `SELECT * FROM freeze_user_account($1)`;

    const {
      rows: [result],
    } = await db.query<ProcessResult>(freezeUserQuery, [user.id]);

    if (result === null) throw new Error("Something went unexpectedly wrong?");

    const { code, message } = result;

    await request.logOut();
    request.session.destroy();

    return response.code(code).send({ message, code });
  } catch (error) {
    console.error(error);
    return response
      .code(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
