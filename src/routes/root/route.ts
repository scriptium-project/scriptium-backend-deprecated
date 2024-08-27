import type { FastifyInstance } from "fastify";
import { getRoot } from "./function/function";
import { validateFunction } from "../function";
import { getRootSchema } from "./types/types";

export default function rootRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: () => unknown
): void {
  server.get("/root/:rootLatin/:langCode?", {
    preValidation: validateFunction({ RouteParams: getRootSchema }),
    handler: getRoot,
  });

  done();
}
