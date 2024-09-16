import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { registerSchema } from "./types/registerSchema";
import { loginSchema } from "./types/loginSchema";
import { register } from "./function/register";
import { login } from "./function/login";

export default function authRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  server.post("/register", {
    preValidation: validateFunction({ BodyParams: registerSchema }),
    handler: register,
  });

  server.post("/login", {
    preValidation: validateFunction({ BodyParams: loginSchema }),
    handler: login,
  });

  done();
}
