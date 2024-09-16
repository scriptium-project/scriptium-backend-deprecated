import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { logout } from "./function/logout";
import { validateFunction } from "../../libs/utility/function/validateFunction";
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
import { getNote } from "./function/getNote";
import { getNotesSchema } from "./types/getNotesSchema";
import { checkAuthentication } from "./types/utility";
import { createNote } from "./function/createNote";
import { createNoteSchema } from "./types/createNoteSchema";

export default function sessionRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Session

  server.addHook("preHandler", checkAuthentication);

  server.post("/logout", { handler: logout });

  //Collections

  server.get("/collection/get", {
    preValidation: validateFunction({ BodyParams: getCollectionSchema }),
    handler: getCollection,
  });

  server.post("/collection/create", {
    preValidation: validateFunction({ BodyParams: createCollectionSchema }),
    handler: createCollection,
  });

  server.put("/collection/update", {
    preValidation: validateFunction({ BodyParams: updateCollectionSchema }),
    handler: updateCollection,
  });

  server.delete("/collection/delete", {
    preValidation: validateFunction({ BodyParams: deleteCollectionSchema }),
    handler: deleteCollection,
  });

  //Savings

  server.post("/save/save", {
    preValidation: validateFunction({ BodyParams: saveContentSchema }),
    handler: saveContent,
  });

  server.put("/save/edit", {
    preValidation: validateFunction({ BodyParams: editSavedContentSchema }),
    handler: editSavedContent,
  });

  server.delete("/save/unsave", {
    preValidation: validateFunction({ BodyParams: unsaveContentSchema }),
    handler: unsaveContent,
  });

  //Notes

  //Query Params (surahNumber:number, verseNumber: number) OR undefined
  server.get("/note/get", {
    preValidation: validateFunction({ QueryStringParams: getNotesSchema }),
    handler: getNote,
  });

  server.post("/note/create", {
    preValidation: validateFunction({ BodyParams: createNoteSchema }),
    handler: createNote,
  });

  done();
}
