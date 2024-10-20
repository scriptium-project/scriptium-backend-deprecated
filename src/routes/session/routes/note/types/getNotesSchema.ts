import { z } from "zod";
import { chapterVerseValidateFunctionRefine } from "../../../../../libs/utility/function/chapterVerseValidateFunction";
import { zScriptureSectionChapterVerseQuerySchema } from "../../../../../libs/utility/types/types";

export const getNotesSchema = z.union([
  z
    .object(zScriptureSectionChapterVerseQuerySchema)
    .superRefine(chapterVerseValidateFunctionRefine),
  z.object({}),
]);
