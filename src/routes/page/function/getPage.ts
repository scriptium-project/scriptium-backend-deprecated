import type { FastifyReply, FastifyRequest } from "fastify";
import db from "../../../libs/db/db";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import type { getPageSchema } from "../types/getPageSchema";
import type { getPageResponseSchema } from "../types/types";

export async function getPage(
  request: FastifyRequest<{
    Params: z.infer<typeof getPageSchema>;
  }>,
  response: FastifyReply
): Promise<void | FastifyReply> {
  const { pageNumber, langCode } = request.params;
  // TODO:Create View

  const queryString: string = `
  SELECT v.pageNumber as page_number,
	  JSON_AGG(
				  JSON_BUILD_OBJECT   (
								  'chapterNumber', v.chapter_id, 
								  'verseNumber', v.verse_number,
								  'verseText',v.text,
								  'verseTextSimplified',v.textSimplified, 
								  'verseTextNoVowel',v.textNoVowel, 
								  'translations',(SELECT JSON_OBJECT_AGG  (
																			  language.lang_code,	JSON_BUILD_OBJECT(
																													  'transliteration', (SELECT transliteration FROM transliteration WHERE transliteration.lang_id = language.Id AND transliteration.verse_id = v.Id),  
																													  'translations', (SELECT JSON_OBJECT_AGG(
																																  trans.name, JSON_BUILD_OBJECT(  
																																								  'translationName', trans.name,
																																								  'translationText', (translationText.translation),
																																								  'footnote',  (SELECT JSON_AGG(
																																																   JSON_BUILD_OBJECT(
																																																					  'text', footnotetext.text,
																																																					  'index', footnote.index,
																																																					  'number', footnote.number
																																																					 )
																																																 ) FROM footnote LEFT JOIN footnotetext ON footnotetext.Id = footnote.footnoteTextId LEFT JOIN translationText ON footnote.translationTextId = translationText.Id WHERE translationText.verse_id = v.id AND translationText.translationId = trans.Id

																																												),
																																								  'translators', (SELECT JSON_AGG(
																																																	  (SELECT JSON_OBJECT_AGG(
																																																						  translator.fullName, JSON_BUILD_OBJECT(
																																																															  'lang', lang.lang_code, 
																																																															  'url', translator.url
																																																															 )
																																																							  ) FROM translator LEFT JOIN language lang ON lang.Id = translator.lang_id WHERE translator.Id = transl.Id
																																																	  )
																																																  ) FROM translator as transl LEFT JOIN translator_translation as tt ON tt.translatorId = transl.Id LEFT JOIN translation ON translation.Id = tt.translationId WHERE translation.Id = trans.Id
																																												  )
																																								)
																																							  ) FROM translation as trans LEFT JOIN translationText ON translationText.translationId = trans.Id AND translationText.verse_id = v.id WHERE trans.lang_id = language.Id
																																	  )
																													)
																			 ) FROM language WHERE ($2::text IS NULL OR language.lang_code = $2::text)
													 )
									  )
			  ) as verse
  FROM verse as v
  WHERE v.pageNumber = $1
  GROUP BY v.pageNumber
`;

  try {
    const {
      rows: [data],
    } = await db.query<getPageResponseSchema>(queryString, [
      pageNumber,
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
