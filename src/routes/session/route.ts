import type { FastifyInstance } from "fastify";
import { register } from "./function/register";
import { login } from "./function/login";
import { logout } from "./function/logout";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { registerSchema } from "./types/registerSchema";
import { loginSchema } from "./types/loginSchema";
import { saveContentSchema } from "./types/saveContentSchema";
import { saveContent } from "./function/saveContent";
import { createCollection } from "./function/createCollection";
import { deleteCollection } from "./function/deleteCollection";
import { deleteCollectionSchema } from "./types/deleteCollectionSchema";
import { createCollectionSchema } from "./types/createCollectionSchema";
import { updateCollection } from "./function/updateCollection";
import { updateCollectionSchema } from "./types/editCollectionSchema";
import { unsaveContentSchema } from "./types/unsaveContentSchema";
import { unsaveContent } from "./function/unsaveContent";
import { editSavedContent } from "./function/editSavedContent";
import { editSavedContentSchema } from "./types/editSavedContentSchema";
import { getCollection } from "./function/getCollection";
import { getCollectionSchema } from "./types/getCollectionSchema";

export default function sessionRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: () => unknown
): void {
  //Account

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

  //Collections

  server.get("/session/collection/get", {
    preValidation: validateFunction({ BodyParams: getCollectionSchema }),
    handler: getCollection,
  });

  server.post("/session/collection/create", {
    preValidation: validateFunction({ BodyParams: createCollectionSchema }),
    handler: createCollection,
  });

  server.put("/session/collection/update", {
    preValidation: validateFunction({ BodyParams: updateCollectionSchema }),
    handler: updateCollection,
  });

  server.delete("/session/collection/delete", {
    preValidation: validateFunction({ BodyParams: deleteCollectionSchema }),
    handler: deleteCollection,
  });

  //Savings

  server.post("/session/save/save", {
    preValidation: validateFunction({ BodyParams: saveContentSchema }),
    handler: saveContent,
  });

  server.put("/session/save/edit", {
    preValidation: validateFunction({ BodyParams: editSavedContentSchema }),
    handler: editSavedContent,
  });

  server.delete("/session/save/unsave", {
    preValidation: validateFunction({ BodyParams: unsaveContentSchema }),
    handler: unsaveContent,
  });

  done();
}
