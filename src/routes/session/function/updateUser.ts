import type { FastifyReply, FastifyRequest } from "fastify";
import {
  DoneResponse,
  HTTP_BAD_REQUEST_CODE,
  HTTP_CONFLICT_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_OK_CODE,
  InformationConflictedResponse,
  InternalServerErrorResponse,
  SomethingWentWrongResponse,
} from "../../../libs/utility/types/utility";
import type { z } from "zod";
import type { User } from "../../../libs/session/passport/type";
import db from "../../../libs/db/db";
import type { updateUserSchema } from "../types/updateUserSchema";

export const updateUser = async (
  request: FastifyRequest<{ Body: z.infer<typeof updateUserSchema> }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const bodyEntries = Object.entries(request.body);
  const user = request.user as User;

  const propertyPairs = [];
  const values: string[] = [];

  for (let i = 0; i < bodyEntries.length; i++) {
    const [key, value] = bodyEntries[i];

    if (!value) continue;

    propertyPairs.push(`${key} = $${i + 1}`);
    values.push(value);
  }

  values.push(user.id);

  const propertyPair = propertyPairs.join(", ");

  let queryString = `SELECT 1 FROM "user" WHERE ${propertyPair} AND id != $${values.length}`;

  try {
    let { rowCount } = await db.query(
      `SELECT * FROM "user" WHERE ${propertyPair} AND id != $${values.length}`,
      values
    );

    if ((rowCount ?? 0) === 0)
      return response
        .code(HTTP_CONFLICT_CODE)
        .send(InformationConflictedResponse);

    queryString = `UPDATE "user" SET ${propertyPair} WHERE id = $${values.length} RETURNING *`;

    ({ rowCount } = await db.query(queryString, values));

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
