import { z } from "zod";
import {
  langCodeRefineFunction,
  LENGTH_OF_LONGEST_ROOT,
  LENGTH_OF_SMALLEST_ROOT,
} from "../../utility";

export const getRootSchema = z.object({
  rootLatin: z
    .string()
    .min(LENGTH_OF_SMALLEST_ROOT)
    .max(LENGTH_OF_LONGEST_ROOT),
  langCode: z.string().min(1).optional().refine(langCodeRefineFunction, {
    message: "Invalid language code.",
  }),
});

export type getRootResponseSchema = {
  latin?: string;
  arabic?: string;
  meaning?: string;
  verses: Verses[];
};
//#region types
type Verses = {
  surahNumber: number;
  verseNumber: number;
  verseText: string;
  transliteration: string;

  sequence: number;
  word: string;
  meaning?: string;
};
//#endregion
