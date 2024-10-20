import type { FastifyRequest, FastifyReply } from "fastify";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { z } from "zod";
import type { getSuggestionSchema } from "../types/getSuggestionSchema";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";

export const getSuggestions = async (
  request: FastifyRequest<{ Params: z.infer<typeof getSuggestionSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { quantity } = request.params;

  const user = request.user as User;

  const queryString = `
  SELECT
  sg.suggestion,
  sg.created_at,
  v.verse_number,
  c.id as chapter_id,
  s.id as section_id,
  sc.id as scripture_id,
  cm.meaning as chapter_meaning,
  sm.meaning as section_meaning,
  scm.meaning as scripture_meaning,
  tt.translation as translation,
  t.name as translation_name
  FROM suggestion sg
  LEFT JOIN translation_text tt ON tt.id = sg.translation_text_id
  LEFT JOIn translation t ON t.id = tt.translation_id
  LEFT JOIN verse v ON v.id = tt.verse_id
  LEFT JOIN chapter c ON c.id = v.chapter_id
  LEFT JOIN chapter_meaning cm ON cm.chapter_id = c.id
  LEFT JOIN section s ON s.id = c.section_id
  LEFT JOIN section_meaning sm ON sm.section_id = s.id
  LEFT JOIN scripture sc ON sc.id = s.scripture_id
  LEFT JOIN scripture_meaning scm ON scm.scripture_id = sc.id
  WHERE sg.user_id = $2 AND cm.lang_id = $1 AND sm.lang_id = cm.lang_id AND scm.lang_id = cm.lang_id
  ORDER BY created_at DESC
  LIMIT $3
`;

  try {
    const { rows: data } = await db.query(queryString, [
      user.preferred_languageid,
      user.id,
      quantity ?? null,
    ]);

    return response.send({ data });
  } catch (error) {
    console.error(error);
    return response
      .code(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
