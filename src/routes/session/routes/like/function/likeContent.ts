import type { FastifyReply, FastifyRequest } from "fastify";
import type { User } from "../../../../../libs/session/passport/type";
import type { z } from "zod";
import type { likeContentSchema } from "../types/likeContentSchema";
import db from "../../../../../libs/db/db";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../../../libs/utility/types/utility";
import type { ProcessResult } from "../../../../../libs/utility/types/types";

/*
    Implementation of functions named like_comment() and like_note(), respectively.

    CREATE OR REPLACE FUNCTION like_comment(
        p_user_id UUID,
        p_comment_id UUID
    ) RETURNS process_result AS $$
    DECLARE
        result process_result;
        new_like_id BIGINT;
        comment_owner_user_id UUID;
        affected_rows_like INT DEFAULT 0;
        affected_rows_comment INT DEFAULT 0;
    BEGIN
        -- Check if the comment exists
        IF NOT EXISTS (SELECT 1 FROM "comment" WHERE id = p_comment_id) THEN
            result.success := FALSE;
            result.message := 'Comment does not exist.';
            result.code := 404; -- Not Found
            RETURN result;
        END IF;

        SELECT user_id INTO comment_owner_user_id FROM comment WHERE id = p_comment_id;

        IF (comment_owner_user_id IS NULL OR
            (NOT EXISTS (SELECT 1 FROM follow WHERE follower_id = p_user_id AND followed_id = comment_owner_user_id AND status = 'accepted')
            AND (SELECT user_id = comment_owner_user_id FROM comment WHERE id = p_comment_id))
            ) THEN
            result.message := 'You do not have the permission to like this comment.';
            result.code := 403; -- Forbidden.
            result.success := FALSE;
            RETURN result;
        END IF;

        -- Check if the user has already liked this comment
        IF EXISTS (
            SELECT 1 FROM "like" l
            JOIN like_comment lc ON l.id = lc.likeId
            WHERE l.user_id = p_user_id AND lc.comment_id = p_comment_id
        ) THEN
            result.success := FALSE;
            result.message := 'You have already liked this comment.';
            result.code := 409; -- Conflict
            RETURN result;
        END IF;

        -- Insert into "like" table
        INSERT INTO "like" (user_id)
        VALUES (p_user_id)
        RETURNING id INTO new_like_id;

        GET DIAGNOSTICS affected_rows_like = ROW_COUNT;

        IF affected_rows_like = 0 THEN
            result.success := FALSE;
            result.message := 'Like cannot be inserted.';
            result.code := '404'; -- Not Found.
            RETURN result;
        END IF;

        -- Insert into like_comment table
        INSERT INTO like_comment (likeId, comment_id)
        VALUES (new_like_id, p_comment_id);


        GET DIAGNOSTICS affected_rows_comment = ROW_COUNT;

        IF affected_rows_comment = 0 THEN
            result.success := FALSE;
            result.message := 'You have already liked this comment.';
            result.code := '409'; -- Not Found.
            RETURN result;
        END IF;


        result.success := TRUE;
        result.message := 'Comment liked successfully.';
        result.code := 201; --Created
        RETURN result;
    END;
    $$ LANGUAGE plpgsql;



    CREATE OR REPLACE FUNCTION like_note(
        p_user_id UUID,
        p_note_id UUID
    ) RETURNS process_result AS $$
    DECLARE
        new_like_id BIGINT;
        result process_result;
        note_owner_user_id UUID;
        affected_rows_like INT DEFAULT 0;
        affected_rows_comment INT DEFAULT 0;
    BEGIN
        -- Check if the note exists
        IF NOT EXISTS (SELECT 1 FROM note WHERE id = p_note_id) THEN
            result.success := FALSE;
            result.message := 'Note does not exist.';
            result.code := 404; --Not Found
            RETURN result;
        END IF;

        -- Check if the user has already liked this note
        IF EXISTS (
            SELECT 1 FROM "like" l
            JOIN like_note ln ON l.id = ln.likeId
            WHERE l.user_id = p_user_id AND ln.note_id = p_note_id
        ) THEN
            result.success := FALSE;
            result.message := 'You have already liked this note.';
            result.code := 409; -- Conflict
            RETURN result;
        END IF;


        SELECT user_id INTO note_owner_user_id FROM note WHERE id = p_note_id;

        IF (note_owner_user_id IS NULL OR
            (NOT EXISTS (SELECT 1 FROM follow WHERE follower_id = p_user_id AND followed_id = note_owner_user_id AND status = 'accepted')
            AND (SELECT user_id = note_owner_user_id FROM note WHERE id = p_note_id))
            ) THEN
            result.message := 'You do not have the permission to like this note.';
            result.code := 403; -- Forbidden.
            result.success := FALSE;
            RETURN result;
        END IF;


        -- Insert into "like" table
        INSERT INTO "like" (user_id)
        VALUES (p_user_id)
        RETURNING id INTO new_like_id;

        GET DIAGNOSTICS affected_rows_like = ROW_COUNT;

        IF affected_rows_like = 0 THEN
            result.success := FALSE;
            result.message := 'Like cannot be applied.';
            result.code := '404'; -- Not Found.
            RETURN result;
        END IF;


        -- Insert into like_note table
        INSERT INTO like_note (likeId, note_id)
        VALUES (new_like_id, p_note_id);

        GET DIAGNOSTICS affected_rows_comment = ROW_COUNT;

        IF affected_rows_comment = 0 THEN
            result.success := FALSE;
            result.message := 'You have already liked this note.';
            result.code := '409'; -- Not Found.
            RETURN result;
        END IF;


        result.success := TRUE;
        result.message := 'Note liked successfully.';
        result.code := 201; -- Created
        RETURN result;
    END;
    $$ LANGUAGE plpgsql;
*/

export const likeContent = async (
  request: FastifyRequest<{ Body: z.infer<typeof likeContentSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { contentType, contentId } = request.body;

  const user = request.user as User;

  const queries: Record<string, string> = {
    comment: "like_comment($1,$2);",
    note: "like_note($1,$2);",
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

    const { code, message } = result;

    return response.code(code).send({ message, code });
  } catch (error: unknown) {
    console.error(error);
    return response
      .code(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
