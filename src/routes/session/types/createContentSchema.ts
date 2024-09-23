import { z } from "zod";
import {
  CHAPTER_COUNT,
  VERSE_COUNT_FOR_EACH_CHAPTER,
} from "../../verse/types/utility";

export const createContentSchema = z
  .object({
    chapterNumber: z.number().int().min(1).max(CHAPTER_COUNT),
    verseNumber: z.number().int().min(1),
    collectionName: z.string().min(1).optional(),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { chapterNumber, verseNumber } = data;
    let maxVerseNumber: number;

    if (
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
