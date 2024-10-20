import type {
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from "fastify";
import db from "../../db/db";

export const recordRequestFunction = (
  request: FastifyRequest,
  response: FastifyReply,
  _payload: unknown,
  done: HookHandlerDoneFunction
): void => {
  const identifier: string = request.user?.id || request.ip.toString();
  const endpoint: string = request.url;
  const statusCode: number = response.statusCode;
  const method: string = request.raw.method ?? "\\unknown";

  //if (statusCode >= HTTP_INTERNAL_SERVER_ERROR_CODE) return done(); Since the api is on beta in order to identify and determine the issues. This will be not drafted this line into this process.//Implies that there is some problem in handling. So, request is not valid and it should not be recorded.
  const queryString =
    "INSERT INTO request_logs (identifier, endpoint, method, status_code, occurred_at) VALUES ($1,$2,$3,$4, CURRENT_TIMESTAMP)";
  db.query(queryString, [identifier, endpoint, method, statusCode])
    .then(({ rowCount }) => {
      if ((rowCount ?? 0) === 0)
        throw new Error("Something went unexpectedly wrong??");
      done();
    })
    .catch((err: Error) => {
      console.error(err);
      done(err);
    });
};
