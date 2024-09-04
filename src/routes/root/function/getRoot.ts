import type { FastifyReply, FastifyRequest } from "fastify";
import db from "../../../libs/db/db";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import type { NegativeResponse } from "../../../libs/utility/types/types";
import type { getRootResponseSchema } from "../types/types";
import type { getRootSchema } from "../types/getRootSchema";

export async function getRoot(
  request: FastifyRequest<{
    Params: z.infer<typeof getRootSchema>;
    Reply: getRootResponseSchema | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<void> {
  const { rootLatin } = request.params;

  //TODO: Create View

  const queryString: string = `
  SELECT 
        root.latin,
        root.arabic,
        NULL as meaning,
        JSON_AGG(
        		  JSON_BUILD_OBJECT(
        							'surahNumber', verse.surahId,
        							'verseNumber', verse.versenumber,
        							'verseText', verse.text,
        							'transliteration',transliteration.transliteration,
        							'sequence', word.sortNumber,
        							'word', word.text,
        							'meaning', NULL
        					  	   )
        		) as verse
        FROM root
        LEFT JOIN word ON word.rootId = root.Id
        LEFT JOIN verse ON word.verseId = verse.Id
        LEFT JOIN transliteration ON transliteration.verseId = verse.Id AND transliteration.langCode = 'tr'
        WHERE root.latin = $1
        GROUP BY root.latin, root.arabic

`;

  try {
    const [data] = (
      await db.query<getRootResponseSchema>(queryString, [rootLatin])
    ).rows;

    if (!data) return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    response.code(HTTP_OK_CODE).send({ data });

    //Caching
    await db.query("INSERT INTO cache (cache_key, data) VALUES ($1,$2)", [
      request.url,
      data,
    ]);

    return;
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
}
