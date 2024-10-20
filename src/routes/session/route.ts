import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { alterAccountType } from "./function/alterAccountType";
import { freezeUser } from "./function/freezeUser";
import { logout } from "./function/logout";
import { updatePassword } from "./function/updatePassword";
import { updateUser } from "./function/updateUser";
import blockRoute from "./routes/block/route";
import collectionRoute from "./routes/collection/route";
import commentRoute from "./routes/comment/route";
import followRoute from "./routes/follow/route";
import noteRoute from "./routes/note/route";
import savingRoute from "./routes/saving/route";
import { freezeUserSchema } from "./types/freezeUserSchema";
import { updatePasswordSchema } from "./types/updatePasswordSchema";
import { updateUserSchema } from "./types/updateUserSchema";
import { checkAuthentication } from "./types/utility";
import notificationRoute from "./routes/notification/route";
import likeRoute from "./routes/like/route";
import translationRoute from "./routes/translation/route";

export default function sessionRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  server.addHook("preValidation", checkAuthentication);

  //Session

  //Prefix: /session

  server.post("/logout", logout);

  server.put("/alter", alterAccountType);

  server.put("/update", {
    preValidation: validateFunction({ BodyParams: updateUserSchema }),
    handler: updateUser,
  });

  server.put("/update/password", {
    preValidation: validateFunction({ BodyParams: updatePasswordSchema }),
    handler: updatePassword,
  });

  server.put("/freeze", {
    preValidation: validateFunction({ BodyParams: freezeUserSchema }),
    handler: freezeUser,
  });

  server.register(blockRoute, { prefix: "/block" });
  server.register(collectionRoute, { prefix: "/collection" });
  server.register(commentRoute, { prefix: "/comment" });
  server.register(followRoute, { prefix: "/follow" });
  server.register(noteRoute, { prefix: "/note" });
  server.register(savingRoute, { prefix: "/save" });
  server.register(notificationRoute, { prefix: "/notification" });
  server.register(likeRoute, { prefix: "/like" });
  server.register(translationRoute, { prefix: "/translation" });

  done();
}
