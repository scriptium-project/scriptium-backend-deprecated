import { z } from "zod";
import { MAX_LENGTH_FOR_COMMENT } from "../../../types/utility";
import { chapterVerseValidateFunction } from "../../../../../libs/utility/function/chapterVerseValidateFunction";
import { zScriptureSectionChapterVerseBodySchema } from "../../../../../libs/utility/types/types";

export const createCommentSchema = z
  .discriminatedUnion("type", [
    z
      .object({
        type: z.literal("verse"),
        ...zScriptureSectionChapterVerseBodySchema,
        parentCommentId: z.string().uuid().optional(),
        comment: z.string().trim().min(1).max(MAX_LENGTH_FOR_COMMENT),
      })
      .strict(),
    z
      .object({
        type: z.literal("note"),
        noteId: z.string().uuid(),
        parentCommentId: z.string().uuid().optional(),
        comment: z.string().trim().min(1).max(MAX_LENGTH_FOR_COMMENT),
      })
      .strict(),
  ])
  .superRefine(chapterVerseValidateFunction);
