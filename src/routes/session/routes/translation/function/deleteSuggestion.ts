import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { deleteSuggestionSchema } from "../types/deleteSuggestionSchema";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import type { ProcessResult } from "../../../../../libs/utility/types/types";

export const deleteSuggestion = async (
  request: FastifyRequest<{ Body: z.infer<typeof deleteSuggestionSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const {
    translationName,
    scriptureNumber,
    sectionNumber,
    chapterNumber,
    verseNumber,
  } = request.body;

  const user = request.user as User;
  const queryString =
    "SELECT success, message, code FROM delete_suggestion($1,$2,$3,$4,$5,$6) ";

  try {
    const {
      rows: [result],
      rowCount,
    } = await db.query<ProcessResult>(queryString, [
      user.id,
      translationName,
      verseNumber,
      chapterNumber,
      sectionNumber,
      scriptureNumber,
    ]);

    if ((rowCount ?? 0) === 0)
      throw new Error("Something went unexpectedly wrong??");

    const { code, message } = result;

    return response.code(code).send({ message, code });
  } catch (error) {
    console.error(error);
    return response
      .code(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
