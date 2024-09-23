export type getRootResponseSchema = {
  latin?: string;
  arabic?: string;
  meaning?: string;
  verses: Verses[];
};
//#region types
type Verses = {
  chapterNumber: number;
  verseNumber: number;
  verseText: string;
  transliteration: string;

  sequence: number;
  word: string;
  meaning?: string;
};
//#endregion
