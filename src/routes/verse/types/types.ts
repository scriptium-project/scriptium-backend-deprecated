import { z } from "zod";
import { langCodeRefineFunction } from "../../utility";
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

export type getVerseReplySchema = {
  data: {
    surah_number: number;
    surah_name_ar: string;
    verse_number: number;
    text: string;
    text_simplified: string;
    text_no_vowel: string;
    transliterations: Transliterations;
    meaning: SurahMeanings;
    translation: Translations;
    words: Word[];
  };
};
//#region types
type Transliterations = { [langCode: string]: string };

type SurahMeanings = {
  [langCode: string]: {
    surahName: string;
    surahNameMeaning: string;
  };
};

type Translation = {
  [translationName: string]: {
    translationName: string;
    translation: string;
    translators: Translators;
    footnotes: Footnote[] | null;
  };
} | null;

type Translations = {
  [langCode: string]: Translation;
};

type Translators = {
  [translatorName: string]: { url: string | null; lang: string };
};

type Footnote = { text: string; index: number; number: number };

type Word = {
  word: string;
  root: Root;
};

type Root = {
  arabic: string;
  latin: string;
};
//#endregion
