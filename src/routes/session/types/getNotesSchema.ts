import { z } from "zod";
import { CHAPTER_COUNT, versesInSurahs } from "../../verse/types/utility";

export const getNotesSchema = z
  .object({
    verseNumber: z
      .string()
      .transform((val: string) => parseInt(val))
      .refine((val: number) => !isNaN(val), {
        message: "verseNumber must be a valid number",
      })
      .optional(),
    surahNumber: z
      .string()
      .transform((val: string) => parseInt(val))
      .refine((val: number) => !isNaN(val), {
        message: "surahNumber must be a valid number",
      })
      .refine((val: number) => val > 0 && val <= CHAPTER_COUNT, {
        message: "surahNumber must be between 1 and 114",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const { surahNumber, verseNumber } = data;
    if (
      surahNumber &&
      verseNumber &&
      !(versesInSurahs[surahNumber - 1] >= verseNumber === true ? true : false)
    )
      ctx.addIssue({
        path: ["verseNumber", "surahNumber"],
        message: `Invalid verseNumber or surahNumber`,
        code: "custom",
      });
  });
