import type { FastifyInstance } from "fastify";
import { getVerse } from "./function/function";

export default function verseRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: () => unknown
): void {
  server.get("/verse/:surahNumber/:verseNumber/:langCode?", getVerse);

  done();
}
