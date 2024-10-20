import type { FastifyReply, FastifyRequest } from "fastify";
import db from "../../../libs/db/db";
import type { getVerseReplySchema } from "../types/types";
import type { z } from "zod";
import type { getVerseSchema } from "../types/getVerseSchema";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";

export async function getVerse(
  request: FastifyRequest<{
    Params: z.infer<typeof getVerseSchema>;
  }>,
  response: FastifyReply
): Promise<void> {
  const {
    scriptureNumber,
    sectionNumber,
    chapterNumber,
    verseNumber,
    langCode,
  } = request.params;

  const queryString: string = `
WITH verse_data AS (
  SELECT
    s.id AS scripture_id,
    s.scripture_name AS scripture_name,
    sec.id AS section_id,
    sec.section_name AS section_name,
    c.id AS chapter_id,
    c.chapter_name AS chapter_name,
    v.verse_number AS verse_number,
    v.text AS verse_text,
    v.text_simplified AS verse_text_simplified,
    v.text_no_vowel AS verse_text_no_vowel,
    v.id AS verse_id
  FROM scripture s
  JOIN section sec ON sec.scripture_id = s.id AND sec.id = $2
  JOIN chapter c ON c.section_id = sec.id AND c.id = $3
  JOIN verse v ON v.chapter_id = c.id AND v.verse_number = $4
  WHERE s.id = $1
),
transliterations AS (
  SELECT
    vd.verse_id,
    JSON_OBJECT_AGG(lang.lang_code, t.transliteration) AS transliterations
  FROM verse_data vd
  JOIN transliteration t ON t.verse_id = vd.verse_id
  JOIN language lang ON lang.id = t.lang_id
  WHERE ($5::text IS NULL OR lang.lang_code = $5::text)
  GROUP BY vd.verse_id
),
scripture_meanings AS (
  SELECT
    sm.scripture_id,
    JSON_OBJECT_AGG(lang.lang_code, sm.meaning) AS scripture_meanings
  FROM scripture_meaning sm
  JOIN language lang ON lang.id = sm.lang_id
  WHERE sm.scripture_id = (SELECT scripture_id FROM verse_data)
    AND ($5::text IS NULL OR lang.lang_code = $5::text)
  GROUP BY sm.scripture_id
),
section_meanings AS (
  SELECT
    sm.section_id,
    JSON_OBJECT_AGG(lang.lang_code, sm.meaning) AS section_meanings
  FROM section_meaning sm
  JOIN language lang ON lang.id = sm.lang_id
  WHERE sm.section_id = (SELECT section_id FROM verse_data)
    AND ($5::text IS NULL OR lang.lang_code = $5::text)
  GROUP BY sm.section_id
),
chapter_meanings AS (
  SELECT
    cm.chapter_id AS chapter_id,
    JSON_OBJECT_AGG(lang.lang_code, cm.meaning) AS chapter_meanings
  FROM chapter_meaning cm
  JOIN language lang ON lang.id = cm.lang_id
  WHERE cm.chapter_id = (SELECT chapter_id FROM verse_data)
    AND ($5::text IS NULL OR lang.lang_code = $5::text)
  GROUP BY cm.chapter_id
),
words AS (
  SELECT
    vd.verse_id,
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'word', w.text,
        'root', JSON_BUILD_OBJECT(
          'own', r.own,
          'latin', r.latin
        ),
        'meanings', wm.meanings
      )
    ) AS words
  FROM verse_data vd
  JOIN word w ON w.verse_id = vd.verse_id
  LEFT JOIN root r ON r.id = w.root_id
  LEFT JOIN (
    SELECT
      word_id,
      JSON_OBJECT_AGG(lang.lang_code, wm.meaning) AS meanings
    FROM word_meaning wm
    JOIN language lang ON lang.id = wm.lang_id
    WHERE ($5::text IS NULL OR lang.lang_code = $5::text)
    GROUP BY word_id
  ) wm ON wm.word_id = w.id
  GROUP BY vd.verse_id
),
translations_translators AS (
  SELECT
    lang.lang_code,
    t.name AS translation_name,
    JSON_OBJECT_AGG(tr.full_name, tr.url) FILTER (WHERE tr.full_name IS NOT NULL) AS translators
  FROM verse_data vd
  JOIN translation_text tt ON tt.verse_id = vd.verse_id
  JOIN translation t ON t.id = tt.translation_id
  JOIN language lang ON lang.id = t.lang_id
  LEFT JOIN translator_translation tt_tr ON tt_tr.translation_id = t.id
  LEFT JOIN translator tr ON tr.id = tt_tr.translator_id
  WHERE t.name IS NOT NULL
  GROUP BY lang.lang_code, t.name
),
translations_footnotes AS (
  SELECT
    lang.lang_code,
    t.name AS translation_name,
    f.number::text AS footnote_number,
    JSON_BUILD_OBJECT(
      'indexes', ARRAY_AGG(f.index ORDER BY f.index),
      'footnoteText', MAX(ft.text)
    ) AS footnote_detail
  FROM verse_data vd
  JOIN translation_text tt ON tt.verse_id = vd.verse_id
  JOIN translation t ON t.id = tt.translation_id
  JOIN language lang ON lang.id = t.lang_id
  LEFT JOIN footnote f ON f.translation_text_id = tt.id
  LEFT JOIN footnote_text ft ON ft.id = f.footnote_text_id
  WHERE t.name IS NOT NULL AND f.number IS NOT NULL AND ft.text IS NOT NULL
  GROUP BY lang.lang_code, t.name, f.number
),
translations_aggregated_footnotes AS (
  SELECT
    lang_code,
    translation_name,
    JSON_OBJECT_AGG(footnote_number, footnote_detail) AS footnotes
  FROM translations_footnotes
  GROUP BY lang_code, translation_name
),
translations_final AS (
  SELECT
    tt.lang_code,
    tt.translation_name,
    tt.translators,
    af.footnotes
  FROM translations_translators tt
  LEFT JOIN translations_aggregated_footnotes af
    ON tt.lang_code = af.lang_code AND tt.translation_name = af.translation_name
),
translations_by_language AS (
  SELECT
    lang_code,
    JSON_OBJECT_AGG(translation_name, JSON_BUILD_OBJECT(
      'translators', translators,
      'footnotes', footnotes
    )) FILTER (WHERE translation_name IS NOT NULL) AS translations
  FROM translations_final
  GROUP BY lang_code
),
all_languages AS (
  SELECT
    lang.lang_code,
    tbl.translations
  FROM language lang
  LEFT JOIN translations_by_language tbl ON tbl.lang_code = lang.lang_code
),
translations_final_json AS (
  SELECT
    JSON_OBJECT_AGG(lang.lang_code, lang.translations) AS translations
  FROM all_languages lang
)
SELECT
  vd.*,
  t.transliterations,
  sm.scripture_meanings,
  sem.section_meanings,
  cm.chapter_meanings,
  w.words,
  tfj.translations
FROM verse_data vd
LEFT JOIN transliterations t ON t.verse_id = vd.verse_id
LEFT JOIN scripture_meanings sm ON sm.scripture_id = vd.scripture_id
LEFT JOIN section_meanings sem ON sem.section_id = vd.section_id
LEFT JOIN chapter_meanings cm ON cm.chapter_id = vd.chapter_id
LEFT JOIN words w ON w.verse_id = vd.verse_id
LEFT JOIN translations_final_json tfj ON TRUE;
`;

  try {
    const {
      rows: [data],
    } = await db.query<getVerseReplySchema>(queryString, [
      scriptureNumber,
      sectionNumber,
      chapterNumber,
      verseNumber,
      langCode ?? null,
    ]);

    response.code(HTTP_OK_CODE).send({ data });
    // Caching
    await db.query("INSERT INTO cache (key, data) VALUES ($1, $2)", [
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
