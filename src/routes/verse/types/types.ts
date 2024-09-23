export type getVerseReplySchema = {
  data: {
    chapter_number: number;
    chapter_number_ar: string;
    verse_number: number;
    text: string;
    text_simplified: string;
    text_no_vowel: string;
    transliterations: Transliterations;
    meaning: ChapterMeaning;
    translation: Translations;
    words: Word[];
  };
};
//#region types
type Transliterations = { [langCode: string]: string };

type ChapterMeaning = {
  [langCode: string]: {
    chapterNumber: number;
    chapterNameMeaning: string;
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
