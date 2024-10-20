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
import type { updateCollectionSchema } from "../types/updateCollectionSchema";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";

export const updateCollection = async (
  request: FastifyRequest<{
    Body: z.infer<typeof updateCollectionSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { collectionNewName, collectionName, collectionNewDescription } =
    request.body;

  const user = request.user as User;

  const queryString =
    "UPDATE collection SET name = $1, description = $2 WHERE user_id = $3 AND name = $4";

  try {
    const { rowCount } = await db.query(queryString, [
      collectionNewName ?? collectionName,
      collectionNewDescription,
      user.id,
      collectionName,
    ]);

    //TODO: Remove this.
    if ((rowCount ?? 0) > 1)
      throw new Error("Something went unexpectedly wrong??");

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
