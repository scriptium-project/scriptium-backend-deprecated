import type { FastifyReply } from "fastify";
import type { z } from "zod";
import {
  DoneResponse,
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type {
  NegativeResponse,
  PositiveResponse,
} from "../../../libs/utility/types/types";
import type { editSavedContentSchema } from "../types/editSavedContentSchema";
import db from "../../../libs/db/db";
import type { AuthenticatedRequest } from "../types/utility";

export const editSavedContent = async (
  request: AuthenticatedRequest<{
    Body: z.infer<typeof editSavedContentSchema>;
    Reply: PositiveResponse | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { surahNumber, verseNumber, collectionName, newNote } = request.body;

  const queryString =
    "UPDATE collection_verse SET note = $1 WHERE verseId = (SELECT id FROM verse WHERE surahId = $2 AND verseNumber = $3) AND collectionId = (SELECT id FROM collection WHERE userId = $4 AND name = $5)";
  try {
    const rowCount = (
      await db.query(queryString, [
        newNote,
        surahNumber,
        verseNumber,
        request.user.id,
        collectionName ?? "", //If collectionName is undefined that means user wants to change the saving which situated in default collection.
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
