import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { updatePasswordSchema } from "../types/updatePasswordSchema";
import {
  BCRYPT_SALT_NUMBER,
  DoneResponse,
  HTTP_BAD_REQUEST_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
  SomethingWentWrongResponse,
} from "../../../libs/utility/types/utility";
import type { User } from "../../../libs/session/passport/type";
import { isPasswordTrue } from "../../../libs/utility/function/isPasswordTrue";
import { BadCredentialsResponse } from "../../auth/types/utility";
import * as bcrypt from "bcrypt";
import db from "../../../libs/db/db";

export const updatePassword = async (
  request: FastifyRequest<{ Body: z.infer<typeof updatePasswordSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { password, newPassword } = request.body;

  const user = request.user as User;
  try {
    if (!(await isPasswordTrue(user, password)))
      return response.code(HTTP_BAD_REQUEST_CODE).send(BadCredentialsResponse);

    const queryString = 'UPDATE "user" SET password = $1 WHERE id = $2';

    const hashedPassword = bcrypt.hashSync(newPassword, BCRYPT_SALT_NUMBER);

    const { rowCount } = await db.query(queryString, [hashedPassword, user.id]);

    if ((rowCount ?? 0) === 0)
      return response
        .code(HTTP_BAD_REQUEST_CODE)
        .send(SomethingWentWrongResponse);

    return response.code(HTTP_OK_CODE).send(DoneResponse);
  } catch (error) {
    console.error(error);
    return response
      .code(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
