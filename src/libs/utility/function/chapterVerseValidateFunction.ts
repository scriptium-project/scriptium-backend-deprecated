/* eslint-disable complexity */
import type { z } from "zod";
import { Scriptures } from "../types/utility";

type DataType = {
  scriptureNumber?: number;
  sectionNumber?: number;
  chapterNumber?: number;
  verseNumber?: number;
  [key: string]: unknown;
};

type Chapter = {
  verseCount: number;
};

type Section = {
  chapterCount: number;
  chapters: Record<number, Chapter>;
};

type Scripture = {
  sectionCount: number;
  sections: Record<number, Section>;
};

//This object indicate the boundaries of scriptures. TODO: Amend.
const SCRIPTURE_DATA: Record<number, Scripture> = {
  1: {
    sectionCount: 39,
    sections: {
      1: {
        chapterCount: 50,
        chapters: {
          1: { verseCount: 19 },
        },
      },
    },
  },
};

export const MIN_SCRIPTURE_NUMBER = 1;
export const MAX_SCRIPTURE_NUMBER = Object.keys(Scriptures).length;

export const chapterVerseValidateFunction = (
  data: DataType,
  ctx: z.RefinementCtx
): void => {
  const { scriptureNumber, sectionNumber, chapterNumber, verseNumber } = data;

  if (
    scriptureNumber === undefined ||
    sectionNumber === undefined ||
    chapterNumber === undefined ||
    verseNumber === undefined
  ) {
    return;
  }

  if (scriptureNumber < MIN_SCRIPTURE_NUMBER) {
    ctx.addIssue({
      code: "too_small",
      minimum: MIN_SCRIPTURE_NUMBER,
      inclusive: true,
      type: "number",
      message: `Scripture number is too small; minimum is ${MIN_SCRIPTURE_NUMBER}.`,
      path: ["scriptureNumber"],
    });
    return;
  }

  if (scriptureNumber > MAX_SCRIPTURE_NUMBER) {
    ctx.addIssue({
      code: "too_big",
      maximum: MAX_SCRIPTURE_NUMBER,
      inclusive: true,
      type: "number",
      message: `Scripture number is too big; maximum is ${MAX_SCRIPTURE_NUMBER}.`,
      path: ["scriptureNumber"],
    });
    return;
  }

  const scripture = SCRIPTURE_DATA[scriptureNumber];
  if (!scripture) {
    ctx.addIssue({
      code: "custom",
      message: `Scripture number ${scriptureNumber} does not exist.`,
      path: ["scriptureNumber"],
    });
    return;
  }

  // Validate sectionNumber
  if (sectionNumber < 1) {
    ctx.addIssue({
      code: "too_small",
      minimum: 1,
      inclusive: true,
      type: "number",
      message: `Section number is too small; minimum is 1.`,
      path: ["sectionNumber"],
    });
    return;
  }

  if (sectionNumber > scripture.sectionCount) {
    ctx.addIssue({
      code: "too_big",
      maximum: scripture.sectionCount,
      inclusive: true,
      type: "number",
      message: `Section number is too big; maximum is ${scripture.sectionCount} in scripture ${scriptureNumber}.`,
      path: ["sectionNumber"],
    });
    return;
  }

  const section = scripture.sections[sectionNumber];
  if (!section) {
    ctx.addIssue({
      code: "custom",
      message: `Section number ${sectionNumber} does not exist in scripture ${scriptureNumber}.`,
      path: ["sectionNumber"],
    });
    return;
  }

  // Validate chapterNumber
  if (chapterNumber < 1) {
    ctx.addIssue({
      code: "too_small",
      minimum: 1,
      inclusive: true,
      type: "number",
      message: `Chapter number is too small; minimum is 1.`,
      path: ["chapterNumber"],
    });
    return;
  }

  if (chapterNumber > section.chapterCount) {
    ctx.addIssue({
      code: "too_big",
      maximum: section.chapterCount,
      inclusive: true,
      type: "number",
      message: `Chapter number is too big; maximum is ${section.chapterCount} in section ${sectionNumber} of scripture ${scriptureNumber}.`,
      path: ["chapterNumber"],
    });
    return;
  }

  const chapter = section.chapters[chapterNumber];
  if (!chapter) {
    ctx.addIssue({
      code: "custom",
      message: `Chapter number ${chapterNumber} does not exist in section ${sectionNumber} of scripture ${scriptureNumber}.`,
      path: ["chapterNumber"],
    });
    return;
  }

  // Validate verseNumber
  if (verseNumber < 1) {
    ctx.addIssue({
      code: "too_small",
      minimum: 1,
      inclusive: true,
      type: "number",
      message: `Verse number is too small; minimum is 1.`,
      path: ["verseNumber"],
    });
    return;
  }

  if (verseNumber > chapter.verseCount) {
    ctx.addIssue({
      code: "too_big",
      maximum: chapter.verseCount,
      inclusive: true,
      type: "number",
      message: `Verse number is too big; maximum is ${chapter.verseCount} in chapter ${chapterNumber}.`,
      path: ["verseNumber"],
    });
    return;
  }
};

export const chapterVerseValidateFunctionRefine = (
  data: DataType,
  ctx: z.RefinementCtx
): boolean => {
  const { scriptureNumber, sectionNumber, chapterNumber, verseNumber } = data;

  if (
    scriptureNumber === undefined ||
    sectionNumber === undefined ||
    chapterNumber === undefined ||
    verseNumber === undefined
  )
    return false;

  if (scriptureNumber < MIN_SCRIPTURE_NUMBER) {
    ctx.addIssue({
      code: "too_small",
      minimum: MIN_SCRIPTURE_NUMBER,
      inclusive: true,
      type: "number",
      message: `Scripture number is too small; minimum is ${MIN_SCRIPTURE_NUMBER}.`,
      path: ["scriptureNumber"],
    });
    return false;
  }

  if (scriptureNumber > MAX_SCRIPTURE_NUMBER) {
    ctx.addIssue({
      code: "too_big",
      maximum: MAX_SCRIPTURE_NUMBER,
      inclusive: true,
      type: "number",
      message: `Scripture number is too big; maximum is ${MAX_SCRIPTURE_NUMBER}.`,
      path: ["scriptureNumber"],
    });
    return false;
  }

  const scripture = SCRIPTURE_DATA[scriptureNumber];
  if (!scripture) {
    ctx.addIssue({
      code: "custom",
      message: `Scripture number ${scriptureNumber} does not exist.`,
      path: ["scriptureNumber"],
    });
    return false;
  }

  // Validate sectionNumber
  if (sectionNumber < 1) {
    ctx.addIssue({
      code: "too_small",
      minimum: 1,
      inclusive: true,
      type: "number",
      message: `Section number is too small; minimum is 1.`,
      path: ["sectionNumber"],
    });
    return false;
  }

  if (sectionNumber > scripture.sectionCount) {
    ctx.addIssue({
      code: "too_big",
      maximum: scripture.sectionCount,
      inclusive: true,
      type: "number",
      message: `Section number is too big; maximum is ${scripture.sectionCount} in scripture ${scriptureNumber}.`,
      path: ["sectionNumber"],
    });
    return false;
  }

  const section = scripture.sections[sectionNumber];
  if (!section) {
    ctx.addIssue({
      code: "custom",
      message: `Section number ${sectionNumber} does not exist in scripture ${scriptureNumber}.`,
      path: ["sectionNumber"],
    });
    return false;
  }

  // Validate chapterNumber
  if (chapterNumber < 1) {
    ctx.addIssue({
      code: "too_small",
      minimum: 1,
      inclusive: true,
      type: "number",
      message: `Chapter number is too small; minimum is 1.`,
      path: ["chapterNumber"],
    });
    return false;
  }

  if (chapterNumber > section.chapterCount) {
    ctx.addIssue({
      code: "too_big",
      maximum: section.chapterCount,
      inclusive: true,
      type: "number",
      message: `Chapter number is too big; maximum is ${section.chapterCount} in section ${sectionNumber} of scripture ${scriptureNumber}.`,
      path: ["chapterNumber"],
    });
    return false;
  }

  const chapter = section.chapters[chapterNumber];
  if (!chapter) {
    ctx.addIssue({
      code: "custom",
      message: `Chapter number ${chapterNumber} does not exist in section ${sectionNumber} of scripture ${scriptureNumber}.`,
      path: ["chapterNumber"],
    });
    return false;
  }

  // Validate verseNumber
  if (verseNumber < 1) {
    ctx.addIssue({
      code: "too_small",
      minimum: 1,
      inclusive: true,
      type: "number",
      message: `Verse number is too small; minimum is 1.`,
      path: ["verseNumber"],
    });
    return false;
  }

  if (verseNumber > chapter.verseCount) {
    ctx.addIssue({
      code: "too_big",
      maximum: chapter.verseCount,
      inclusive: true,
      type: "number",
      message: `Verse number is too big; maximum is ${chapter.verseCount} in chapter ${chapterNumber}.`,
      path: ["verseNumber"],
    });
    return false;
  }
  return true;
};
