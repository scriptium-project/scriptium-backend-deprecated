import type {
  NegativeResponse,
  PositiveResponse,
} from "../../utility/types/types";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_CREATED_CODE,
  HTTP_UNAUTHORIZED_CODE,
} from "../../utility/types/utility";

export const MAX_LENGTH_OF_USERNAME = 24;
export const MAX_LENGTH_OF_NAME = 30;
export const MAX_LENGTH_OF_SURNAME = 30;
export const MAX_LENGTH_OF_EMAIL = 255;
export const MAX_LENGTH_OF_PASSWORD = 255;

export const UsernameOrEmailAlreadyInUseResponse: NegativeResponse = {
  err: "Username or Email are already in use!",
  code: HTTP_UNAUTHORIZED_CODE,
};

export const BadCredentialsResponse: NegativeResponse = {
  err: "Bad Credentials!",
  code: HTTP_UNAUTHORIZED_CODE,
};

export const LoggedInResponse: PositiveResponse = {
  msg: "Successfully logged in!",
  code: HTTP_ACCEPTED_CODE,
};

export const UserCreatedResponse: PositiveResponse = {
  msg: "User succussfully created!",
  code: HTTP_CREATED_CODE,
};

export const LoggedOutResponse: PositiveResponse = {
  msg: "You have succesfully logged out!",
  code: HTTP_ACCEPTED_CODE,
};

export const NotLoggedResponse: NegativeResponse = {
  err: "You're not logged!",
  code: HTTP_UNAUTHORIZED_CODE,
};
export type RowCountType = {
  row_count: number;
};
