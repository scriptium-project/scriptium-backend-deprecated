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

import db from "../../../libs/db/db";
import type { deleteContentSchema } from "../types/deleteContentSchema";
import type { User } from "../../../libs/session/passport/type";

export const unsaveContent = async (
  request: FastifyRequest<{
    Body: z.infer<typeof deleteContentSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { chapterNumber, verseNumber, collectionName } = request.body;

  const user = request.user as User;

  const queryString =
    "DELETE FROM collection_verse WHERE verseid = (SELECT id FROM verse WHERE chapterId = $1 AND verseNumber = $2) AND collectionId = (SELECT id FROM collection WHERE userId = $3 AND name = $4)";

  try {
    const { rowCount } = await db.query(queryString, [
      chapterNumber,
      verseNumber,
      user.id,
      collectionName,
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
