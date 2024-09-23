import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { logout } from "./function/logout";
import { validateFunction } from "../../libs/utility/function/validateFunction";
import { createContentSchema } from "./types/createContentSchema";
import { saveContent } from "./function/saveContent";
import { createCollection } from "./function/createCollection";
import { deleteCollection } from "./function/deleteCollection";
import { deleteCollectionSchema } from "./types/deleteCollectionSchema";
import { createCollectionSchema } from "./types/createCollectionSchema";
import { updateCollection } from "./function/updateCollection";
import { updateCollectionSchema } from "./types/updateCollectionSchema";
import { deleteContentSchema } from "./types/deleteContentSchema";
import { unsaveContent } from "./function/unsaveContent";
import { editSavedContent } from "./function/editSavedContent";
import { updateSavedContentSchema } from "./types/updateSavedContentSchema";
import { getCollection } from "./function/getCollection";
import { getCollectionSchema } from "./types/getCollectionSchema";
import { getNote } from "./function/getNote";
import { getNotesSchema } from "./types/getNotesSchema";
import { checkAuthentication } from "./types/utility";
import { createNote } from "./function/createNote";
import { createNoteSchema } from "./types/createNoteSchema";
import { updateNoteSchema } from "./types/updateNoteSchema";
import { deleteNote } from "./function/deleteNote";
import { deleteNoteSchema } from "./types/deleteNoteSchema";
import { updateNote } from "./function/updateNote";
import { getCommentSchema } from "./types/getCommentSchema";
import { createCommentSchema } from "./types/createCommentSchema";
import { updateCommentSchema } from "./types/updateCommentSchema";
import { deleteCommentSchema } from "./types/deleteCommentSchema";
import { getComment } from "./function/getComment";
import { createComment } from "./function/createComment";
import { updateComment } from "./function/updateComment";
import { deleteComment } from "./function/deleteComment";
import { followUserSchema } from "./types/followUserSchema";
import { rejectFollowRequestSchema } from "./types/rejectFollowRequestSchema";
import { rejectFollowRequest } from "./function/rejectFollowRequest";
import { acceptFollowRequest } from "./function/acceptFollowRequest";
import { acceptFollowRequestSchema } from "./types/acceptFollowRequestSchema";
import { followUser } from "./function/followUser";
import { getBlockedUsers } from "./function/getBlockedUsers";
import { blockUser } from "./function/blockUser";
import { unblockUser } from "./function/unblockUser";
import { blockUserSchema } from "./types/blockUserSchema";
import { unblockUserSchema } from "./types/unblockUserSchema";
import { unfollowUser } from "./function/unfollowUser";
import { unfollowUserSchema } from "./types/unfollowSchema";
import { getFollowerSchema } from "./types/getFollowerSchema";
import { getFollower } from "./function/getFollower";
import { alterAccountType } from "./function/alterAccountType";
import { removeFollower } from "./function/removeFollower";
import { removeFollowerSchema } from "./types/removeFollowerSchema";
import { retrieveRequest } from "./function/retrieveRequest";
import { retrieveRequestSchema } from "./types/retrieveRequestSchema";
import { getFollowedSchema } from "./types/getFollowedSchema";
import { getFollowed } from "./function/getFollowed";

export default function sessionRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Session

  server.addHook("preValidation", checkAuthentication);

  server.post("/logout", logout);

  server.put("/alter", alterAccountType);

  //Collections

  server.get("/collection", {
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
    preValidation: validateFunction({ BodyParams: createContentSchema }),
    handler: saveContent,
  });

  server.put("/save/edit", {
    preValidation: validateFunction({ BodyParams: updateSavedContentSchema }),
    handler: editSavedContent,
  });

  server.delete("/save/unsave", {
    preValidation: validateFunction({ BodyParams: deleteContentSchema }),
    handler: unsaveContent,
  });

  //Notes

  //Query Params (chapterNumber:number, verseNumber: number) OR undefined
  server.get("/note", {
    preValidation: validateFunction({ QueryStringParams: getNotesSchema }),
    handler: getNote,
  });

  server.post("/note/create", {
    preValidation: validateFunction({ BodyParams: createNoteSchema }),
    handler: createNote,
  });

  server.put("/note/update", {
    preValidation: validateFunction({ BodyParams: updateNoteSchema }),
    handler: updateNote,
  });

  server.delete("/note/delete", {
    preValidation: validateFunction({ BodyParams: deleteNoteSchema }),
    handler: deleteNote,
  });

  //Comments

  //Query Params (chapterNumber:number, verseNumber: number) OR undefined
  server.get("/comment", {
    preValidation: validateFunction({ QueryStringParams: getCommentSchema }),
    handler: getComment,
  });

  server.post("/comment/create", {
    preValidation: validateFunction({ BodyParams: createCommentSchema }),
    handler: createComment,
  });

  server.put("/comment/update", {
    preValidation: validateFunction({ BodyParams: updateCommentSchema }),
    handler: updateComment,
  });

  server.delete("/comment/delete", {
    preValidation: validateFunction({ BodyParams: deleteCommentSchema }),
    handler: deleteComment,
  });

  //Following

  //Query Params (type: "pending" | "accepted")
  server.get("/follow/follower/:type", {
    preValidation: validateFunction({ RouteParams: getFollowerSchema }),
    handler: getFollower,
  });

  //Query Params (type: "pending" | "accepted")
  server.get("/follow/followed/:type", {
    preValidation: validateFunction({ RouteParams: getFollowedSchema }),
    handler: getFollowed,
  });

  server.post("/follow/follow", {
    preValidation: validateFunction({ BodyParams: followUserSchema }),
    handler: followUser,
  });

  server.put("/follow/accept", {
    preValidation: validateFunction({ BodyParams: acceptFollowRequestSchema }),
    handler: acceptFollowRequest,
  });

  server.delete("/follow/reject", {
    preValidation: validateFunction({ BodyParams: rejectFollowRequestSchema }),
    handler: rejectFollowRequest,
  });

  server.delete("/follow/unfollow", {
    preValidation: validateFunction({ BodyParams: unfollowUserSchema }),
    handler: unfollowUser,
  });

  server.delete("/follow/remove", {
    preValidation: validateFunction({ BodyParams: removeFollowerSchema }),
    handler: removeFollower,
  });

  server.delete("/follow/retrieve", {
    preValidation: validateFunction({ BodyParams: retrieveRequestSchema }),
    handler: retrieveRequest,
  });

  //Block

  server.get("/block/get", {
    handler: getBlockedUsers,
  });

  server.post("/block/block", {
    preValidation: validateFunction({ BodyParams: blockUserSchema }),
    handler: blockUser,
  });

  server.delete("/block/unblock", {
    preValidation: validateFunction({ BodyParams: unblockUserSchema }),
    handler: unblockUser,
  });

  done();
}
