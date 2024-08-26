import type { FastifyReply, FastifyRequest } from "fastify";
import db from "../../../libs/db";
import { versesInSurahs } from "../types/utility";
import type { getVerseReplySchema, getVerseSchema } from "../types/types";
import {
  AvailableLangCodes,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../utility";
import type {
  InternalServerErrorSchema,
  NotFoundResponseSchema,
} from "../../types";

export async function getVerse(
  request: FastifyRequest<{
    Params: getVerseSchema;
    Reply:
      | NotFoundResponseSchema
      | InternalServerErrorSchema
      | getVerseReplySchema;
  }>,
  response: FastifyReply
): Promise<void> {
  const { surahNumber, verseNumber, langCode } = request.params;

  if (
    !(versesInSurahs[surahNumber - 1] >= verseNumber === true ? true : false) ||
    (langCode && !AvailableLangCodes[langCode])
  )
    return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

  try {
    const queryString: string = `
								SELECT 
								surahs.Id as surah_number, 
								surahs.surahNameAr as surah_name_ar, 
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
																																'footnotes', (SELECT JSON_AGG(
																																								JSON_BUILD_OBJECT(
																																													'text', footnotesText.text,
																																													'index', footnotes.index,
																																													'number', footnotes.number
																																												 )
																																							 ) FROM  footnotes LEFT JOIN footnotestext ON footnotesText.id = footnotes.footnotetextId WHERE footnotes.translationTextId = transText.id
																																			 )
																								 							  )
														 									  )  FROM translation as trans LEFT JOIN translationText as transText ON trans.id = transText.translationId AND transText.verseId = v.id WHERE trans.langCode = la.langCode
																	  )
													   ) FROM languages as la WHERE ($3::text IS NULL OR la.langCode = $3::text) 
								) as translation,
								(SELECT JSON_AGG(
												 JSON_BUILD_OBJECT(
												 					'word', words.text,
																	 'root', JSON_BUILD_OBJECT(
																	 							'arabic',roots.arabic,
																								'latin',roots.latin
																	 						  )
																  )
												) FROM surahs LEFT JOIN words ON words.verseId = v.id LEFT JOIN roots ON roots.id = words.rootId WHERE surahs.id = $1
								) AS words 
								FROM surahs 
								LEFT JOIN verses as v on v.surahId = surahs.id AND v.verseNumber = $2
								WHERE surahs.id = $1
								GROUP BY surahs.Id, v.id
`;

    const [data] = (
      await db.query<getVerseReplySchema>(queryString, [
        surahNumber,
        verseNumber,
        langCode ?? null,
      ])
    ).rows;

    return response.code(HTTP_OK_CODE).send({ data });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
}
