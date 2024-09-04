import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type {
  NegativeResponse,
  PositiveResponse,
} from "../../../libs/utility/types/types";
import {
  DoneResponse,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  HTTP_UNAUTHORIZED_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type { createCollectionSchema } from "../types/createCollectionSchema";
import { NotLoggedInResponse } from "../types/utility";
import db from "../../../libs/db/db";

export const deleteCollection = async (
  request: FastifyRequest<{
    Body: z.infer<typeof createCollectionSchema>;
    Reply: PositiveResponse | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<void> => {
  if (!request.user)
    return response.code(HTTP_UNAUTHORIZED_CODE).send(NotLoggedInResponse);

  const { collectionName } = request.body;

  const queryString = "DELETE FROM collection WHERE userId = $1 AND name = $2";

  try {
    const rowCount = (
      await db.query(queryString, [request.user.id, collectionName])
    ).rowCount;

    if (!rowCount)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_OK_CODE).send(DoneResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
