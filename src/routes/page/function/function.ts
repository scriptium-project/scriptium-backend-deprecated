import type { FastifyReply, FastifyRequest } from "fastify";
import type { getPageResponseSchema, getPageSchema } from "../types/types";
import db from "../../../libs/db";
import type { InternalServerErrorSchema } from "../../types";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
} from "../../utility";
import type { z } from "zod";

export async function getPage(
  request: FastifyRequest<{
    Params: z.infer<typeof getPageSchema>;
    Reply: getPageResponseSchema | InternalServerErrorSchema;
  }>,
  response: FastifyReply
): Promise<void> {
  const { pageNumber, langCode } = request.params;

  try {
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
	    																									languages.langCode,	JSON_BUILD_OBJECT(
	    																																			'transliteration', (SELECT transliteration FROM transliteration WHERE transliteration.langCode = languages.langCode AND transliteration.verseId = v.Id),  
	    																																			'translations', (SELECT JSON_OBJECT_AGG(
	    																																						trans.name, JSON_BUILD_OBJECT(  
	    																																														'translationName', trans.name,
	    																																														'translationText', (translationText.translation),
	    																																														'footnotes',  (SELECT JSON_AGG(
	    																																																						 JSON_BUILD_OBJECT(
	    																																																										    'text', footnotesText.text,
	    																																																											'index', footnotes.index,
	    																																																											'number', footnotes.number
	    																																																						 				  )
	    																																																					   ) FROM footnotes LEFT JOIN footnotesText ON footnotesText.Id = footnotes.footnoteTextId LEFT JOIN translationText ON footnotes.translationTextId = translationText.Id WHERE translationText.verseId = v.id AND translationText.translationId = trans.Id
	    
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
	    																																													) FROM translation as trans LEFT JOIN translationText ON translationText.translationId = trans.Id AND translationText.verseId = v.id WHERE trans.langCode = languages.langCode
	    																																							)
	    																																		  )
	    																   								) FROM languages WHERE ($2::text IS NULL OR languages.langCode = $2::text)
	    										   								)
	    														    )
	    									) as verse
	    						FROM verses as v
	    						WHERE v.pageNumber = $1
	    						GROUP BY v.pageNumber
`;

    const [data] = (
      await db.query<getPageResponseSchema>(queryString, [
        pageNumber,
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
