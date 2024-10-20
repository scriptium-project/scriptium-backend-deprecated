import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { getVerse } from "./function/getVerse";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { getVerseSchema } from "./types/getVerseSchema";
import { cacheCheckFunction } from "../../libs/utility/function/cacheCheckFunction";
import { rateLimitCreatorFunction } from "../../libs/utility/function/rateLimiterFunction";
import { REQUEST_COUNT_FOR_VERSE_ROUTE } from "./types/utility";

export default function verseRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  server.get(
    "/:scriptureNumber/:sectionNumber/:chapterNumber/:verseNumber/:langCode?",
    {
      config: {
        rateLimit: rateLimitCreatorFunction(REQUEST_COUNT_FOR_VERSE_ROUTE),
      },
      preValidation: validateFunction({ RouteParams: getVerseSchema }),
      preHandler: cacheCheckFunction,
      handler: getVerse,
    }
  );

  done();
}
