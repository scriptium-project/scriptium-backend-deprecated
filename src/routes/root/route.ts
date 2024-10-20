import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { getRoot } from "./function/getRoot";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { getRootSchema } from "./types/getRootSchema";
import { cacheCheckFunction } from "../../libs/utility/function/cacheCheckFunction";
import { rateLimitCreatorFunction } from "../../libs/utility/function/rateLimiterFunction";
import { REQUEST_COUNT_FOR_ROOT_ROUTE } from "./types/utility";

export default function rootRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  server.get("/:scriptureNumber/:rootLatin/:langCode?", {
    config: {
      rateLimit: rateLimitCreatorFunction(REQUEST_COUNT_FOR_ROOT_ROUTE),
    },
    preValidation: validateFunction({ RouteParams: getRootSchema }),
    preHandler: cacheCheckFunction,
    handler: getRoot,
  });

  done();
}
