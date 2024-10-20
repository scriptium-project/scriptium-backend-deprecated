import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { validateFunction } from "../../../../libs/utility/function/validateFunction";
import { acceptFollowRequest } from "./function/acceptFollowRequest";
import { followUser } from "./function/followUser";
import { getFollowed } from "./function/getFollowed";
import { getFollower } from "./function/getFollower";
import { rejectFollowRequest } from "./function/rejectFollowRequest";
import { removeFollower } from "./function/removeFollower";
import { retrieveRequest } from "./function/retrieveRequest";
import { unfollowUser } from "./function/unfollowUser";
import { acceptFollowRequestSchema } from "./types/acceptFollowRequestSchema";
import { followUserSchema } from "./types/followUserSchema";
import { getFollowedSchema } from "./types/getFollowedSchema";
import { getFollowerSchema } from "./types/getFollowerSchema";
import { rejectFollowRequestSchema } from "./types/rejectFollowRequestSchema";
import { removeFollowerSchema } from "./types/removeFollowerSchema";
import { retrieveRequestSchema } from "./types/retrieveRequestSchema";
import { unfollowUserSchema } from "./types/unfollowSchema";
import { rateLimitCreatorFunction } from "../../../../libs/utility/function/rateLimiterFunction";
import {
  REQUEST_COUNT_FOR_ACCEPTING_FOLLOW,
  REQUEST_COUNT_FOR_FOLLOW_ROUTE,
} from "./types/utility";

const followRouteRateLimitConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_FOLLOW_ROUTE
);
const acceptRouteRateLimitConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_ACCEPTING_FOLLOW
);

export default function followRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Followings

  //Prefix: /follow

  //Query Params (type: "pending" | "accepted")
  server.get("/follower/:type", {
    config: { rateLimit: followRouteRateLimitConfigProperty },
    preValidation: validateFunction({ RouteParams: getFollowerSchema }),
    handler: getFollower,
  });

  //Query Params (type: "pending" | "accepted")
  server.get("/followed/:type", {
    config: { rateLimit: followRouteRateLimitConfigProperty },

    preValidation: validateFunction({ RouteParams: getFollowedSchema }),
    handler: getFollowed,
  });

  server.post("/follow", {
    config: { rateLimit: followRouteRateLimitConfigProperty },

    preValidation: validateFunction({ BodyParams: followUserSchema }),
    handler: followUser,
  });

  server.put("/accept", {
    config: { rateLimit: acceptRouteRateLimitConfigProperty },
    preValidation: validateFunction({ BodyParams: acceptFollowRequestSchema }),
    handler: acceptFollowRequest,
  });

  server.delete("/reject", {
    config: { rateLimit: followRouteRateLimitConfigProperty },
    preValidation: validateFunction({ BodyParams: rejectFollowRequestSchema }),
    handler: rejectFollowRequest,
  });

  server.delete("/unfollow", {
    config: { rateLimit: followRouteRateLimitConfigProperty },
    preValidation: validateFunction({ BodyParams: unfollowUserSchema }),
    handler: unfollowUser,
  });

  server.delete("/remove", {
    config: { rateLimit: followRouteRateLimitConfigProperty },
    preValidation: validateFunction({ BodyParams: removeFollowerSchema }),
    handler: removeFollower,
  });

  server.delete("/retrieve", {
    config: { rateLimit: followRouteRateLimitConfigProperty },
    preValidation: validateFunction({ BodyParams: retrieveRequestSchema }),
    handler: retrieveRequest,
  });
  done();
}
