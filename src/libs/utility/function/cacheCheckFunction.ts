import type {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";
import db from "../../db/db";
import { HTTP_OK_CODE } from "../types/utility";

export const cacheCheckFunction = (
  request: FastifyRequest,
  response: FastifyReply,
  done: HookHandlerDoneFunction
): void => {
  db.query("SELECT data FROM cache WHERE key = $1", [request.url])
    .then((result) => {
      const [data] = result.rows;

      if (data !== undefined) return response.code(HTTP_OK_CODE).send(data);

      done();
    })
    .catch((error: Error) => {
      console.error(error);
      done(error);
    });
};
