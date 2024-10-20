import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { registerSchema } from "./types/registerSchema";
import { loginSchema } from "./types/loginSchema";
import { register } from "./function/register";
import { login } from "./function/login";
import { rateLimitCreatorFunction } from "../../libs/utility/function/rateLimiterFunction";
import { REQUEST_COUNT_FOR_AUTH_ROUTE } from "./types/utility";

const authRouteRateLimitConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_AUTH_ROUTE
);

export default function authRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  server.post("/register", {
    config: { rateLimit: authRouteRateLimitConfigProperty },
    preValidation: validateFunction({ BodyParams: registerSchema }),
    handler: register,
  });

  server.post("/login", {
    config: { rateLimit: authRouteRateLimitConfigProperty },
    preValidation: validateFunction({ BodyParams: loginSchema }),
    handler: login,
  });

  done();
}
