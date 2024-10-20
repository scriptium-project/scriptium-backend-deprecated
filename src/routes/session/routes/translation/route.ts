import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { validateFunction } from "../../../../libs/utility/function/validateFunction";
import { deleteSuggestion } from "./function/deleteSuggestion";
import { getSuggestion } from "./function/getSuggestion";
import { getSuggestions } from "./function/getSuggestions";
import { deleteSuggestionSchema } from "./types/deleteSuggestionSchema";
import { getSuggestionSchema } from "./types/getSuggestionSchema";
import { getSuggestionsSchema } from "./types/getSuggestionsSchema";
import { createSuggestion } from "./function/createSuggestion";
import { createSuggestionSchema } from "./types/createSuggestionSchema";
import { rateLimitCreatorFunction } from "../../../../libs/utility/function/rateLimiterFunction";
import { REQUEST_COUNT_FOR_TRANSLATION_ROUTE } from "./types/utility";

const translationRouteRateLimitConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_TRANSLATION_ROUTE
);

export default function translationRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Savings

  //Prefix: /translation

  server.get("/:quantity?", {
    config: {
      rateLimit: translationRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ RouteParams: getSuggestionSchema }),
    handler: getSuggestions,
  });

  server.get("/:scriptureNumber/:sectionNumber/:chapterNumber/:verseNumber", {
    config: {
      rateLimit: translationRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ RouteParams: getSuggestionsSchema }),
    handler: getSuggestion,
  });

  server.post("/create", {
    config: {
      rateLimit: translationRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ BodyParams: createSuggestionSchema }),
    handler: createSuggestion,
  });

  server.delete("/delete", {
    config: {
      rateLimit: translationRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ BodyParams: deleteSuggestionSchema }),
    handler: deleteSuggestion,
  });

  done();
}
