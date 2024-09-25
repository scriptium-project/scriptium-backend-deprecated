import type { z } from "zod";
import { VERSE_COUNT_FOR_EACH_CHAPTER } from "../../../routes/verse/types/utility";

type DataType = {
  verseNumber?: number;
  chapterNumber?: number;
  [key: string]: unknown;
};

export const chapterVerseValidateFunction = (
  data: DataType,
  ctx: z.RefinementCtx
): void => {
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
      type: "number",
      message: `verseNumber is too big; maximum upper limit is ${maxVerseNumber}`,
      path: ["verseNumber"],
    });
};
