export type getPageResponseSchema = {
  pageNumber: number;
  verses: Verse[];
};

//#region types
type Verse = {
  chapterNumber: number;
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
