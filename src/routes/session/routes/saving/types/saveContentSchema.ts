import { z } from "zod";
import { chapterVerseValidateFunction } from "../../../../../libs/utility/function/chapterVerseValidateFunction";
import { MAX_LENGTH_FOR_SAVING_NOTE } from "./utility";
import { MAX_LENGTH_FOR_COLLECTION_NAME } from "../../../types/utility";
import { zScriptureSectionChapterVerseBodySchema } from "../../../../../libs/utility/types/types";

export const saveContentSchema = z
  .object({
    ...zScriptureSectionChapterVerseBodySchema,
    collectionNames: z
      .array(z.string().trim().max(MAX_LENGTH_FOR_COLLECTION_NAME))
      .optional()
      .default([""]),
    note: z.string().trim().min(1).max(MAX_LENGTH_FOR_SAVING_NOTE).optional(),
  })
  .superRefine(chapterVerseValidateFunction);
