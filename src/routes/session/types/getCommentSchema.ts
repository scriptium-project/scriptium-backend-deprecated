import { z } from "zod";
import {
  CHAPTER_COUNT,
  VERSE_COUNT_FOR_EACH_CHAPTER,
} from "../../verse/types/utility";

export const getCommentSchema = z
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
  .superRefine((data, ctx) => {
    const { chapterNumber, verseNumber } = data;
    let maxVerseNumber: number;

    if (
      chapterNumber &&
      verseNumber &&
      (maxVerseNumber = VERSE_COUNT_FOR_EACH_CHAPTER[chapterNumber - 1]) <
        verseNumber
    )
      ctx.addIssue({
        code: "too_big",
        maximum: maxVerseNumber,
        inclusive: true,
        type: "string",
        message: `verseNumber is too big; maximum upper limit is ${maxVerseNumber}`,
        path: ["verseNumber"],
      });
  });
