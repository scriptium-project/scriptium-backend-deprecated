import { z } from "zod";
import { CHAPTER_COUNT } from "../../verse/types/utility";
import { MAX_LENGTH_FOR_COMMENT } from "./utility";
import { chapterVerseValidateFunction } from "../../../libs/utility/function/chapterVerseValidateFunction";

export const createCommentSchema = z
  .object({
    verseNumber: z.number().int().min(1).optional(),
    chapterNumber: z.number().int().min(1).max(CHAPTER_COUNT).optional(),
    parentCommentId: z.string().uuid().optional(),
    comment: z.string().min(1).max(MAX_LENGTH_FOR_COMMENT),
  })
  .superRefine(chapterVerseValidateFunction);
