import type { FastifyReply } from "fastify";
import type { z } from "zod";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_CONFLICT_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type {
  NegativeResponse,
  PositiveResponse,
} from "../../../libs/utility/types/types";
import type { saveContentSchema } from "../types/saveContentSchema";
import db from "../../../libs/db/db";

import type { GetCollectionIdType, GetVerseIdType } from "../types/types";
import type { AuthenticatedRequest } from "../types/utility";
import { AlreadySavedResponse, ContentSavedResponse } from "../types/utility";

export const saveContent = async (
  request: AuthenticatedRequest<{
    Body: z.infer<typeof saveContentSchema>;
    Reply: PositiveResponse | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { surahNumber, verseNumber, collectionName, note } = request.body;

  try {
    const [{ verse_id }] = (
      await db.query<GetVerseIdType>(
        "SELECT id as verse_id FROM verse WHERE surahid = $1 AND versenumber = $2",
        [surahNumber, verseNumber]
      )
    ).rows;

    //There might be no objects fetched from database, so in order to avoid "cannot read properties of undefined" error, we have to assign a default value.
    const [{ collection_id } = { collection_id: undefined }] = (
      await db.query<GetCollectionIdType>(
        "SELECT id as collection_id FROM collection WHERE userId = $1 AND name = $2",
        [request.user.id, collectionName ?? ""]
      )
    ).rows;

    if (!collection_id)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    const rowCount = (
      await db.query(
        "INSERT INTO collection_verse (collectionId, verseId, note) VALUES ($1,$2,$3) ON CONFLICT (collectionId, verseId) DO NOTHING",
        [collection_id, verse_id, note]
      )
    ).rowCount;

    if (!rowCount)
      return response.code(HTTP_CONFLICT_CODE).send(AlreadySavedResponse);

    return response.code(HTTP_ACCEPTED_CODE).send(ContentSavedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
