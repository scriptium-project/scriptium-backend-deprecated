import type { FastifyReply, FastifyRequest } from "fastify";
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
import type { User } from "../../../libs/session/passport/type";

export const getCollection = async (
  request: FastifyRequest<{ Body: z.infer<typeof getCollectionSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { collectionName } = request.body ?? {};

  const user = request.user as User;

  const queryString = `
SELECT JSONB_OBJECT_AGG(collection.name, JSON_BUILD_OBJECT(
															'description', collection.description,
															'verses',(SELECT JSON_AGG(
																						              JSON_BUILD_OBJECT(
                                                                    'chapterId', chapter.id,
                                                                    'chapterName', chapter.chapterName,
                                                                    'verseCount', verse.verseNumber,
																						              					'text', verse.text,
																						              					'withoutVowel', verse.textNoVowel,
																						              					'note', collection_verse.note
																			 			              				          )
														 							              ) FROM collection_verse LEFT JOIN verse ON verse.Id = collection_verse.verseId LEFT JOIN chapter ON verse.chapterId = chapter.id WHERE collection_verse.id = cv.id
														     		  )
														  )
						 ) as collections
FROM "user"
LEFT JOIN collection ON collection.userId = "user".id
LEFT JOIN collection_verse as cv on cv.collectionId = collection.Id
WHERE "user".id = $1 AND ($2::text IS NULL OR collection.name = $2::text)`;

  try {
    const { rows, rowCount } = await db.query<GetCollectionType>(queryString, [
      user.id,
      collectionName ?? null,
    ]);

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_OK_CODE).send({ data: rows });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
