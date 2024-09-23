import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
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
import type { User } from "../../../libs/session/passport/type";

export const createCollection = async (
  request: FastifyRequest<{
    Body: z.infer<typeof createCollectionSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { collectionName, description } = request.body;

  const queryString =
    "INSERT INTO collection (name, description, userId) VALUES ($1,$2,$3) ON CONFLICT (userId, name) DO NOTHING";

  try {
    const user = request.user as User;

    const { rowCount } = await db.query(queryString, [
      collectionName,
      description,
      user.id,
    ]);

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_CONFLICT_CODE).send(AlreadyCreatedResponse);

    return response.code(HTTP_CREATED_CODE).send(CreatedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
