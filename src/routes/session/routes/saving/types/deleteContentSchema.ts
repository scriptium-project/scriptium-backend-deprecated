import { z } from "zod";
import { chapterVerseValidateFunction } from "../../../../../libs/utility/function/chapterVerseValidateFunction";
import { zScriptureSectionChapterVerseBodySchema } from "../../../../../libs/utility/types/types";

export const deleteContentSchema = z
  .object({
    ...zScriptureSectionChapterVerseBodySchema,
    collectionName: z.string().min(1).optional(),
  })
  .superRefine(chapterVerseValidateFunction);
