import type { FastifyReply, FastifyRequest } from "fastify";
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
import { LoggedOutResponse, NotLoggedInResponse } from "../types/utility";

export const logout = async (
  request: FastifyRequest<{ Reply: PositiveResponse | NegativeResponse }>,
  response: FastifyReply
): Promise<void> => {
  if (!request.isAuthenticated())
    return response.code(HTTP_UNAUTHORIZED_CODE).send(NotLoggedInResponse);

  try {
    await request.logOut();

    return response.code(HTTP_ACCEPTED_CODE).send(LoggedOutResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
