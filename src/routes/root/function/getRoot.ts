// getRoot.ts

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
  const { rootLatin, langCode, scriptureNumber } = request.params;

  const queryString: string = `
  WITH verse_data AS (
    SELECT 
      root.latin,
      root.own,
      NULL as meaning,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'chapterNumber', c.id,
          'verseNumber', v.verse_number,
          'verseText', v.text,
          'transliteration', t.transliteration,
          'sequence', w.sequence_number,
          'word', w.text,
          'meaning', NULL
        ) ORDER BY v.id
      ) AS verses
    FROM root
    JOIN word w ON w.root_id = root.id
    JOIN verse v ON w.verse_id = v.id
    JOIN chapter c ON v.chapter_id = c.id
    JOIN section s ON c.section_id = s.id
    JOIN scripture sc ON s.scripture_id = sc.id
    LEFT JOIN transliteration t ON t.verse_id = v.id AND ($3::text IS NULL OR t.lang_id = (SELECT id FROM language WHERE lang_code = $3))
    WHERE root.latin = $1
      AND root.scripture_id = $2
    GROUP BY root.latin, root.own
  )
  SELECT 
    latin,
    own,
    meaning,
    verses,
    json_array_length(verses) AS verse_count
  FROM verse_data;
  `;

  try {
    const {
      rows: [data],
    } = await db.query<getRootResponseSchema>(queryString, [
      rootLatin,
      scriptureNumber,
      langCode ?? null,
    ]);

    if (!data) return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    response.code(HTTP_OK_CODE).send({ data });

    // Caching
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
