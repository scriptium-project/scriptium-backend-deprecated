import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { validateFunction } from "../../../../libs/utility/function/validateFunction";
import { createNote } from "./function/createNote";
import { deleteNote } from "./function/deleteNote";
import { getNote } from "./function/getNote";
import { updateNote } from "./function/updateNote";
import { createNoteSchema } from "./types/createNoteSchema";
import { deleteNoteSchema } from "./types/deleteNoteSchema";
import { getNotesSchema } from "./types/getNotesSchema";
import { updateNoteSchema } from "./types/updateNoteSchema";
import { rateLimitCreatorFunction } from "../../../../libs/utility/function/rateLimiterFunction";
import { REQUEST_COUNT_FOR_NOTE_ROUTE } from "./types/utility";

const noteRouteRateLimitConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_NOTE_ROUTE
);

export default function noteRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Notes

  //Prefix: /note

  //Query Params (chapterNumber:number, verseNumber: number) OR undefined
  server.get("/", {
    config: {
      rateLimit: noteRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ RouteParams: getNotesSchema }),
    handler: getNote,
  });

  server.get("/:scriptureNumber/:sectionNumber/:chapterNumber/:verseNumber", {
    config: {
      rateLimit: noteRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ RouteParams: getNotesSchema }),
    handler: getNote,
  });

  server.post("/create", {
    config: {
      rateLimit: noteRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ BodyParams: createNoteSchema }),
    handler: createNote,
  });

  server.put("/update", {
    config: {
      rateLimit: noteRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ BodyParams: updateNoteSchema }),
    handler: updateNote,
  });

  server.delete("/delete", {
    config: {
      rateLimit: noteRouteRateLimitConfigProperty,
    },
    preValidation: validateFunction({ BodyParams: deleteNoteSchema }),
    handler: deleteNote,
  });

  done();
}
