import { z } from "zod";
import { zScriptureSectionChapterVerseQuerySchema } from "../../../../../libs/utility/types/types";
import { chapterVerseValidateFunction } from "../../../../../libs/utility/function/chapterVerseValidateFunction";

export const getSuggestionsSchema = z
  .object(zScriptureSectionChapterVerseQuerySchema)
  .superRefine(chapterVerseValidateFunction);
