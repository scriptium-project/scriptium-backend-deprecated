import type { FastifyReply, FastifyRequest } from "fastify";
import type { User } from "../../../../../libs/session/passport/type";
import type { z } from "zod";
import type { unlikeContentSchema } from "../types/unlikeContentSchema";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
  HTTP_NOT_FOUND_CODE,
} from "../../../../../libs/utility/types/utility";
import db from "../../../../../libs/db/db";
import type { ProcessResult } from "../../../../../libs/utility/types/types";

/*
Implementation of function named unlike_comment() and unlike_note() respectively.

CREATE OR REPLACE FUNCTION unlike_comment(
    p_user_id UUID,
    p_comment_id UUID
) RETURNS process_result AS $$
DECLARE
    result process_result;
    like_id_to_delete BIGINT;
BEGIN
    -- Find the like to delete
    SELECT l.id INTO like_id_to_delete
    FROM "like" l
    JOIN like_comment lc ON l.id = lc.likeId
    WHERE l.user_id = p_user_id AND lc.comment_id = p_comment_id;

    IF like_id_to_delete IS NULL THEN
        result.success := FALSE;
        result.message := 'Like does not exist.';
        result.code := 404; -- Not Found
        RETURN result;
    END IF;

    -- Delete the like (cascade deletes from like_comment)
    DELETE FROM "like" WHERE id = like_id_to_delete;

    result.success := TRUE;
    result.message := 'Like removed successfully.';
    result.code := 200; -- OK
    RETURN result;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION unlike_note(
    p_user_id UUID,
    p_note_id UUID
) RETURNS process_result AS $$
DECLARE
    result process_result;
    like_id_to_delete BIGINT;
BEGIN
    -- Find the like to delete
    SELECT l.id INTO like_id_to_delete
    FROM "like" l
    JOIN like_note ln ON l.id = ln.likeId
    WHERE l.user_id = p_user_id AND ln.note_id = p_note_id;

    IF like_id_to_delete IS NULL THEN
        result.success := FALSE;
        result.message := 'Like does not exist.';
        result.code := 404; -- Not Found
        RETURN result;
    END IF;

    -- Delete the like (cascade deletes from like_note)
    DELETE FROM "like" WHERE id = like_id_to_delete;

    result.success := TRUE;
    result.message := 'Like removed successfully.';
    result.code := 200; -- OK
    RETURN result;
END;
$$ LANGUAGE plpgsql;
*/

export const unlikeContent = async (
  request: FastifyRequest<{ Body: z.infer<typeof unlikeContentSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { contentType, contentId } = request.body;

  const user = request.user as User;

  const queries: Record<string, string> = {
    comment: "unlike_comment($1, $2);",
    note: "unlike_note($1, $2);",
  };

  const functionQuery = queries[contentType];

  if (functionQuery === undefined)
    return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

  const queryString = `SELECT success, message, code FROM ${functionQuery}`;

  try {
    const {
      rows: [result],
    } = await db.query<ProcessResult>(queryString, [user.id, contentId]);

    if (result === null) throw new Error("Something went unexpectedly wrong??");

    const { message, code } = result;

    return response.code(code).send({
      message,
      code,
    });
  } catch (error: unknown) {
    console.error(error);
    return response
      .code(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
