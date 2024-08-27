import type { FastifyInstance } from "fastify";
import { getVerse } from "./function/function";
import { validateFunction } from "../function";
import { getVerseSchema } from "./types/types";

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
