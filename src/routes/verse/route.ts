import type { FastifyInstance } from "fastify";
import { getVerse } from "./function/getVerse";
import { validateFunction } from "../utility/function/validateFunction";
import { getVerseSchema } from "./types/getVerseSchema";

export default function verseRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: () => unknown
): void {
  server.get("/verse/:surahNumber/:verseNumber/:langCode?", {
    preValidation: validateFunction({ RouteParams: getVerseSchema }),
    handler: getVerse,
  });

  done();
}
