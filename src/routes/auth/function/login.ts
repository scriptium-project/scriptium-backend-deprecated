import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { loginSchema } from "../types/loginSchema";
import db from "../../../libs/db/db";
import type { User } from "../../../libs/session/passport/type";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_UNAUTHORIZED_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import { BadCredentialsResponse, LoggedInResponse } from "../types/utility";
import { isPasswordTrue } from "../../../libs/utility/function/isPasswordTrue";
import { SelectFromUserExceptPasswordQuery } from "../../../libs/session/passport/passport";
import type { ProcessResult } from "../../../libs/utility/types/types";

/**
    Implementation of function named unfreeze_user_account():

    CREATE OR REPLACE FUNCTION unfreeze_user_account(p_user_id UUID)
    RETURNS process_result AS $$
    DECLARE
        result process_result;
        is_frozen TIMESTAMPTZ;
        affected_rows INT;
    BEGIN
        -- Validate input parameter
        IF p_user_id IS NULL THEN
            result.success := FALSE;
            result.message := 'Invalid user ID.';
            result.code := 400;  -- Bad Request
            RETURN result;
        END IF;

        -- Check if the user account is frozen
        SELECT "user".is_frozen INTO is_frozen
        FROM "user"
        WHERE id = p_user_id;

        IF is_frozen IS NULL THEN
            result.success := TRUE;
            result.message := 'Account is not frozen.';
            result.code := 200;  -- OK
            RETURN result;
        END IF;

        UPDATE "user"
        SET is_frozen = NULL
        WHERE id = p_user_id;

        GET DIAGNOSTICS affected_rows := ROW_COUNT;

        IF affected_rows > 0 THEN

        INSERT INTO freeze_r (status, user_id)
        VALUES ('unfrozen', p_user_id);

            GET DIAGNOSTICS affected_rows := ROW_COUNT;

            IF affected_rows > 0 THEN
                result.success := TRUE;
                result.message := 'Account has been unfrozen.';
                result.code := 200;  -- OK
                RETURN result;
            END IF;

        RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation that would prevent the insertion process in the freeze_r table.
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Internal Server Error. Error: %', SQLERRM;
    END;
    $$ LANGUAGE plpgsql;

 */

export const login = async (
  request: FastifyRequest<{
    Body: z.infer<typeof loginSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { identifier, password } = request.body;

  const queryString = `
    ${SelectFromUserExceptPasswordQuery}
    WHERE username = $1 OR email = $1
    LIMIT 1
  `;

  try {
    const {
      rows: [user],
    } = await db.query<User>(queryString, [identifier]);

    if (!user) {
      return response.code(HTTP_UNAUTHORIZED_CODE).send(BadCredentialsResponse);
    }

    if (!(await isPasswordTrue(user, password))) {
      return response.code(HTTP_UNAUTHORIZED_CODE).send(BadCredentialsResponse);
    }

    if (user.is_frozen !== null) {
      const unfreezeQuery = `SELECT * FROM unfreeze_user_account($1)`;

      const {
        rows: [result],
      } = await db.query<ProcessResult>(unfreezeQuery, [user.id]);

      if (result === null)
        throw new Error("Something went unexpectedly wrong??");

      const { success, message, code } = result;

      if (!success) return response.code(code).send({ message, code });
    }

    await request.logIn(user);

    return response.code(HTTP_ACCEPTED_CODE).send(LoggedInResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
