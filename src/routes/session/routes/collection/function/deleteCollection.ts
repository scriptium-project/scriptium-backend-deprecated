import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";

import {
  DoneResponse,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../../../libs/utility/types/utility";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import type { deleteCollectionSchema } from "../types/deleteCollectionSchema";

export const deleteCollection = async (
  request: FastifyRequest<{
    Body: z.infer<typeof deleteCollectionSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { collectionName } = request.body;

  const user = request.user as User;

  const queryString = "DELETE FROM collection WHERE user_id = $1 AND name = $2";

  try {
    const { rowCount } = await db.query(queryString, [user.id, collectionName]);

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
