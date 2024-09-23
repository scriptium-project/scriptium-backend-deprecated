import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { getVerse } from "./function/getVerse";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { getVerseSchema } from "./types/getVerseSchema";
import { cacheCheckFunction } from "../../libs/utility/function/cacheCheckFunction";

export default function verseRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  server.decorateRequest("cacheKey", null);
  server.get("/:chapterNumber/:verseNumber/:langCode?", {
    preValidation: validateFunction({ RouteParams: getVerseSchema }),
    preHandler: cacheCheckFunction,
    handler: getVerse,
  });

  done();
}
