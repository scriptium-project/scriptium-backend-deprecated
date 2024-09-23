import { z } from "zod";
import {
  CHAPTER_COUNT,
  VERSE_COUNT_FOR_EACH_CHAPTER,
} from "../../verse/types/utility";

import { noteCheckFunction } from "./utility";

export const createNoteSchema = z
  .object({
    chapterNumber: z.number().int().min(1).max(CHAPTER_COUNT),
    verseNumber: z.number().int().min(1),
    note: z.string().min(1).transform(noteCheckFunction),
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
