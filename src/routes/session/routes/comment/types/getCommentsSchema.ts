// src/types/getCommentsSchema.ts
import { z } from "zod";
import { chapterVerseValidateFunction } from "../../../../../libs/utility/function/chapterVerseValidateFunction";
import { zScriptureSectionChapterVerseQuerySchema } from "../../../../../libs/utility/types/types";

export const getCommentsSchema = z
  .discriminatedUnion("type", [
    z
      .object({
        type: z.literal("verse"),
        ...zScriptureSectionChapterVerseQuerySchema,
      })
      .strict(),
    z
      .object({
        type: z.literal("note"),
        noteId: z.string().uuid({
          message: "noteId must be a valid UUID",
        }),
      })
      .strict(),
  ])
  .superRefine(chapterVerseValidateFunction);
