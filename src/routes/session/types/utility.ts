import type {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
  RouteGenericInterface,
} from "fastify";
import type {
  NegativeResponse,
  PositiveResponse,
} from "../../../libs/utility/types/types";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_CONFLICT_CODE,
  HTTP_UNAUTHORIZED_CODE,
} from "../../../libs/utility/types/utility";
import type { User } from "../../../libs/session/passport/type";

export const MIN_LETTERS_OR_NUMBERS_IN_USERNAME = 3;
export const MIN_LENGTH_FOR_USERNAME = 3;
export const MAX_LENGTH_FOR_USERNAME = 18;

export const MIN_LENGTH_FOR_NAME = 3;
export const MAX_LENGTH_FOR_NAME = 30;

export const MIN_LENGTH_FOR_SURNAME = 2;
export const MAX_LENGTH_FOR_SURNAME = 30;

export const MIN_LENGTH_FOR_PASSWORD = 4;
export const MAX_LENGTH_FOR_PASSWORD = 50;

export const MAX_LENGTH_FOR_EMAIL = 255;

export const MAX_LENGTH_FOR_COLLECTION_NAME = 100;
export const MAX_LENGTH_FOR_COLLECTION_DESCRIPTION = 250;

export const MAX_LENGTH_FOR_COMMENT = 1500;

export const MAX_LENGTH_FOR_BIOGRAPHY = 200;

export const UNIQUE_KEY_CONSTRAINT_VIOLATION_ERROR_CODE = "23505";

export const UsernameOrEmailAlreadyInUseResponse: NegativeResponse = {
  err: "Username or Email are already in use!",
  code: HTTP_UNAUTHORIZED_CODE,
};

export const AlreadySavedResponse: NegativeResponse = {
  err: "You have already saved that content in this collection!",
  code: HTTP_CONFLICT_CODE,
};

export const NotLoggedInResponse: NegativeResponse = {
  err: "You're not logged!",
  code: HTTP_UNAUTHORIZED_CODE,
};

export const LoggedOutResponse: PositiveResponse = {
  msg: "You have successfully logged out!",
  code: HTTP_ACCEPTED_CODE,
};

export const ContentSavedResponse: PositiveResponse = {
  msg: "Content has been saved!",
  code: HTTP_ACCEPTED_CODE,
};

//For now, this interface is just for testing.
export interface AuthenticatedRequest<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface
> extends FastifyRequest<RouteGeneric> {
  user: User; // user is definitely defined.
}

export function checkAuthentication(
  request: FastifyRequest,
  response: FastifyReply,
  done: HookHandlerDoneFunction
): void | FastifyReply {
  if (!request.user || request.user.is_frozen !== null)
    return response.code(HTTP_UNAUTHORIZED_CODE).send(NotLoggedInResponse);

  done();
}
