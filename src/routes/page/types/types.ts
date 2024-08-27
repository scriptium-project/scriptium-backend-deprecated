import { langCodeRefineFunction, MAX_PAGE_IN_QURAN } from "../../utility";
import { z } from "zod";

export const getPageSchema = z.object({
  pageNumber: z
    .string()
    .transform((val: string) => parseInt(val))
    .refine((val: number) => !isNaN(val), {
      message: "pageNumber must be a valid number",
    })
    .refine((val: number) => val >= 0 && val <= MAX_PAGE_IN_QURAN, {
      message: "pageNumber must be between 0 and 620",
    }),
  langCode: z.string().min(1).optional().refine(
    langCodeRefineFunction,

    {
      message: "Invalid language code.",
    }
  ),
});

export type getPageResponseSchema = {
  pageNumber: number;
  verses: Verse[];
};

//#region types
type Verse = {
  surahNumber: number;
  verseNumber: number;
  text: string;
  textSimplified: string;
  textNoVowel: string;
  translations: Languages;
};

type Languages = {
  [langCode: string]: {
    transliteration: string;
    translations: Translation;
  };
};

type Translation = {
  [translationName: string]: {
    translationName: string;
    translation: string;
    translators: Translators;
    footnotes: Footnote[] | null;
  };
};

type Translators = {
  [translatorName: string]: { lang: string; url: string | null };
};

type Footnote = { text: string; index: number; number: number } | null;
//#endregion
