import { z } from "zod";
import { chapterVerseValidateFunction } from "../../../../../libs/utility/function/chapterVerseValidateFunction";
import { MAX_LENGTH_FOR_COLLECTION_NAME } from "../../../types/utility";
import { zScriptureSectionChapterVerseBodySchema } from "../../../../../libs/utility/types/types";

export const updateSavedContentSchema = z
  .object({
    ...zScriptureSectionChapterVerseBodySchema,
    collectionName: z
      .string()
      .trim()
      .min(1)
      .max(MAX_LENGTH_FOR_COLLECTION_NAME)
      .optional(),
    newNote: z.string().trim().min(1),
  })
  .superRefine(chapterVerseValidateFunction);
