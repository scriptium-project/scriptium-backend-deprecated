import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { likeContent } from "./function/likeContent";
import { unlikeContent } from "./function/unlikeContent";
import { validateFunction } from "../../../../libs/utility/function/validateFunction";
import { likeContentSchema } from "./types/likeContentSchema";
import { unlikeContentSchema } from "./types/unlikeContentSchema";
import { rateLimitCreatorFunction } from "../../../../libs/utility/function/rateLimiterFunction";
import {
  REQUEST_COUNT_FOR_LIKE_ROUTE,
  TIME_WINDOW_FOR_LIKE_RATE_LIMIT,
} from "./types/utility";

const likeRouteRateLimiterConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_LIKE_ROUTE,
  {
    timeWindow: TIME_WINDOW_FOR_LIKE_RATE_LIMIT,
  }
);

export default function likeRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Likes

  //Prefix: /like

  server.post("/like", {
    config: { rateLimit: likeRouteRateLimiterConfigProperty },
    preHandler: validateFunction({ BodyParams: likeContentSchema }),
    handler: likeContent,
  });

  server.delete("/unlike", {
    config: { rateLimit: likeRouteRateLimiterConfigProperty },
    preHandler: validateFunction({ BodyParams: unlikeContentSchema }),
    handler: unlikeContent,
  });
  done();
}
