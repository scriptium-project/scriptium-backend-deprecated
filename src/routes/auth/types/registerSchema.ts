import { z } from "zod";
import {
  MAX_LENGTH_FOR_EMAIL,
  MAX_LENGTH_FOR_PASSWORD,
  MAX_LENGTH_FOR_USERNAME,
  MAX_LENGTH_FOR_NAME,
  MAX_LENGTH_FOR_SURNAME,
  MIN_LENGTH_FOR_PASSWORD,
  MIN_LETTERS_IN_USERNAME,
  MIN_LENGTH_FOR_USERNAME,
  MIN_LENGTH_FOR_SURNAME,
  MIN_LENGTH_FOR_NAME,
  MAX_LENGTH_FOR_BIOGRAPHY,
} from "../../session/types/utility";

export const registerSchema = z.object({
  username: z
    .string()
    .min(MIN_LENGTH_FOR_USERNAME)
    .max(MAX_LENGTH_FOR_USERNAME)
    .refine((value) => /^[a-zA-Z0-9_-]+$/.test(value), {
      message:
        "Username can only contain letters, numbers, underscores, and hyphens.",
    })
    .refine(
      (value) =>
        (value.match(/[a-zA-Z]/g) || []).length >= MIN_LETTERS_IN_USERNAME,
      {
        message: `Username must contain at least ${MIN_LETTERS_IN_USERNAME} letters.`,
      }
    ),
  name: z
    .string()
    .min(MIN_LENGTH_FOR_NAME, {
      message: `Name must be at least ${MIN_LENGTH_FOR_NAME} characters long.`,
    })
    .max(MAX_LENGTH_FOR_NAME),
  surname: z
    .string()
    .min(MIN_LENGTH_FOR_SURNAME, {
      message: `Surname must be at least ${MIN_LENGTH_FOR_SURNAME} characters long.`,
    })
    .max(MAX_LENGTH_FOR_SURNAME),
  gender: z.string().length(1).optional(),
  biography: z.string().min(1).max(MAX_LENGTH_FOR_BIOGRAPHY).optional(),
  email: z
    .string()
    .min(1)
    .email({ message: "Invalid email format." })
    .max(MAX_LENGTH_FOR_EMAIL)
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(MIN_LENGTH_FOR_PASSWORD, {
      message: `Password must be at least ${MIN_LENGTH_FOR_PASSWORD} characters long.`,
    })
    .max(MAX_LENGTH_FOR_PASSWORD)
    .refine((value) => !/^\s|\s$/.test(value), {
      message: "Password cannot start or end with whitespace.",
    }),
});
