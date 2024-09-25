import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { loginSchema } from "../types/loginSchema";
import db from "../../../libs/db/db";
import type { User } from "../../../libs/session/passport/type";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_UNAUTHORIZED_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import { BadCredentialsResponse, LoggedInResponse } from "../types/utility";
import { isPasswordTrue } from "../../../libs/utility/function/isPasswordTrue";

export const login = async (
  request: FastifyRequest<{
    Body: z.infer<typeof loginSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { identifier, password } = request.body;

  const queryString = `SELECT * FROM "user" WHERE username = $1 OR email = $1`;
  try {
    const {
      rows: [user],
    } = await db.query<User>(queryString, [identifier]);

    if (!user)
      return response.code(HTTP_UNAUTHORIZED_CODE).send(BadCredentialsResponse);

    if (!(await isPasswordTrue(user, password)))
      return response.code(HTTP_UNAUTHORIZED_CODE).send(BadCredentialsResponse);

    await request.logIn(user);

    return response.code(HTTP_ACCEPTED_CODE).send(LoggedInResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
