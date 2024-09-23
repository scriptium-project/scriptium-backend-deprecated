import type { FastifyReply, FastifyRequest } from "fastify";
import {
  DoneResponse,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_NOT_FOUND_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import db from "../../../libs/db/db";
import type { deleteCommentSchema } from "../types/deleteCommentSchema";
import type { User } from "../../../libs/session/passport/type";

export const deleteComment = async (
  request: FastifyRequest<{ Body: z.infer<typeof deleteCommentSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { commentId } = request.body;

  const user = request.user as User;

  const queryString = `DELETE comment WHERE id = $1 AND userId = $2`;

  try {
    const { rowCount } = await db.query(queryString, [commentId, user.id]);

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_NOT_FOUND_CODE).send(NotFoundResponse);

    return response.code(HTTP_OK_CODE).send(DoneResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
