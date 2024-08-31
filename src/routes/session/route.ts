import type { FastifyInstance } from "fastify";
import { register } from "./function/register";
import { login } from "./function/login";
import { logout } from "./function/logout";
import { validateFunction } from "../utility/function/validateFunction";
import { registerSchema } from "./types/registerSchema";
import { loginSchema } from "./types/loginSchema";

export default function sessionRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: () => unknown
): void {
  server.post("/session/register", {
    preValidation: validateFunction({ BodyParams: registerSchema }),
    handler: register,
  });

  server.post("/session/login", {
    preValidation: validateFunction({ BodyParams: loginSchema }),
    handler: login,
  });

  server.post("/session/logout", {
    handler: logout,
  });

  done();
}
