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
import type { NegativeResponse } from "../../../libs/utility/types/types";

export async function getVerse(
  request: FastifyRequest<{
    Params: z.infer<typeof getVerseSchema>;
    Reply: getVerseReplySchema | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<void> {
  const { surahNumber, verseNumber, langCode } = request.params;

  //TODO: Create View
  const queryString: string = `
  SELECT 
  surah.Id as surah_number, 
  surah.surahNameAr as surah_name_ar, 
  v.verseNumber as verse_number, 
  v.text as verse_text, 
  v.textSimplified as verse_text_simplified, 
  v.textNoVowel as verse_text_no_vowel, 
  (SELECT JSON_OBJECT_AGG(
						  transliteration.langCode, transliteration.transliteration
						 ) FROM transliteration WHERE transliteration.verseId = v.id AND ($3::text IS NULL OR transliteration.langCode = $3::text)
  ) as transliterations,
  (SELECT JSON_OBJECT_AGG(
						  surahMeaning.langCode, JSON_BUILD_OBJECT(
																	'surahName', surahMeaning.name,
																	'surahNameMeaning', surahMeaning.meaning
																   )
						 ) FROM surahMeaning WHERE surahMeaning.surahId = $1 AND ($3::text IS NULL OR surahMeaning.langCode = $3::text)
  ) as meaning,
  (SELECT JSON_OBJECT_AGG(
						   la.langCode, (SELECT JSON_OBJECT_AGG(
																   trans.name, JSON_BUILD_OBJECT(
																								   'translationName', trans.name,
																								  'translation', transText.translation,
																								  'translators', (SELECT JSON_OBJECT_AGG(
																																		  translator.name, JSON_BUILD_OBJECT(
																																											  'url',translator.url,
																																											  'lang', translator.langCode
																																											 )
																																		 ) FROM translator LEFT JOIN translator_translation as tt on tt.translatorId = translator.Id LEFT JOIN translation on tt.translationId = translation.Id WHERE translation.Id = trans.Id
																												 ),
																								  'footnote', (SELECT JSON_AGG(
																																  JSON_BUILD_OBJECT(
																																					  'text', footnotetext.text,
																																					  'index', footnote.index,
																																					  'number', footnote.number
																																				   )
																															   ) FROM  footnote LEFT JOIN footnotetext ON footnotetext.id = footnote.footnotetextId WHERE footnote.translationTextId = transText.id
																											   )
																								 )
																 )  FROM translation as trans LEFT JOIN translationText as transText ON trans.id = transText.translationId AND transText.verseId = v.id WHERE trans.langCode = la.langCode
										)
						 ) FROM language as la WHERE ($3::text IS NULL OR la.langCode = $3::text) 
  ) as translation,
  (SELECT JSON_AGG(
				   JSON_BUILD_OBJECT(
									   'word', word.text,
									   'root', JSON_BUILD_OBJECT(
																   'arabic',root.arabic,
																  'latin',root.latin
																 )
									)
				  ) FROM surah LEFT JOIN word ON word.verseId = v.id LEFT JOIN root ON root.id = word.rootId WHERE surah.id = $1
  ) AS word 
  FROM surah 
  LEFT JOIN verse as v on v.surahId = surah.id AND v.verseNumber = $2
  WHERE surah.id = $1
  GROUP BY surah.Id, v.id
`;

  try {
    const [data] = (
      await db.query<getVerseReplySchema>(queryString, [
        surahNumber,
        verseNumber,
        langCode ?? null,
      ])
    ).rows;

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
