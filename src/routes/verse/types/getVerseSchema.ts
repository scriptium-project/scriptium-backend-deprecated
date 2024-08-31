import { z } from "zod";
import { langCodeRefineFunction } from "../../utility/types/utility";
import { versesInSurahs } from "./utility";

export const getVerseSchema = z
  .object({
    verseNumber: z
      .string()
      .transform((val: string) => parseInt(val))
      .refine((val: number) => !isNaN(val), {
        message: "verseNumber must be a valid number",
      }),
    surahNumber: z
      .string()
      .transform((val: string) => parseInt(val))
      .refine((val: number) => !isNaN(val), {
        message: "surahNumber must be a valid number",
      })
      .refine((val: number) => val > 0 && val <= versesInSurahs.length, {
        message: "surahNumber must be between 1 and 114",
      }),
    langCode: z.string().min(1).optional().refine(
      langCodeRefineFunction,

      {
        message: "Invalid language code.",
      }
    ),
  })
  .superRefine((data, ctx) => {
    const { surahNumber, verseNumber } = data;
    if (
      !(versesInSurahs[surahNumber - 1] >= verseNumber === true ? true : false)
    )
      ctx.addIssue({
        path: ["verseNumber"],
        message: `Invalid verseNumber or surahNumber`,
        code: "custom",
      });
  });
