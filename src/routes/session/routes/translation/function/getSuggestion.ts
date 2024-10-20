import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { getSuggestionsSchema } from "../types/getSuggestionsSchema";

export const getSuggestion = async (
  request: FastifyRequest<{ Params: z.infer<typeof getSuggestionsSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { scriptureNumber, sectionNumber, chapterNumber, verseNumber } =
    request.params;

  const user = request.user as User;

  const queryString = `
  SELECT
  sg.suggestion,
  sg.created_at,
  v.verse_number,
  c.chapter_number,
  s.section_number,
  sc.id as scripture_id,
  cm.meaning as chapter_meaning,
  sm.meaning as section_meaning,
  scm.meaning as scripture_meaning,
  tt.translation as translation,
  t.name as translation_name
FROM suggestion sg
LEFT JOIN translation_text tt ON tt.id = sg.translation_text_id
LEFT JOIN translation t ON t.id = tt.translation_id
LEFT JOIN verse v ON v.id = tt.verse_id
LEFT JOIN chapter c ON c.id = v.chapter_id
LEFT JOIN chapter_meaning cm ON cm.chapter_id = c.id
LEFT JOIN section s ON s.id = c.section_id
LEFT JOIN section_meaning sm ON sm.section_id = s.id
LEFT JOIN scripture sc ON sc.id = s.scripture_id
LEFT JOIN scripture_meaning scm ON scm.scripture_id = sc.id
WHERE sg.user_id = $1 
AND tt.verse_id = (
  SELECT verse.id 
  FROM verse 
  LEFT JOIN chapter ON chapter.id = verse.chapter_id 
  LEFT JOIN section ON section.id = chapter.section_id 
  WHERE verse.verse_number = $3 
  AND chapter.chapter_number = $4 
  AND section.section_number = $5 
  AND section.scripture_id = $6
)
AND cm.lang_id = $2 
AND sm.lang_id = cm.lang_id 
AND scm.lang_id = cm.lang_id;
`;
  console.log(request.params);
  try {
    const { rows: data } = await db.query(queryString, [
      user.id,
      user.preferred_languageid,
      verseNumber,
      chapterNumber,
      sectionNumber,
      scriptureNumber,
    ]);

    return response.send({ data });
  } catch (error) {
    console.error(error);
    return response
      .code(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
