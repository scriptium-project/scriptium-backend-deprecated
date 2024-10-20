import { z } from "zod";
import { chapterVerseValidateFunction } from "../../../../../libs/utility/function/chapterVerseValidateFunction";
import { zScriptureSectionChapterVerseBodySchema } from "../../../../../libs/utility/types/types";
import {
  MAXIMUM_LENGTH_FOR_SUGGESTION_LENGTH,
  MAXIMUM_LENGTH_FOR_TRANSLATION_NAME,
} from "./utility";

export const createSuggestionSchema = z
  .object({
    ...zScriptureSectionChapterVerseBodySchema,
    translationName: z.string().min(1).max(MAXIMUM_LENGTH_FOR_TRANSLATION_NAME),
    suggestion: z.string().min(1).max(MAXIMUM_LENGTH_FOR_SUGGESTION_LENGTH),
  })
  .superRefine(chapterVerseValidateFunction);
