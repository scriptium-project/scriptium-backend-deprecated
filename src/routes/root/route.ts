import type { FastifyInstance } from "fastify";
import { getRoot } from "./function/getRoot";
import { validateFunction } from "../utility/function/validateFunction";
import { getRootSchema } from "./types/getRootSchema";

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
