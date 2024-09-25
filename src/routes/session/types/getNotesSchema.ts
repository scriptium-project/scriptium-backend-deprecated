import { z } from "zod";
import { CHAPTER_COUNT } from "../../verse/types/utility";
import { chapterVerseValidateFunction } from "../../../libs/utility/function/chapterVerseValidateFunction";

export const getNotesSchema = z
  .object({
    verseNumber: z
      .string()
      .transform((val: string) => parseInt(val))
      .refine((val: number) => !isNaN(val), {
        message: "verseNumber must be a valid number",
      })
      .optional(),
    chapterNumber: z
      .string()
      .transform((val: string) => parseInt(val))
      .refine((val: number) => !isNaN(val), {
        message: "chapterNumber must be a valid number",
      })
      .refine((val: number) => val > 0 && val <= CHAPTER_COUNT, {
        message: "chapterNumber must be between 1 and 114",
      })
      .optional(),
  })
  .superRefine(chapterVerseValidateFunction);
