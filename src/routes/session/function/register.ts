import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { registerSchema } from "../types/registerSchema";
import db from "../../../libs/db/db";
import {
  UserCreatedResponse,
  UsernameOrEmailAlreadyInUseResponse,
} from "../types/utility";
import * as bcrypt from "bcrypt";
import {
  BCRYPT_SALT_NUMBER,
  HTTP_CONFLICT_CODE,
  HTTP_CREATED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_UNAUTHORIZED_CODE,
  InternalServerErrorResponse,
  SomethingWentWrongResponse,
} from "../../../libs/utility/types/utility";
import type {
  NegativeResponse,
  PositiveResponse,
} from "../../../libs/utility/types/types";
import type { RowCountType } from "../types/types";

export const register = async (
  request: FastifyRequest<{
    Body: z.infer<typeof registerSchema>;
    Reply: PositiveResponse | NegativeResponse;
  }>,
  response: FastifyReply
): Promise<void> => {
  const { username, name, surname, email, password, gender } = request.body;

  let queryString: string = `SELECT COUNT(*)::INTEGER as row_count FROM "user" WHERE username = $1 OR email = $2`;

  try {
    const [{ row_count }] = (
      await db.query<RowCountType>(queryString, [username, email])
    ).rows;

    if (row_count > 0)
      return response
        .code(HTTP_CONFLICT_CODE)
        .send(UsernameOrEmailAlreadyInUseResponse);

    queryString = `INSERT INTO "user" (username, name, surname, gender, email,password, is_frozen) VALUES ($1,$2,$3,$4,$5,$6, false)`;

    const hashedPassword = bcrypt.hashSync(password, BCRYPT_SALT_NUMBER);

    const registerRowCount = (
      await db.query(queryString, [
        username,
        name,
        surname,
        gender,
        email,
        hashedPassword,
      ])
    ).rowCount;

    if (!registerRowCount)
      return response
        .code(HTTP_UNAUTHORIZED_CODE)
        .send(SomethingWentWrongResponse);

    return response.code(HTTP_CREATED_CODE).send(UserCreatedResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
