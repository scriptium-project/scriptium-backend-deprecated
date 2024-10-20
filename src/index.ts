import dotenv from "dotenv";

dotenv.config();

import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySession from "@fastify/session";
import type { FastifyReply, FastifyRequest } from "fastify";
import fastify from "fastify";
import { fastifySessionOptions } from "./libs/session/utility";
import { fastifyPassport } from "./libs/session/passport/passport";
import { LocalStrategy } from "./libs/session/passport/strategies/local";
import verseRoute from "./routes/verse/route";
import rootRoute from "./routes/root/route";
import authRoute from "./routes/auth/route";
import sessionRoute from "./routes/session/route";
import { recordRequestFunction } from "./libs/utility/function/recordRequestFunction";
import { HTTP_ACCEPTED_CODE } from "./libs/utility/types/utility";

const main = async (): Promise<void> => {
  const server = fastify();

  await server.register(fastifyCors, {
    origin: "http://localhost:3000",
    credentials: true,
  });

  await server.register(fastifyRateLimit);

  await server.register(fastifyCookie);
  await server.register(fastifySession, fastifySessionOptions);

  await server.register(fastifyPassport.initialize());
  await server.register(fastifyPassport.secureSession());
  fastifyPassport.use("local", LocalStrategy);

  await server.register(verseRoute, { prefix: "/verse" });
  // Temporary disabled. await server.register(pageRoute, { prefix: "/page" });
  await server.register(rootRoute, { prefix: "/root" });
  await server.register(authRoute, { prefix: "/auth" });
  await server.register(sessionRoute, { prefix: "/session" });

  /**
   * RATE LIMITING
   * In order to determine the average number of requests per endpoint, we need to record the incoming requests and find a feasible limit within the relevant comments and calculations on this table.
   * In this way, necessary interpretations and evaluations can be made for existing and future endpoints.
   */
  server.addHook("onSend", recordRequestFunction);

  server.get("/ping", {
    handler: async (request: FastifyRequest, response: FastifyReply) => {
      console.log(request.ip);
      return response.code(HTTP_ACCEPTED_CODE).send({
        msg: "done",
        ip: request.ip,
      });
    },
  });

  //This function is on the purpose of testing!
  server.get("/pong", {
    config: {
      rateLimit: {
        max: 2,
        timeWindow: 864e5,
        allowList: [],
        keyGenerator: () => {
          return 1;
        },
      },
    },
    handler: async (request: FastifyRequest, response: FastifyReply) => {
      return response.code(HTTP_ACCEPTED_CODE).send({
        msg: "done",
        session: request.session.sessionId,
        user: request.user,
        username: request.user?.username,
      });
    },
  });

  server.listen(
    {
      port: 8080,
      host: "0.0.0.0",
    },
    (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      const serverAddress = server.server.address();
      if (serverAddress && typeof serverAddress !== "string") {
        console.log(
          `Server listening at http://${serverAddress.address}:${serverAddress.port}`
        );
      } else {
        console.log(`Server listening at ${address}`);
      }
    }
  );
};

main();
