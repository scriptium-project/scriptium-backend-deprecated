import type {
  NegativeResponse,
  PositiveResponse,
} from "../../../libs/utility/types/types";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_CREATED_CODE,
  HTTP_UNAUTHORIZED_CODE,
} from "../../../libs/utility/types/utility";

export const BadCredentialsResponse: NegativeResponse = {
  err: "Bad Credentials!",
  code: HTTP_UNAUTHORIZED_CODE,
};

export const LoggedInResponse: PositiveResponse = {
  msg: "Successfully logged in!",
  code: HTTP_ACCEPTED_CODE,
};

export const UserCreatedResponse: PositiveResponse = {
  msg: "User successfully created!",
  code: HTTP_CREATED_CODE,
};

export const REQUEST_COUNT_FOR_AUTH_ROUTE = 50;

/*
 * NOTE:
 *
 * **Caution:** This rate limit value(s) is/are higher than typical for a new backend system given corresponding process(es). It is currently set this way to allow for extensive testing and initial usage monitoring.
 *
 * For detailed guidelines and best practices on implementing and configuring rate limiting, please refer to the `index.ts` file.
 */
