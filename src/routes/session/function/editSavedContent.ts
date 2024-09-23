import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import {
  DoneResponse,
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type { updateSavedContentSchema } from "../types/updateSavedContentSchema";
import db from "../../../libs/db/db";
import type { User } from "../../../libs/session/passport/type";

export const editSavedContent = async (
  request: FastifyRequest<{
    Body: z.infer<typeof updateSavedContentSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { chapterNumber, verseNumber, collectionName, newNote } = request.body;

  const user = request.user as User;

  const queryString =
    "UPDATE collection_verse SET note = $1 WHERE verseId = (SELECT id FROM verse WHERE chapterId = $2 AND verseNumber = $3) AND collectionId = (SELECT id FROM collection WHERE userId = $4 AND name = $5)";

  try {
    const { rowCount } = await db.query(queryString, [
      newNote,
      chapterNumber,
      verseNumber,
      user.id,
      collectionName ?? "", //If collectionName is undefined that means user wants to change the saving which situated in default collection.
    ]);

    //TODO: Remove this.
    if (rowCount ?? 0 > 1)
      throw new Error("Something went unexpectedly wrong?");

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_ACCEPTED_CODE).send(DoneResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
