import type { FastifyReply, FastifyRequest } from "fastify";
import {
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import type { updateCommentSchema } from "../types/updateCommentSchema";
import type { ProcessResult } from "../../../../../libs/utility/types/types";
/*
    Implementation of function named update_comment()

    CREATE OR REPLACE FUNCTION update_comment(
        p_user_id UUID,
        p_comment_id UUID,
        p_updatedComment TEXT
    ) RETURNS process_result AS $$
    DECLARE
        result process_result;
        comment_exists BOOLEAN;
    BEGIN
        -- Check if the comment exists and is owned by the user
        SELECT TRUE INTO comment_exists
        FROM comment
        WHERE id = p_comment_id AND user_id = p_user_id;

        IF NOT FOUND THEN
            result.success := FALSE;
            result.message := 'Comment not found or you do not have permission to update it.';
            result.code := 404;
            RETURN result;
        END IF;

        -- Update the comment
        UPDATE comment
        SET text = p_updatedComment,
            updated_at = NOW()
        WHERE id = p_comment_id AND user_id = p_user_id;

        result.success := TRUE;
        result.message := 'Comment updated successfully.';
        result.code := 200; -- OK
        RETURN result;
    END;
    $$ LANGUAGE plpgsql;

*/

export const updateComment = async (
  request: FastifyRequest<{ Body: z.infer<typeof updateCommentSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { updatedComment, commentId } = request.body;

  const user = request.user as User;

  try {
    const queryString = `SELECT * FROM update_comment($1, $2, $3)`;

    const {
      rows: [result],
    } = await db.query<ProcessResult>(queryString, [
      user.id,
      commentId,
      updatedComment,
    ]);

    if (result === null) throw new Error("Something went unexpectedly wrong??");

    const { message, code } = result;

    return response.code(code).send({ message, code });
  } catch (error: unknown) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
