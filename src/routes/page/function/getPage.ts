import type { FastifyReply, FastifyRequest } from "fastify";
import db from "../../../libs/db/db";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import type { NegativeResponse } from "../../../libs/utility/types/types";
import type { getPageSchema } from "../types/getPageSchema";
import type { getPageResponseSchema } from "../types/types";

export async function getPage(
  request: FastifyRequest<{
    Params: z.infer<typeof getPageSchema>;
    Reply: getPageResponseSchema | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<void> {
  const { pageNumber, langCode } = request.params;
  // TODO:Create View

  const queryString: string = `
  SELECT v.pageNumber as page_number,
	  JSON_AGG(
				  JSON_BUILD_OBJECT   (
								  'surahNumber', v.surahId, 
								  'verseNumber', v.verseNumber,
								  'verseText',v.text,
								  'verseTextSimplified',v.textSimplified, 
								  'verseTextNoVowel',v.textNoVowel, 
								  'translations',(SELECT JSON_OBJECT_AGG  (
																			  language.langCode,	JSON_BUILD_OBJECT(
																													  'transliteration', (SELECT transliteration FROM transliteration WHERE transliteration.langCode = language.langCode AND transliteration.verseId = v.Id),  
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
																																																 ) FROM footnote LEFT JOIN footnotetext ON footnotetext.Id = footnote.footnoteTextId LEFT JOIN translationText ON footnote.translationTextId = translationText.Id WHERE translationText.verseId = v.id AND translationText.translationId = trans.Id

																																												),
																																								  'translators', (SELECT JSON_AGG(
																																																	  (SELECT JSON_OBJECT_AGG(
																																																						  translator.name, JSON_BUILD_OBJECT(
																																																															  'lang', translator.langCode, 
																																																															  'url', translator.url
																																																															 )
																																																							  ) FROM translator WHERE translator.Id = transl.Id
																																																	  )
																																																  ) FROM translator as transl LEFT JOIN translator_translation as tt ON tt.translatorId = transl.Id LEFT JOIN translation ON translation.Id = tt.translationId WHERE translation.Id = trans.Id
																																												  )
																																								)
																																							  ) FROM translation as trans LEFT JOIN translationText ON translationText.translationId = trans.Id AND translationText.verseId = v.id WHERE trans.langCode = language.langCode
																																	  )
																													)
																			 ) FROM language WHERE ($2::text IS NULL OR language.langCode = $2::text)
													 )
									  )
			  ) as verse
  FROM verse as v
  WHERE v.pageNumber = $1
  GROUP BY v.pageNumber
`;

  try {
    const [data] = (
      await db.query<getPageResponseSchema>(queryString, [
        pageNumber,
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
