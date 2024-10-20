import { z } from "zod";
import { zScriptureSectionChapterVerseBodySchema } from "../../../../../libs/utility/types/types";
import { chapterVerseValidateFunction } from "../../../../../libs/utility/function/chapterVerseValidateFunction";
import { MAXIMUM_LENGTH_FOR_TRANSLATION_NAME } from "./utility";

export const deleteSuggestionSchema = z
  .object({
    ...zScriptureSectionChapterVerseBodySchema,
    translationName: z.string().min(1).max(MAXIMUM_LENGTH_FOR_TRANSLATION_NAME),
  })
  .superRefine(chapterVerseValidateFunction);
