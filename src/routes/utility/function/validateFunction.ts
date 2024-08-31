import type { FastifyReply, FastifyRequest } from "fastify";
import type { ZodType } from "zod";
import { HTTP_NOT_FOUND_CODE, NotFoundResponse } from "../types/utility";
import type { AtLeastOneKeyGeneric } from "../types/types";

export const validateFunction = ({
  RouteParams,
  BodyParams,
  QueryStringParams,
  Headers,
}: ValidateFunctionParameter): ((
  request: FastifyRequest,
  response: FastifyReply,
  done: () => unknown
) => unknown) => {
  return (
    request: FastifyRequest,
    response: FastifyReply,
    done: () => unknown
  ) => {
    if (RouteParams) {
      const routeParamsResult = RouteParams.safeParse(request.params);

      if (!routeParamsResult.success)
        return response.code(HTTP_NOT_FOUND_CODE).send({
          ...NotFoundResponse,
          messages: routeParamsResult.error.errors.map((e) => ({
            path: e.path,
            msg: e.message,
          })),
        });
      request.params = routeParamsResult.data;
    }

    if (BodyParams) {
      const bodyParamsResult = BodyParams.safeParse(request.body);

      if (!bodyParamsResult.success)
        return response.code(HTTP_NOT_FOUND_CODE).send({
          ...NotFoundResponse,
          messages: bodyParamsResult.error.errors.map((e) => ({
            path: e.path,
            msg: e.message,
          })),
        });
      request.body = bodyParamsResult.data;
    }

    if (QueryStringParams) {
      const queryStringParams = QueryStringParams.safeParse(request.query);

      if (!queryStringParams.success)
        return response.code(HTTP_NOT_FOUND_CODE).send({
          ...NotFoundResponse,
          messages: queryStringParams.error.errors.map((e) => ({
            path: e.path,
            msg: e.message,
          })),
        });
      request.query = queryStringParams.data;
    }
    if (Headers) {
      const headersResult = Headers.safeParse(request.headers);

      if (!headersResult.success)
        return response.code(HTTP_NOT_FOUND_CODE).send({
          ...NotFoundResponse,
          messages: headersResult.error.errors.map((e) => ({
            path: e.path,
            msg: e.message,
          })),
        });
      request.headers = headersResult.data;
    }
    done();
  };
};

type ValidateFunctionParameter = AtLeastOneKeyGeneric<{
  BodyParams: ZodType;
  QueryStringParams: ZodType;
  RouteParams: ZodType;
  Headers: ZodType;
}>;
