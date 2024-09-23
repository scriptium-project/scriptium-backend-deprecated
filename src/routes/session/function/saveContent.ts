import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_CONFLICT_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";

import type { createContentSchema } from "../types/createContentSchema";
import db from "../../../libs/db/db";

import type { GetCollectionIdType, GetVerseIdType } from "../types/types";
import { AlreadySavedResponse, ContentSavedResponse } from "../types/utility";
import type { User } from "../../../libs/session/passport/type";

export const saveContent = async (
  request: FastifyRequest<{
    Body: z.infer<typeof createContentSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { chapterNumber, verseNumber, collectionName, note } = request.body;

  const user = request.user as User;

  let queryString: string =
    "SELECT id as verse_id FROM verse WHERE chapterId = $1 AND verseNumber = $2";

  try {
    const [{ verse_id }] = (
      await db.query<GetVerseIdType>(queryString, [chapterNumber, verseNumber])
    ).rows;

    queryString =
      "SELECT id as collection_id FROM collection WHERE userId = $1 AND name = $2";

    //There might be no objects fetched from database, so in order to avoid "cannot read properties of undefined" error, we have to assign a default value.
    const [{ collection_id } = { collection_id: undefined }] = (
      await db.query<GetCollectionIdType>(queryString, [
        user.id,
        collectionName ?? "",
      ])
    ).rows;

    if (!collection_id)
      response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    const { rowCount } = await db.query(
      "INSERT INTO collection_verse (collectionId, verseId, note) VALUES ($1,$2,$3) ON CONFLICT (collectionId, verseId) DO NOTHING",
      [collection_id, verse_id, note]
    );

    //TODO: Remove this.
    if (rowCount ?? 0 > 1)
      throw new Error("Something went unexpectedly wrong!");

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_CONFLICT_CODE).send(AlreadySavedResponse);

    return response.code(HTTP_ACCEPTED_CODE).send(ContentSavedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
