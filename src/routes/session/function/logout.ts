import type { FastifyReply, FastifyRequest } from "fastify";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../libs/utility/types/utility";

import { LoggedOutResponse } from "../types/utility";

export const logout = async (
  request: FastifyRequest,
  response: FastifyReply
): Promise<FastifyReply> => {
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
