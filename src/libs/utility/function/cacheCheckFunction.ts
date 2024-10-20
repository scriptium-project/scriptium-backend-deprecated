import type {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";
import db from "../../db/db";
import { HTTP_OK_CODE } from "../types/utility";
import type { CacheRow } from "../types/types";

export const cacheCheckFunction = (
  request: FastifyRequest,
  response: FastifyReply,
  done: HookHandlerDoneFunction
): void => {
  db.query<Pick<CacheRow, "id" | "data">>(
    "SELECT id, data FROM cache WHERE key = $1",
    [request.url]
  )
    .then(({ rows }) => {
      const [row] = rows;

      if (row === undefined) return done();

      const { id, data } = row;

      db.query("INSERT INTO cache_r (cacheId) VALUES ($1)", [id])
        .then(() => {
          response.code(HTTP_OK_CODE).send(data);
        })
        .catch((error: Error) => {
          console.error("Error inserting record into cache_r:", error);
          done(error);
        });
    })
    .catch((error: Error) => {
      console.error("Error querying cache table:", error);
      done(error);
    });
};
