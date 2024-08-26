import type { AvailableLangCodes } from "../../utility";

export type getVerseSchema = {
  verseNumber: number;
  surahNumber: number;
  langCode?: keyof typeof AvailableLangCodes;
};

export type getVerseReplySchema = {
  data: {
    surah_number: number;
    surah_name_ar: string;
    verse_number: number;
    text: string;
    text_simplified: string;
    text_no_vowel: string;
    transliterations: {
      [langCode: string]: string;
    };
    meaning: {
      [langCode: string]: {
        surahName: string;
        surahNameMeaning: string;
      };
    };
    translation: {
      [langCode: string]: {
        [translationName: string]: {
          translationName: string;
          translation: string;
          translator: {
            [translatorName: string]: { url: string | null; lang: string };
          };
          footnotes: { text: string; index: number; number: number }[] | null;
        };
      } | null;
    };
    words: {
      word: string;
      root: {
        arabic: string;
        latin: string;
      };
    }[];
  };
};
