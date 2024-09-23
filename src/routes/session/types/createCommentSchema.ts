import { z } from "zod";
import {
  CHAPTER_COUNT,
  VERSE_COUNT_FOR_EACH_CHAPTER,
} from "../../verse/types/utility";
import { MAX_LENGTH_FOR_COMMENT } from "./utility";

export const createCommentSchema = z
  .object({
    verseNumber: z.number().int().min(1).optional(),
    chapterNumber: z.number().int().min(1).max(CHAPTER_COUNT).optional(),
    parentCommentId: z.string().uuid().optional(),
    comment: z.string().min(1).max(MAX_LENGTH_FOR_COMMENT),
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
