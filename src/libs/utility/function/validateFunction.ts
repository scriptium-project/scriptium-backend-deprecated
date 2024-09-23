import type {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";
import type { SafeParseReturnType, ZodIssue, ZodType } from "zod";
import type { AtLeastOneKeyGeneric } from "../types/types";
const HTTP_BAD_REQUEST_CODE = 400;
const BadRequestResponse = {
  err: "Validation Failed.",
  code: HTTP_BAD_REQUEST_CODE,
};

export const validateFunction = ({
  RouteParams,
  BodyParams,
  QueryStringParams,
  Headers,
}: ValidateFunctionParameter): ((
  request: FastifyRequest,
  response: FastifyReply,
  done: HookHandlerDoneFunction
) => FastifyReply | void) => {
  return (
    request: FastifyRequest,
    response: FastifyReply,
    done: HookHandlerDoneFunction
  ) => {
    const handleValidation = (
      result: SafeParseReturnType<unknown, unknown>
    ): FastifyReply | null => {
      if (!result.success) {
        return response.code(HTTP_BAD_REQUEST_CODE).send({
          ...BadRequestResponse,
          messages: result.error.errors.map((e: ZodIssue) => ({
            path: e.path,
            msg: e.message,
          })),
        });
      }
      return null;
    };

    if (RouteParams) {
      const routeParamsResult = RouteParams.safeParse(request.params);
      const routeError = handleValidation(routeParamsResult);
      if (routeError) return routeError;
      request.params = routeParamsResult.data;
    }

    if (BodyParams) {
      const bodyParamsResult = BodyParams.safeParse(request.body);
      const bodyError = handleValidation(bodyParamsResult);
      if (bodyError) return bodyError;
      request.body = bodyParamsResult.data;
    }

    if (QueryStringParams) {
      const queryStringParams = QueryStringParams.safeParse(request.query);
      const queryError = handleValidation(queryStringParams);
      if (queryError) return queryError;
      request.query = queryStringParams.data;
    }

    if (Headers) {
      const headersResult = Headers.safeParse(request.headers);
      const headersError = handleValidation(headersResult);
      if (headersError) return headersError;
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
