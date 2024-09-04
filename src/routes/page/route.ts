import type { FastifyInstance } from "fastify";
import { getPage } from "./function/getPage";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { getPageSchema } from "./types/getPageSchema";
import { cacheCheckFunction } from "../../libs/utility/function/cacheCheckFunction";

export default function pageRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: () => unknown
): void {
  server.get("/page/:pageNumber/:langCode?", {
    preValidation: validateFunction({ RouteParams: getPageSchema }),
    preHandler: cacheCheckFunction,
    handler: getPage,
  });

  done();
}
