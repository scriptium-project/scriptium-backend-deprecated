import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { validateFunction } from "../../../../libs/utility/function/validateFunction";
import { editSavedContent } from "./function/editSavedContent";
import { saveContent } from "./function/saveContent";
import { unsaveContent } from "./function/unsaveContent";
import { saveContentSchema } from "./types/saveContentSchema";
import { deleteContentSchema } from "./types/deleteContentSchema";
import { updateSavedContentSchema } from "./types/updateSavedContentSchema";
import { rateLimitCreatorFunction } from "../../../../libs/utility/function/rateLimiterFunction";
import { REQUEST_COUNT_FOR_SAVING_ROUTE } from "./types/utility";

const savingRouteRateLimitConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_SAVING_ROUTE
);

export default function savingRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Savings

  //Prefix: /save

  server.post("/save", {
    config: {
      rateLimit: savingRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ BodyParams: saveContentSchema }),
    handler: saveContent,
  });

  server.put("/edit", {
    config: {
      rateLimit: savingRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ BodyParams: updateSavedContentSchema }),
    handler: editSavedContent,
  });

  server.delete("/unsave", {
    config: {
      rateLimit: savingRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ BodyParams: deleteContentSchema }),
    handler: unsaveContent,
  });
  done();
}
