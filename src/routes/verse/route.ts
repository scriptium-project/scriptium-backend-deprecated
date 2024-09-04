import type { FastifyInstance } from "fastify";
import { getVerse } from "./function/getVerse";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { getVerseSchema } from "./types/getVerseSchema";
import { cacheCheckFunction } from "../../libs/utility/function/cacheCheckFunction";

export default function verseRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: () => unknown
): void {
  server.decorateRequest("cacheKey", null);
  server.get("/verse/:surahNumber/:verseNumber/:langCode?", {
    preValidation: validateFunction({ RouteParams: getVerseSchema }),
    preHandler: cacheCheckFunction,
    handler: getVerse,
  });

  done();
}
