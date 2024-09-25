import { z } from "zod";
import { CHAPTER_COUNT } from "../../verse/types/utility";
import { chapterVerseValidateFunction } from "../../../libs/utility/function/chapterVerseValidateFunction";

export const deleteContentSchema = z
  .object({
    chapterNumber: z.number().int().min(1).max(CHAPTER_COUNT),
    verseNumber: z.number().int().min(1),
    collectionName: z.string().min(1),
  })
  .superRefine(chapterVerseValidateFunction);
