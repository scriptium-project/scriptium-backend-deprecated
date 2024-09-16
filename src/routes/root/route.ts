import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { getRoot } from "./function/getRoot";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { getRootSchema } from "./types/getRootSchema";
import { cacheCheckFunction } from "../../libs/utility/function/cacheCheckFunction";

export default function rootRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  server.get("/:rootLatin/:langCode?", {
    preValidation: validateFunction({ RouteParams: getRootSchema }),
    preHandler: cacheCheckFunction,
    handler: getRoot,
  });

  done();
}
