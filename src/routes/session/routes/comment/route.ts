import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { rateLimitCreatorFunction } from "../../../../libs/utility/function/rateLimiterFunction";
import { validateFunction } from "../../../../libs/utility/function/validateFunction";
import { createComment } from "./function/createComment";
import { deleteComment } from "./function/deleteComment";
import { getComments } from "./function/getComments";
import { getOwnComments } from "./function/getOwnComments";
import { updateComment } from "./function/updateComment";
import { createCommentSchema } from "./types/createCommentSchema";
import { deleteCommentSchema } from "./types/deleteCommentSchema";
import { getCommentsSchema } from "./types/getCommentsSchema";
import { updateCommentSchema } from "./types/updateCommentSchema";
import { REQUEST_COUNT_FOR_COMMENT_ROUTE } from "./types/utility";

const commentRouteRateLimitConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_COMMENT_ROUTE
);

export default function commentRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Comments

  //Prefix: /comment

  server.get("", {
    config: { rateLimit: commentRouteRateLimitConfigProperty },
    handler: getOwnComments,
  });

  server.get(
    "/:type/:scriptureNumber/:sectionNumber/:chapterNumber/:verseNumber",
    {
      config: { rateLimit: commentRouteRateLimitConfigProperty },
      preValidation: validateFunction({ RouteParams: getCommentsSchema }),
      handler: getComments,
    }
  );

  server.get("/:type/:noteId", {
    config: { rateLimit: commentRouteRateLimitConfigProperty },
    preValidation: validateFunction({ RouteParams: getCommentsSchema }),
    handler: getComments,
  });

  server.post("/create", {
    config: { rateLimit: commentRouteRateLimitConfigProperty },
    preValidation: validateFunction({ BodyParams: createCommentSchema }),
    handler: createComment,
  });

  server.put("/update", {
    config: { rateLimit: commentRouteRateLimitConfigProperty },
    preValidation: validateFunction({ BodyParams: updateCommentSchema }),
    handler: updateComment,
  });

  server.delete("/delete", {
    config: { rateLimit: commentRouteRateLimitConfigProperty },
    preValidation: validateFunction({ BodyParams: deleteCommentSchema }),
    handler: deleteComment,
  });

  done();
}
