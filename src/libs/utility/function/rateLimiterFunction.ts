import type { RateLimitPluginOptions } from "@fastify/rate-limit";
import type { FastifyRequest } from "fastify";
import { MILLISECONDS_IN_A_DAY } from "../types/utility";

export const defaultKeyGeneratorFunction: (
  req: FastifyRequest
) => string | number | Promise<string | number> = (request: FastifyRequest) => {
  return 1;
  return request.user?.id ?? request.ip;
};

type RateLimitOptionsObject = {
  timeWindow?: number;
  ban?: number;
  keyGenerator?: (
    req: FastifyRequest
  ) => string | number | Promise<string | number>;
};

export const rateLimitCreatorFunction = (
  max: number,
  {
    timeWindow = MILLISECONDS_IN_A_DAY,
    ban = 1,
    keyGenerator = defaultKeyGeneratorFunction,
  }: RateLimitOptionsObject | undefined = {}
): RateLimitPluginOptions => ({
  max,
  ban,
  keyGenerator,
  global: false,
  timeWindow: timeWindow,
  hook: "preHandler",
});
