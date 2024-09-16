import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { loginSchema } from "../types/loginSchema";
import db from "../../../libs/db/db";
import type { User } from "../../../libs/session/passport/type";
import * as bcrypt from "bcrypt";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_UNAUTHORIZED_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";

import type {
  NegativeResponse,
  PositiveResponse,
} from "../../../libs/utility/types/types";
import { BadCredentialsResponse, LoggedInResponse } from "../types/utility";

export const login = async (
  request: FastifyRequest<{
    Body: z.infer<typeof loginSchema>;
    Reply: PositiveResponse | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<void> => {
  const { username, email, password } = request.body;

  const queryString = 'SELECT * FROM "user" WHERE username = $1 OR email = $2';

  try {
    const [user] = (await db.query<User>(queryString, [username, email])).rows;

    if (!user)
      return response.code(HTTP_UNAUTHORIZED_CODE).send(BadCredentialsResponse);

    const isPasswordTrue = await bcrypt.compare(password, user.password);

    if (!isPasswordTrue)
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
