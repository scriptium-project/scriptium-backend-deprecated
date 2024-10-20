import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { validateFunction } from "../../../../libs/utility/function/validateFunction";
import { blockUser } from "./function/blockUser";
import { getBlockedUsers } from "./function/getBlockedUsers";
import { unblockUser } from "./function/unblockUser";
import { blockUserSchema } from "./types/blockUserSchema";
import { unblockUserSchema } from "./types/unblockUserSchema";
import { rateLimitCreatorFunction } from "../../../../libs/utility/function/rateLimiterFunction";
import { REQUEST_COUNT_FOR_BLOCK_ROUTE } from "./types/utility";

const blockRouteRateLimiterConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_BLOCK_ROUTE
);

export default function blockRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Blocking

  //Prefix: /block

  server.get("", {
    config: {
      rateLimit: blockRouteRateLimiterConfigProperty,
    },
    handler: getBlockedUsers,
  });

  server.post("/block", {
    config: {
      rateLimit: blockRouteRateLimiterConfigProperty,
    },
    preValidation: validateFunction({ BodyParams: blockUserSchema }),
    handler: blockUser,
  });

  server.delete("/unblock", {
    config: {
      rateLimit: blockRouteRateLimiterConfigProperty,
    },
    preValidation: validateFunction({ BodyParams: unblockUserSchema }),
    handler: unblockUser,
  });
  done();
}
