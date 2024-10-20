import { z } from "zod";

import { chapterVerseValidateFunction } from "../../../../../libs/utility/function/chapterVerseValidateFunction";
import { noteCheckFunction } from "./utility";
import { zScriptureSectionChapterVerseBodySchema } from "../../../../../libs/utility/types/types";

export const createNoteSchema = z
  .object({
    ...zScriptureSectionChapterVerseBodySchema,
    note: z.string().trim().min(1).transform(noteCheckFunction),
  })
  .superRefine(chapterVerseValidateFunction);
