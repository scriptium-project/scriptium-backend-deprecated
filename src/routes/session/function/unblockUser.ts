import type { FastifyReply, FastifyRequest } from "fastify";
import {
  DoneResponse,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";

import type { z } from "zod";
import type { unblockUserSchema } from "../types/unblockUserSchema";
import type { User } from "../../../libs/session/passport/type";
import db from "../../../libs/db/db";

export const unblockUser = async (
  request: FastifyRequest<{ Body: z.infer<typeof unblockUserSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username } = request.body;

  const user = request.user as User;

  const queryString =
    'DELETE FROM block WHERE blocker_id = $1 AND blocked_id = (SELECT id FROM "user" WHERE username = $2)';
  try {
    const { rowCount } = await db.query(queryString, [user.id, username]);

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_OK_CODE).send(DoneResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
