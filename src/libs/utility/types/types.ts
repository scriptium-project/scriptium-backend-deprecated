import { z } from "zod";
import type { User } from "../../session/passport/type";
import {
  isValidScriptureCode,
  transformScriptureNumber,
} from "../function/isValidScriptureCode";

/**
 *  A comprehensive type for regular negative responses.
 */
export type NegativeResponse = {
  err: string;
  code: number;
  [key: string]: unknown;
};

/**
 *  A comprehensive type for regular positive responses.
 */
export type PositiveResponse = {
  msg: string;
  code?: number;
  [key: string]: unknown;
};

/**
 *
 * @param T is an object.
 * @returns Returns a type which guarantees that at least one of the properties that the object has you have passed is not undefined.
 */

export type AtLeastOneKeyGeneric<T> = Partial<T> &
  { [K in keyof T]: Pick<T, K> }[keyof T];

/**
 *
 * @param T is a key of User type.
 * @returns Returns the object filled with specified property(s) of User type.
 */
export type UserPick<T extends keyof User> = Pick<User, T>;

/**
 *
 * @param T is a key of User type.
 * @returns Returns the type of specified property of User type.
 */
export type UserProperty<T extends keyof User> = User[T];

export type CacheRow = {
  id: number;
  data: JSON;
  key: string;
};

export type ProcessResult = {
  code: number;
  message: string;
  success: boolean;
  [key: string]: unknown;
};

export const zScriptureSectionChapterVerseQuerySchema = {
  scriptureNumber: z
    .string()
    .min(1)
    .max(1)
    .refine(isValidScriptureCode)
    .transform(transformScriptureNumber),
  sectionNumber: z
    .string()
    .transform((val: string) => parseInt(val))
    .refine((val: number) => !isNaN(val), {
      message: "sectionNumber must be a valid number",
    }),
  chapterNumber: z
    .string()
    .transform((val: string) => parseInt(val))
    .refine((val: number) => !isNaN(val), {
      message: "chapterNumber must be a valid number",
    }),
  verseNumber: z
    .string()
    .transform((val: string) => parseInt(val))
    .refine((val: number) => !isNaN(val), {
      message: "verseNumber must be a valid number",
    }),
};

export const zScriptureSectionChapterVerseBodySchema = {
  scriptureNumber: z
    .string()
    .min(1)
    .max(1)
    .refine(isValidScriptureCode)
    .transform(transformScriptureNumber),
  sectionNumber: z.number().int(),
  chapterNumber: z.number().int(),
  verseNumber: z.number().int(),
};
