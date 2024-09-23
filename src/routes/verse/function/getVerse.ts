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
  const { chapterNumber, verseNumber, langCode } = request.params;

  //TODO: Create View
  const queryString: string = `
  SELECT 
  chapter.Id as chapter_number, 
  chapter.chapterName as chapter_name, 
  v.verseNumber as verse_number, 
  v.text as verse_text, 
  v.textSimplified as verse_text_simplified, 
  v.textNoVowel as verse_text_no_vowel, 
  (SELECT JSON_OBJECT_AGG(
						  lang.langCode, transliteration.transliteration
						 ) FROM transliteration LEFT JOIN language lang ON lang.Id = transliteration.langId WHERE transliteration.verseId = v.id AND ($3::text IS NULL OR lang.langCode = $3::text)
  ) as transliterations,
  (SELECT JSON_OBJECT_AGG(
						               lang.langCode, JSON_BUILD_OBJECT(
																	                                   'chapterName', chapterMeaning.name,
																	                                   'chapterMeaning', chapterMeaning.meaning
																                                      )
						              ) FROM chapterMeaning LEFT JOIN language lang ON lang.Id = chapterMeaning.langId WHERE chapterMeaning.chapterId = $1 AND ($3::text IS NULL OR lang.langCode = $3::text)
  ) as meaning,
  (SELECT JSON_OBJECT_AGG(
						   la.langCode, (SELECT JSON_OBJECT_AGG(
																   trans.name, JSON_BUILD_OBJECT(
																								   'translationName', trans.name,
																								  'translation', transText.translation,
																								  'translators', (SELECT JSON_OBJECT_AGG(
																																		  translator.fullName, JSON_BUILD_OBJECT(
																																											  'url',translator.url,
																																											  'lang', lang.langCode
																																											 )
																																		 ) FROM translator LEFT JOIN translator_translation as tt on tt.translatorId = translator.Id LEFT JOIN translation on tt.translationId = translation.Id LEFT JOIN language lang ON lang.Id = translator.langId WHERE translation.Id = trans.Id
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
																 )  FROM translation as trans LEFT JOIN translationText as transText ON trans.id = transText.translationId AND transText.verseId = v.id WHERE trans.langId = la.Id
										)
						 ) FROM language as la WHERE ($3::text IS NULL OR la.langCode = $3::text) 
  ) as translation,
  (SELECT JSON_AGG(
				   JSON_BUILD_OBJECT(
									   'word', word.text,
									   'root', JSON_BUILD_OBJECT(
																  'own',root.own,
																  'latin',root.latin
																 )
									)
				  ) FROM chapter LEFT JOIN word ON word.verseId = v.id LEFT JOIN root ON root.id = word.rootId WHERE chapter.id = $1
  ) AS word 
  FROM chapter 
  LEFT JOIN verse as v on v.chapterId = chapter.id AND v.verseNumber = $2
  WHERE chapter.id = $1
  GROUP BY chapter.Id, v.id
`;

  try {
    const {
      rows: [data],
    } = await db.query<getVerseReplySchema>(queryString, [
      chapterNumber,
      verseNumber,
      langCode ?? null,
    ]);

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
