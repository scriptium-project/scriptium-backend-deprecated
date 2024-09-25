import { z } from "zod";
import { CHAPTER_COUNT } from "../../verse/types/utility";

import { noteCheckFunction } from "./utility";
import { chapterVerseValidateFunction } from "../../../libs/utility/function/chapterVerseValidateFunction";

export const createNoteSchema = z
  .object({
    chapterNumber: z.number().int().min(1).max(CHAPTER_COUNT),
    verseNumber: z.number().int().min(1),
    note: z.string().min(1).transform(noteCheckFunction),
  })
  .superRefine(chapterVerseValidateFunction);
