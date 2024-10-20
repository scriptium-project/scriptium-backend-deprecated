import { Scriptures } from "../types/utility";

export const isValidScriptureCode = (code: string): boolean => {
  if (!code) return false;

  return code in Scriptures;
};

export const transformScriptureNumber = (val: string): number =>
  Scriptures[val as keyof typeof Scriptures];
