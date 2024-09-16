import type { FastifyReply } from "fastify";
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
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type { updateCollectionSchema } from "../types/editCollectionSchema";
import db from "../../../libs/db/db";
import type { AuthenticatedRequest } from "../types/utility";

export const updateCollection = async (
  request: AuthenticatedRequest<{
    Body: z.infer<typeof updateCollectionSchema>;
    Reply: PositiveResponse | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { collectionNewName, collectionName, collectionNewDescription } =
    request.body;

  const queryString =
    "UPDATE collection SET name = $1, description = $2 WHERE userId = $3 AND name = $4";

  try {
    const rowCount = (
      await db.query(queryString, [
        collectionNewName,
        collectionNewDescription,
        request.user.id,
        collectionName,
      ])
    ).rowCount;

    if (!rowCount)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    //TODO: Remove this.
    if (rowCount > 1) throw new Error("Something went unexpectedly wrong?");

    return response.code(HTTP_OK_CODE).send(DoneResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
