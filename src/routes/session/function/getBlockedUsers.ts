import type { FastifyReply, FastifyRequest } from "fastify";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { User } from "../../../libs/session/passport/type";
import db from "../../../libs/db/db";

export const getBlockedUsers = async (
  request: FastifyRequest,
  response: FastifyReply
): Promise<FastifyReply> => {
  const user = request.user as User;

  const queryString = `SELECT JSONB_AGG(subquery.data) as users
          FROM (
              SELECT JSONB_BUILD_OBJECT(
                  						'username', "user".username,
                  						'name', "user".name,
                  						'role', CASE WHEN "user".role_id IS NULL THEN 'user' ELSE role.role END,
          								'blocked_at', block.blocked_at
              						  ) AS data
              	FROM block
              	LEFT JOIN "user" ON block.blocked_id = "user".id
          		LEFT JOIN "role" ON "user".role_id = role.id
              	WHERE block.blocker_id = $1
              	ORDER BY block.blocked_at DESC
          	) AS subquery;`;
  try {
    const { rows: data } = await db.query<User[]>(queryString, [user.id]);

    return response.code(HTTP_ACCEPTED_CODE).send({ data });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
