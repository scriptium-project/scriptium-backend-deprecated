import { z } from "zod";
import { MAX_LENGTH_FOR_COMMENT } from "./utility";

export const updateCommentSchema = z.object({
  commentId: z.string().uuid(),
  updatedComment: z.string().min(1).max(MAX_LENGTH_FOR_COMMENT),
});
