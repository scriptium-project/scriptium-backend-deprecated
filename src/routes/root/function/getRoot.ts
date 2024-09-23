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
import type { getRootResponseSchema } from "../types/types";
import type { getRootSchema } from "../types/getRootSchema";

export async function getRoot(
  request: FastifyRequest<{
    Params: z.infer<typeof getRootSchema>;
  }>,
  response: FastifyReply
): Promise<void | FastifyReply> {
  const { rootLatin, langCode } = request.params;

  //TODO: Create View

  const queryString: string = `
 WITH verse_data AS (
    SELECT 
        root.latin,
        root.own,
        NULL as meaning,
        JSON_AGG(
        		  JSON_BUILD_OBJECT(
        							          'chapterNumber', verse.chapterId,
        							          'verseNumber', verse.versenumber,
        							          'verseText', verse.text,
        							          'transliteration', transliteration.transliteration,
        							          'sequence', word.sequenceNumber,
        							          'word', word.text,
        							          'meaning', NULL
        					  	          )
        		      ) as verse
    FROM root
    LEFT JOIN word ON word.rootId = root.Id
    LEFT JOIN verse ON word.verseId = verse.Id
    LEFT JOIN transliteration ON transliteration.verseId = verse.Id
    LEFT JOIN language lang ON transliteration.langId = lang.Id
    WHERE root.latin = $1 AND ($2::text IS NULL OR lang.langCode = $2::text)
    GROUP BY root.latin, root.own
                )
SELECT 
    latin,
    own,
    meaning,
    verse,
    json_array_length(verse) AS verse_count
FROM verse_data;
`;

  try {
    const {
      rows: [data],
    } = await db.query<getRootResponseSchema>(queryString, [
      rootLatin,
      langCode ?? null,
    ]);

    if (!data) return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    response.code(HTTP_OK_CODE).send({ data });

    //Caching
    await db.query("INSERT INTO cache (key, data) VALUES ($1,$2)", [
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
