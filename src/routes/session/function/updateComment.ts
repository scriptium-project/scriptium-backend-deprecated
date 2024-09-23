import type { FastifyReply, FastifyRequest } from "fastify";
import {
  CreatedResponse,
  HTTP_CREATED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import db from "../../../libs/db/db";
import type { updateCommentSchema } from "../types/updateCommentSchema";
import type { User } from "../../../libs/session/passport/type";

export const updateComment = async (
  request: FastifyRequest<{ Body: z.infer<typeof updateCommentSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { updatedComment, commentId } = request.body;

  const user = request.user as User;

  const queryString =
    "UPDATE comment SET text = $1, updated_at = NOW() WHERE id = $2 AND userId = $3";

  try {
    const { rowCount } = await db.query(queryString, [
      updatedComment,
      commentId,
      user.id,
    ]);

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_CREATED_CODE).send(CreatedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
