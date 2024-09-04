import type {
  NegativeResponse,
  PositiveResponse,
} from "../../../libs/utility/types/types";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_CONFLICT_CODE,
  HTTP_CREATED_CODE,
  HTTP_UNAUTHORIZED_CODE,
} from "../../../libs/utility/types/utility";

export const MAX_LENGTH_OF_USERNAME = 24;
export const MAX_LENGTH_OF_NAME = 30;
export const MAX_LENGTH_OF_SURNAME = 30;
export const MAX_LENGTH_OF_EMAIL = 255;
export const MAX_LENGTH_OF_PASSWORD = 50;

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
  msg: "User successfully created!",
  code: HTTP_CREATED_CODE,
};

export const LoggedOutResponse: PositiveResponse = {
  msg: "You have successfully logged out!",
  code: HTTP_ACCEPTED_CODE,
};

export const NotLoggedInResponse: NegativeResponse = {
  err: "You're not logged!",
  code: HTTP_UNAUTHORIZED_CODE,
};

export const ContentSavedResponse: PositiveResponse = {
  msg: "Content has been saved!",
  code: HTTP_ACCEPTED_CODE,
};

export const AlreadySavedResponse: NegativeResponse = {
  err: "You have already saved that content in this collection!",
  code: HTTP_CONFLICT_CODE,
};

export const AvailableRoles = {
  user: { id: null },
  admin: { id: 1 },
  verified: { id: 2 },
} as const;

export const MAX_LENGTH_OF_COLLECTION_NAME = 100;
export const MAX_LENGTH_OF_COLLECTION_DESCRIPTION = 5000;
