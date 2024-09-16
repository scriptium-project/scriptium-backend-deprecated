import type { FastifyReply } from "fastify";
import type { z } from "zod";
import type {
  NegativeResponse,
  PositiveResponse,
} from "../../../libs/utility/types/types";
import {
  AlreadyCreatedResponse,
  CreatedResponse,
  HTTP_CONFLICT_CODE,
  HTTP_CREATED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { createCollectionSchema } from "../types/createCollectionSchema";
import db from "../../../libs/db/db";
import type { AuthenticatedRequest } from "../types/utility";

export const createCollection = async (
  request: AuthenticatedRequest<{
    Body: z.infer<typeof createCollectionSchema>;
    Reply: PositiveResponse | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { collectionName, description } = request.body;

  const queryString =
    "INSERT INTO collection (name, description, userId) VALUES ($1,$2,$3) ON CONFLICT (userId, name) DO NOTHING";

  try {
    const rowCount = (
      await db.query(queryString, [
        collectionName,
        description,
        request.user.id,
      ])
    ).rowCount;

    if (!rowCount)
      return response.code(HTTP_CONFLICT_CODE).send(AlreadyCreatedResponse);

    return response.code(HTTP_CREATED_CODE).send(CreatedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
