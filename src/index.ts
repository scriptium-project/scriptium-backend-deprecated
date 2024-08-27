import type { FastifyReply, FastifyRequest } from "fastify";
import fastify from "fastify";
import verseRoute from "./routes/verse/route";
import { HTTP_ACCEPTED_CODE } from "./routes/utility";
import pageRoute from "./routes/page/route";
import rootRoute from "./routes/root/route";

const server = fastify();

server.register(verseRoute);
server.register(pageRoute);
server.register(rootRoute);

server.get("/ping", async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.code(HTTP_ACCEPTED_CODE).send({ msg: "done" });
});

server.listen({ port: 8080 }, (err: Error | null, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
