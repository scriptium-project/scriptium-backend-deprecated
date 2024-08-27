import type { FastifyInstance } from "fastify";
import { getPage } from "./function/function";
import { getPageSchema } from "./types/types";
import { validateFunction } from "../function";

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
