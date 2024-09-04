import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import {
  DoneResponse,
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_UNAUTHORIZED_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type {
  NegativeResponse,
  PositiveResponse,
} from "../../../libs/utility/types/types";
import db from "../../../libs/db/db";
import { NotLoggedInResponse } from "../types/utility";
import type { unsaveContentSchema } from "../types/unsaveContentSchema";

export const unsaveContent = async (
  request: FastifyRequest<{
    Body: z.infer<typeof unsaveContentSchema>;
    Reply: PositiveResponse | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<void> => {
  if (!request.user)
    return response.code(HTTP_UNAUTHORIZED_CODE).send(NotLoggedInResponse);

  const { surahNumber, verseNumber, collectionName } = request.body;

  const queryString =
    "DELETE FROM collection_verse WHERE verseid = (SELECT id FROM verse WHERE surahId = $1 AND verseNumber = $2) AND collectionId = (SELECT id FROM collection WHERE userId = $3 AND name = $4)";

  try {
    const rowCount = (
      await db.query(queryString, [
        surahNumber,
        verseNumber,
        request.user.id,
        collectionName,
      ])
    ).rowCount;

    if (!rowCount)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    //TODO: Remove this.
    if (rowCount > 1) throw new Error("Something went unexpectedly wrong?");

    return response.code(HTTP_ACCEPTED_CODE).send(DoneResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
