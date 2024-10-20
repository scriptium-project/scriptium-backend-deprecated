import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import {
  HTTP_NOT_FOUND_CODE,
  NotFoundResponse,
  HTTP_ACCEPTED_CODE,
  DoneResponse,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { updateSavedContentSchema } from "../types/updateSavedContentSchema";

export const editSavedContent = async (
  request: FastifyRequest<{
    Body: z.infer<typeof updateSavedContentSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const {
    scriptureNumber,
    sectionNumber,
    chapterNumber,
    verseNumber,
    collectionName,
    newNote,
  } = request.body;

  const user = request.user as User;

  const queryString =
    "UPDATE collection_verse SET note = $5 WHERE verse_id = (SELECT verse.id FROM verse LEFT JOIN chapter ON chapter.Id = verse.chapter_id LEFT JOIN section ON section.Id = chapter.section_id WHERE verse.verse_number = $1 AND chapter.Id = $2 AND section.Id = $3 and section.scripture_id = $4 ) AND collection_id = (SELECT id FROM collection WHERE user_id = $6 AND name = $7)";

  try {
    const { rowCount } = await db.query(queryString, [
      verseNumber,
      chapterNumber,
      sectionNumber,
      scriptureNumber,
      newNote,
      user.id,
      collectionName ?? "", //If collectionName is undefined that means user wants to change the saving which situated in default collection.
    ]);

    //TODO: Remove this.
    if ((rowCount ?? 0) > 1)
      throw new Error("Something went unexpectedly wrong??");

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
