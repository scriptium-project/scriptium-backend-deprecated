import { z } from "zod";
import { CHAPTER_COUNT } from "../../verse/types/utility";
import { MAX_LENGTH_FOR_COLLECTION_NAME } from "./utility";
import { chapterVerseValidateFunction } from "../../../libs/utility/function/chapterVerseValidateFunction";

export const updateSavedContentSchema = z
  .object({
    chapterNumber: z.number().int().min(1).max(CHAPTER_COUNT),
    verseNumber: z.number().int().min(1),
    collectionName: z
      .string()
      .min(1)
      .max(MAX_LENGTH_FOR_COLLECTION_NAME)
      .optional(),
    newNote: z.string().min(1),
  })
  .superRefine(chapterVerseValidateFunction);
