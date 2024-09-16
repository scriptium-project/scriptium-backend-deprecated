import type { FastifyReply } from "fastify";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import type { getCollectionSchema } from "../types/getCollectionSchema";
import db from "../../../libs/db/db";
import type { GetCollectionType } from "../types/types";
import type { AuthenticatedRequest } from "../types/utility";

export const getCollection = async (
  request: AuthenticatedRequest<{ Body: z.infer<typeof getCollectionSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { collectionName } = request.body ?? {};

  const queryString = `
SELECT JSONB_OBJECT_AGG(collection.name, JSON_BUILD_OBJECT(
															'description', collection.description,
															'verses',(SELECT JSON_AGG(
																						              JSON_BUILD_OBJECT(
                                                                    'surahId', surah.id,
                                                                    'surahName', surah.surahNameAr,
                                                                    'verseCount', verse.verseNumber,
																						              					'text', verse.text,
																						              					'withoutVowel', verse.textNoVowel,
																						              					'note', collection_verse.note
																			 			              				          )
														 							              ) FROM collection_verse LEFT JOIN verse ON verse.Id = collection_verse.verseId LEFT JOIN surah ON verse.surahId = surah.id WHERE collection_verse.id = cv.id
														     		  )
														  )
						 ) as collections
FROM "user"
LEFT JOIN collection ON collection.userId = "user".id
LEFT JOIN collection_verse as cv on cv.collectionId = collection.Id
WHERE "user".id = $1 AND ($2::text IS NULL OR collection.name = $2::text)
      `;
  try {
    const result = await db.query<GetCollectionType>(queryString, [
      request.user.id,
      collectionName ?? null,
    ]);

    if (!result.rowCount)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_OK_CODE).send({ data: result.rows });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
