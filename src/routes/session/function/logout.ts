import type { FastifyReply, FastifyRequest } from "fastify";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_UNAUTHORIZED_CODE,
  InternalServerErrorResponse,
} from "../../utility/types/utility";
import type {
  NegativeResponse,
  PositiveResponse,
} from "../../utility/types/types";
import { LoggedOutResponse, NotLoggedResponse } from "../types/utility";

export const logout = async (
  request: FastifyRequest<{ Reply: PositiveResponse | NegativeResponse }>,
  response: FastifyReply
): Promise<void> => {
  try {
    if (!request.isAuthenticated())
      return response.code(HTTP_UNAUTHORIZED_CODE).send(NotLoggedResponse);

    await request.logOut();
    return response.code(HTTP_ACCEPTED_CODE).send(LoggedOutResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
