import type { FastifyReply, FastifyRequest } from "fastify";
import type { User } from "../../../libs/session/passport/type";
import db from "../../../libs/db/db";
import {
  DoneResponse,
  HTTP_CONFLICT_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  SomethingWentWrongResponse,
} from "../../../libs/utility/types/utility";

export const alterAccountType = async (
  request: FastifyRequest,
  response: FastifyReply
): Promise<FastifyReply> => {
  const user = request.user as User;

  const queryString = `UPDATE "user"
SET is_private = CASE 
                   WHEN is_private IS NULL THEN CURRENT_TIMESTAMP 
                   ELSE NULL 
                 END
WHERE id = $1`;

  try {
    const { rowCount } = await db.query(queryString, [user.id]);

    if ((rowCount ?? 0) === 0)
      return response.code(HTTP_CONFLICT_CODE).send(SomethingWentWrongResponse);

    return response.code(HTTP_OK_CODE).send(DoneResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
