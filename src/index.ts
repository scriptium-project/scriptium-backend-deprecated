import type { FastifyReply, FastifyRequest } from "fastify";
import fastify from "fastify";
import verseRoute from "./routes/verse/route";
import { HTTP_ACCEPTED_CODE } from "./libs/utility/types/utility";
import pageRoute from "./routes/page/route";
import rootRoute from "./routes/root/route";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import { fastifyPassport } from "./libs/session/passport/passport";
import { LocalStrategy } from "./libs/session/passport/strategies/local";
import { fastifySessionOptions } from "./libs/session/utility";
import sessionRoute from "./routes/session/route";

const server = fastify();

server.register(fastifyCookie);
server.register(fastifySession, fastifySessionOptions);

server.register(fastifyPassport.initialize());
server.register(fastifyPassport.secureSession());
fastifyPassport.use("local", LocalStrategy);

server.register(verseRoute);
server.register(pageRoute);
server.register(rootRoute);
server.register(sessionRoute);

server.get("/ping", {
  handler: async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(HTTP_ACCEPTED_CODE).send({
      msg: "done",
      ip: request.ip,
    });
  },
});

//This function is on the purpose of testing!
server.get("/pong", {
  handler: async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(HTTP_ACCEPTED_CODE).send({
      msg: "done",
      session: request.session.sessionId,
      user: request.user,
      role: request.user?.role_id,
    });
  },
});

server.listen({ port: 8080 }, (err: Error | null, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
