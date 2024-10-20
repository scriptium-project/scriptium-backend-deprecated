import { z } from "zod";
import { langCodeRefineFunction } from "../../../libs/utility/types/utility";
import {
  MIN_LENGTH_FOR_USERNAME,
  MAX_LENGTH_FOR_USERNAME,
  MIN_LETTERS_OR_NUMBERS_IN_USERNAME,
  MIN_LENGTH_FOR_NAME,
  MAX_LENGTH_FOR_NAME,
  MIN_LENGTH_FOR_SURNAME,
  MAX_LENGTH_FOR_SURNAME,
  MAX_LENGTH_FOR_BIOGRAPHY,
  MAX_LENGTH_FOR_EMAIL,
  MIN_LENGTH_FOR_PASSWORD,
  MAX_LENGTH_FOR_PASSWORD,
} from "../../session/types/utility";

export const registerSchema = z.object({
  username: z
    .string()
    .min(MIN_LENGTH_FOR_USERNAME, {
      message: `Username must be at least ${MIN_LENGTH_FOR_USERNAME} characters long.`,
    })
    .max(MAX_LENGTH_FOR_USERNAME, {
      message: `Username must be at most ${MAX_LENGTH_FOR_USERNAME} characters long.`,
    })
    .refine((value) => /^[a-zA-Z0-9_.]+$/.test(value), {
      message:
        "Username can only contain English letters, numbers, underscores, and dots.",
    })
    .refine(
      (value) =>
        (value.match(/[a-zA-Z0-9]/g) || []).length >=
        MIN_LETTERS_OR_NUMBERS_IN_USERNAME,
      {
        message: `Username must contain at least ${MIN_LETTERS_OR_NUMBERS_IN_USERNAME} letters or numbers.`,
      }
    ),
  name: z
    .string()
    .min(MIN_LENGTH_FOR_NAME, {
      message: `Name must be at least ${MIN_LENGTH_FOR_NAME} characters long.`,
    })
    .max(MAX_LENGTH_FOR_NAME, {
      message: `Name must be at most ${MAX_LENGTH_FOR_NAME} characters long.`,
    }),
  surname: z
    .string()
    .min(MIN_LENGTH_FOR_SURNAME, {
      message: `Surname must be at least ${MIN_LENGTH_FOR_SURNAME} characters long.`,
    })
    .max(MAX_LENGTH_FOR_SURNAME, {
      message: `Surname must be at most ${MAX_LENGTH_FOR_SURNAME} characters long.`,
    }),
  gender: z.enum(["M", "F"], {
    errorMap: () => ({ message: "Gender must be either 'M' or 'F'." }),
  }),
  biography: z
    .string()
    .min(1, { message: "Biography cannot be empty." })
    .max(MAX_LENGTH_FOR_BIOGRAPHY, {
      message: `Biography must be at most ${MAX_LENGTH_FOR_BIOGRAPHY} characters long.`,
    })
    .optional(),
  email: z
    .string()
    .min(1, { message: "Email cannot be empty." })
    .email({ message: "Invalid email format." })
    .max(MAX_LENGTH_FOR_EMAIL, {
      message: `Email must be at most ${MAX_LENGTH_FOR_EMAIL} characters long.`,
    })
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(MIN_LENGTH_FOR_PASSWORD, {
      message: `Password must be at least ${MIN_LENGTH_FOR_PASSWORD} characters long.`,
    })
    .max(MAX_LENGTH_FOR_PASSWORD, {
      message: `Password must be at most ${MAX_LENGTH_FOR_PASSWORD} characters long.`,
    })
    .refine((value) => !/^\s|\s$/.test(value), {
      message: "Password cannot start or end with whitespace.",
    }),
  langCode: z
    .string()
    .min(1)
    .refine(langCodeRefineFunction, {
      message: "Invalid language code.",
    })
    .default("en"),
});
