import type { FastifyInstance } from "fastify";
import { getPage } from "./function/getPage";
import { validateFunction } from "../utility/function/validateFunction";
import { getPageSchema } from "./types/getPageSchema";

export default function pageRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: () => unknown
): void {
  server.get("/page/:pageNumber/:langCode?", {
    preValidation: validateFunction({ RouteParams: getPageSchema }),
    handler: getPage,
  });

  done();
}
