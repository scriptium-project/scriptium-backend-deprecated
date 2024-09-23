import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { registerSchema } from "../types/registerSchema";
import db from "../../../libs/db/db";
import * as bcrypt from "bcrypt";
import { UserCreatedResponse } from "../types/utility";
import {
  BCRYPT_SALT_NUMBER,
  HTTP_CONFLICT_CODE,
  HTTP_CREATED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";
import type { UserPick } from "../../../libs/utility/types/types";

export const register = async (
  request: FastifyRequest<{
    Body: z.infer<typeof registerSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { username, name, surname, email, password, gender, biography } =
    request.body;

  const queryString = `
    INSERT INTO "user" (username, name, surname, gender, biography, email, password)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT DO NOTHING
    RETURNING id;
  `;

  try {
    const hashedPassword = bcrypt.hashSync(password, BCRYPT_SALT_NUMBER);

    const { rowCount } = await db.query(queryString, [
      username,
      name,
      surname,
      gender,
      biography,
      email,
      hashedPassword,
    ]);

    if (rowCount)
      return response.code(HTTP_CREATED_CODE).send(UserCreatedResponse);

    const conflictCheckQuery = `
        SELECT username, email FROM "user"
        WHERE LOWER(username) = LOWER($1) OR email = $2
        LIMIT 1;
      `;

    const {
      rows: [existingUser],
    } = await db.query<UserPick<"username" | "email">>(conflictCheckQuery, [
      username,
      email,
    ]);

    let conflictMessage = "Conflict occurred.";

    const existingUserUsernameLowerCase = existingUser.username.toLowerCase();
    const usernameLowerCase = username.toLowerCase();

    if (
      existingUser.email === email &&
      existingUserUsernameLowerCase === usernameLowerCase
    )
      conflictMessage = "Both username and email are already in use.";
    else if (existingUserUsernameLowerCase === usernameLowerCase)
      conflictMessage = "Username is already in use.";
    else if (existingUser.email === email)
      conflictMessage = "Email is already in use.";

    return response.code(HTTP_CONFLICT_CODE).send({
      error: conflictMessage,
      code: HTTP_CONFLICT_CODE,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
