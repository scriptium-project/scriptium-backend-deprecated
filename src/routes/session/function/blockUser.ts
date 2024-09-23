import type { FastifyReply, FastifyRequest } from "fastify";
import {
  CreatedResponse,
  HTTP_CONFLICT_CODE,
  HTTP_CREATED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  InformationConflictedResponse,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";

import type { z } from "zod";
import type { blockUserSchema } from "../types/blockUserSchema";
import type { User } from "../../../libs/session/passport/type";
import db from "../../../libs/db/db";

export const blockUser = async (
  request: FastifyRequest<{ Body: z.infer<typeof blockUserSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;

  const user = request.user as User;

  if (user.username === username)
    return response
      .code(HTTP_CONFLICT_CODE)
      .send(InformationConflictedResponse);

  const queryString = `INSERT INTO block (blocker_id, blocked_id) VALUES ($1,(SELECT id FROM "user" WHERE username = $2)) ON CONFLICT DO NOTHING`;

  try {
    const { rowCount } = await db.query(queryString, [user.id, username]);

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_CREATED_CODE).send(CreatedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
