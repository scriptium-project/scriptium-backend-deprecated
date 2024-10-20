import type { FastifyReply, FastifyRequest } from "fastify";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { z } from "zod";
import type { getNotificationsSchema } from "../types/getNotificationsSchema";

/*
    Implementation of function named get_user_notifications()

    CREATE OR REPLACE FUNCTION get_user_notifications(
        p_recipient_id UUID,
        p_limit INT DEFAULT 10
    ) RETURNS JSON AS $$
    DECLARE
        notifications JSON := '[]'::JSON;
    BEGIN
        SELECT json_agg(notification_json) INTO notifications
        FROM (
            SELECT json_build_object(
                'id', n.id,
                'recipient_id', n.recipient_id,
                'actor_id', n.actor_id,
                'actor_username', a.username,
                'notification_type', n.notification_type,
                'entity_type', n.entity_type,
                'entity_id', n.entity_id,
                'created_at', n.created_at,
                'is_read', n.is_read,
                'details',
                    CASE
                        WHEN n.notification_type = 'like' THEN json_build_object(
                            'liked_content',
                                CASE
                                    WHEN n.entity_type = 'comment' THEN c.text
                                    WHEN n.entity_type = 'note' THEN nt.text
                                    ELSE NULL
                                END
                        )
                        WHEN n.notification_type = 'reply' THEN json_build_object(
                            'replied_comment_text', parent_c.text
                        )
                        WHEN n.notification_type IN ('follow', 'follow_pending') THEN json_build_object(
                            'follower_username', a.username
                        )
                        ELSE NULL
                    END
            ) AS notification_json
            FROM
                notification n
            JOIN "user" a ON n.actor_id = a.id
            LEFT JOIN "comment" c ON n.entity_type = 'comment' AND n.entity_id = c.id
            LEFT JOIN "note" nt ON n.entity_type = 'note' AND n.entity_id = nt.id
            LEFT JOIN "comment" parent_c ON n.notification_type = 'reply' AND n.entity_id = parent_c.id
            WHERE
                n.recipient_id = p_recipient_id
            ORDER BY
                n.created_at DESC
            LIMIT
                p_limit
        ) AS subquery(notification_json);

        RETURN COALESCE(notifications, '[]'::JSON);
    END;
    $$ LANGUAGE plpgsql;
*/
export const getNotification = async (
  request: FastifyRequest<{ Params: z.infer<typeof getNotificationsSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { quantity } = request.params;

  const user = request.user as User;

  const queryString = `SELECT get_user_notifications($1, $2) AS notifications;`;
  try {
    const { rows: data } = await db.query(queryString, [
      user.id,
      quantity ?? null, //Implies bring all notifications.
    ]);

    return response.code(HTTP_ACCEPTED_CODE).send({ data });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
