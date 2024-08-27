import type { FastifyReply, FastifyRequest } from "fastify";
import type { getRootResponseSchema, getRootSchema } from "../types/types";
import db from "../../../libs/db";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../utility";
import type { InternalServerErrorSchema } from "../../types";
import type { z } from "zod";

export async function getRoot(
  request: FastifyRequest<{
    Params: z.infer<typeof getRootSchema>;
    Reply: getRootResponseSchema | InternalServerErrorSchema;
  }>,
  response: FastifyReply
): Promise<void> {
  const { rootLatin } = request.params;

  try {
    const queryString: string = `
  SELECT 
        roots.latin,
        roots.arabic,
        NULL as meaning,
        JSON_AGG(
        		  JSON_BUILD_OBJECT(
        							'surahNumber', verses.surahId,
        							'verseNumber', verses.versenumber,
        							'verseText', verses.text,
        							'transliteration',transliteration.transliteration,
        							'sequence', words.sortNumber,
        							'word', words.text,
        							'meaning', NULL
        					  	   )
        		) as verses
        FROM roots
        LEFT JOIN words ON words.rootId = roots.Id
        LEFT JOIN verses ON words.verseId = verses.Id
        LEFT JOIN transliteration ON transliteration.verseId = verses.Id AND transliteration.langCode = 'tr'
        WHERE roots.latin = $1
        GROUP BY roots.latin, roots.arabic

`;
    const [data] = (
      await db.query<getRootResponseSchema>(queryString, [rootLatin])
    ).rows;

    return data
      ? response.code(HTTP_OK_CODE).send({ data })
      : response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
}
