import type { HookHandlerDoneFunction } from "fastify";
import { getNotification } from "./function/getNotification";
import { readNotifications } from "./function/readNotification";
import type { FastifyInstance } from "fastify";
import { validateFunction } from "../../../../libs/utility/function/validateFunction";
import { getNotificationsSchema } from "./types/getNotificationsSchema";
import { readNotificationsSchema } from "./types/readNotificationsSchema";
import { rateLimitCreatorFunction } from "../../../../libs/utility/function/rateLimiterFunction";
import { REQUEST_COUNT_FOR_NOTIFICATION_ROUTE } from "./types/utility";

const notificationRouteRateLimitConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_NOTIFICATION_ROUTE
);

export default function notificationRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Savings

  //Prefix: /notification

  server.get("/:quantity?", {
    config: {
      rateLimit: notificationRouteRateLimitConfigProperty,
    },
    preHandler: validateFunction({ RouteParams: getNotificationsSchema }),
    handler: getNotification,
  });

  server.put("/read", {
    config: { rateLimit: notificationRouteRateLimitConfigProperty },
    preHandler: validateFunction({ BodyParams: readNotificationsSchema }),
    handler: readNotifications,
  });
  done();
}
