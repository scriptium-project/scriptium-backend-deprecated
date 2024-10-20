import { z } from "zod";
import {
  MAX_LENGTH_FOR_USERNAME,
  MAX_LENGTH_FOR_EMAIL,
  MAX_LENGTH_FOR_PASSWORD,
} from "../../session/types/utility";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1)
    .max(Math.max(MAX_LENGTH_FOR_USERNAME, MAX_LENGTH_FOR_EMAIL))
    .refine(
      (identifier) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isUsername = /^[a-zA-Z0-9]+$/.test(identifier);
        return isEmail || isUsername;
      },
      {
        message:
          "Identifier must be a valid email or an alphanumeric username.",
      }
    ),
  password: z.string().min(1).max(MAX_LENGTH_FOR_PASSWORD),
});
