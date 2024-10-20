import type { FastifyReply, FastifyRequest } from "fastify";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_BAD_REQUEST_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import type { createCommentSchema } from "../types/createCommentSchema";
import type { ProcessResult } from "../../../../../libs/utility/types/types";
/*
    Implementation of functions named create_comment_on_verse() and create_comment_on_note(), respectively.

    CREATE OR REPLACE FUNCTION create_comment_on_verse(
        p_user_id UUID,
        p_chapterNumber INT,
        p_verse_number INT,
        p_parentcomment_id UUID,
        p_comment_text VARCHAR(500)
    ) RETURNS process_result AS $$
    DECLARE
        result process_result;
        new_comment_id UUID;
        verse_id INTEGER;
        affected_rows INT DEFAULT 0;
        affected_rows_verse INT DEFAULT 0;
    BEGIN
        SELECT id INTO verse_id FROM verse
        WHERE verse_number = p_verse_number AND chapter_id = p_chapterNumber;

        IF NOT FOUND THEN
            result.success := FALSE;
            result.message := 'Verse does not exist.';
            result.code := 404;
            RETURN result;
        END IF;

        IF p_parentcomment_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM comment WHERE id = p_parentcomment_id) THEN
            result.success := FALSE;
            result.message := 'Parent comment does not exist.';
            result.code := 404; -- Not found.
            RETURN result;
        END IF;

        IF (SELECT verse_id FROM comment_verse WHERE comment_id = p_parentcomment_id) != verse_id THEN
            result.success := FALSE;
            result.message := 'Parent comment is situated in another verse.';
            result.code := 418 ; -- I am a teapot. :)
            RETURN result;
        END IF;

        INSERT INTO "comment" (user_id, text, parent_comment_id)
        VALUES (p_user_id, p_comment_text, p_parentcomment_id)
        RETURNING id INTO new_comment_id;

        GET DIAGNOSTICS affected_rows = ROW_COUNT;

        IF affected_rows = 0 THEN
            result.success := FALSE;
            result.message := 'Parent comment might be deleted or not found.';
            result.code = 404; -- Not found.
            RETURN result;
        END IF;

        INSERT INTO comment_verse (comment_id, verse_id)
        VALUES (new_comment_id, verse_id);

        GET DIAGNOSTICS affected_rows_verse = ROW_COUNT;

        IF affected_rows_verse = 0 THEN
            result.success := FALSE;
            result.message := 'You have exceeded the comment limit on this verse.';
            result.code := 429; -- Too Many Requests.
            RETURN result;
        END IF;

        result.success := TRUE;
        result.message := 'Comment added successfully.';
        result.code := 201; -- Created
        RETURN result;
    END;
    $$ LANGUAGE plpgsql;


    CREATE OR REPLACE FUNCTION create_comment_on_note(
        p_user_id UUID,
        p_note_id UUID,
        p_parentcomment_id UUID,
        p_comment TEXT
    ) RETURNS process_result AS $$
    DECLARE
        result process_result;
        new_comment_id UUID;
        owner_note_user_id UUID;
        affected_rows_comment INT DEFAULT 0;
        affected_rows_comment_note INT DEFAULT 0;
    BEGIN
        -- Check if the note exists
        IF NOT EXISTS (SELECT 1 FROM note WHERE id = p_note_id) THEN
            result.success := FALSE;
            result.message := 'Note does not exist.';
            result.code := 404;
            RETURN result;
        END IF;

        IF p_parentcomment_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM comment WHERE id = p_parentcomment_id) THEN
            result.success := FALSE;
            result.message := 'Parent comment does not exist.';
            result.code := 404; -- Not found.
            RETURN result;
        END IF;

        IF (SELECT note_id FROM comment_note WHERE comment_id = p_parentcomment_id) != p_note_id THEN
            result.success := FALSE;
            result.message := 'Parent note is situated in another verse.';
            result.code := 418 ; -- I am a teapot. :)
            RETURN result;
        END IF;

        SELECT user_id INTO owner_note_user_id FROM note WHERE id = p_note_id;

        IF p_user_id != owner_note_user_id AND NOT EXISTS (SELECT 1 FROM follow WHERE follower_id = p_user_id AND followed_id = owner_note_user_id AND status = 'accepted') THEN
            result.success := FALSE;
            result.message := 'You are not following the owner of this note.';
            result.code := 403;
            RETURN result;
        END IF;

        -- Insert into the comment table and capture the new comment ID
        INSERT INTO comment (user_id, "text", parent_comment_id)
        VALUES (p_user_id, p_comment, p_parentcomment_id)
        RETURNING id INTO new_comment_id;

        -- Capture the row count for the comment insert
        GET DIAGNOSTICS affected_rows_comment = ROW_COUNT;

        IF affected_rows_comment = 0 THEN
            result.success := FALSE;
            result.message := 'Parent comment might be deleted or not found.';
            result.code = 404; -- Not found.
            RETURN result;
        END IF;

        -- Insert into the comment_note table
        INSERT INTO comment_note (comment_id, note_id)
        VALUES (new_comment_id, p_note_id);

        -- Capture the row count for the comment_note insert
        GET DIAGNOSTICS affected_rows_comment_note = ROW_COUNT;

        IF affected_rows_comment_note = 0 THEN
            result.success := FALSE;
            result.message := 'You have exceeded the comment limit on this note.';
            result.code := 429; -- Too Many Requests.
            RETURN result;
        END IF;

        -- Populate the result with success information and row counts
        result.success := TRUE;
        result.message := 'Comment added successfully.';
        result.code := 201; -- Created
        RETURN result;
    END;
    $$ LANGUAGE plpgsql;

*/

export const createComment = async (
  request: FastifyRequest<{ Body: z.infer<typeof createCommentSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { type, parentCommentId, comment } = request.body;
  const user = request.user as User;

  try {
    let params: unknown[] = [];

    const queries: Record<string, string> = {
      verse: "create_comment_on_verse($1, $2, $3, $4, $5);",
      note: "create_comment_on_note($1, $2, $3, $4);",
    } as const;

    const functionQuery = queries[type];

    const queryString = `SELECT success, message, code FROM ${functionQuery}`;

    if (type === "verse") {
      const { chapterNumber, verseNumber } = request.body;
      params = [
        user.id,
        chapterNumber,
        verseNumber,
        parentCommentId ?? null,
        comment,
      ];
    } else if (type === "note") {
      const { noteId } = request.body;

      params = [user.id, noteId, parentCommentId ?? null, comment];
    } else
      return response
        .code(HTTP_BAD_REQUEST_CODE)
        .send({ message: "Invalid entity type." });

    const {
      rows: [result],
    } = await db.query<ProcessResult>(queryString, params);

    if (result === null) throw new Error("Something went unexpectedly wrong??");

    const { code, message } = result;

    return response.code(code).send({ message, code });
  } catch (error: unknown) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
