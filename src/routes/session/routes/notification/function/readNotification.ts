import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { readNotificationsSchema } from "../types/readNotificationsSchema";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import type { ProcessResult } from "../../../../../libs/utility/types/types";
/*
    Implementation of function named mark_notifications_as_read()

    CREATE OR REPLACE FUNCTION mark_notifications_as_read(
        p_user_id UUID,
        p_notification_ids BIGINT[]
    ) RETURNS process_result AS $$
    DECLARE
        result process_result;
        updated_count INT;
    BEGIN
        -- Update the notifications that match the IDs and belong to the user
        UPDATE notification
        SET is_read = TRUE
        WHERE recipient_id = p_user_id
          AND id = ANY(p_notification_ids)
          AND is_read = FALSE;

        -- Get the number of rows updated
        GET DIAGNOSTICS updated_count = ROW_COUNT;

        IF updated_count > 0 THEN
            result.success := TRUE;
            result.message := updated_count || ' notifications marked as read.';
            result.code := 200; -- OK
        ELSE
            result.success := FALSE;
            result.message := 'No notifications were updated.';
            result.code := 404; -- Not Found
        END IF;

        RETURN result;
    END;
    $$ LANGUAGE plpgsql;
*/

export const readNotifications = async (
  request: FastifyRequest<{ Body: z.infer<typeof readNotificationsSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { notificationIds } = request.body;

  const user = request.user as User;

  const queryString =
    "SELECT message, code, success FROM mark_notifications_as_read($1, $2)";

  try {
    const {
      rows: [result],
    } = await db.query<ProcessResult>(queryString, [user.id, notificationIds]);

    if (result === null) throw new Error("Something went unexpectedly wrong??");

    const { code, message } = result;

    return response.code(code).send({ message, code });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
