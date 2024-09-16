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
