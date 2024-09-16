import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { getPage } from "./function/getPage";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { getPageSchema } from "./types/getPageSchema";
import { cacheCheckFunction } from "../../libs/utility/function/cacheCheckFunction";

export default function pageRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  server.get("/:pageNumber/:langCode?", {
    preValidation: validateFunction({ RouteParams: getPageSchema }),
    preHandler: cacheCheckFunction,
    handler: getPage,
  });

  done();
}
