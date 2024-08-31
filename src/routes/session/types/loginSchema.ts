import { z } from "zod";
import {
  MAX_LENGTH_OF_EMAIL,
  MAX_LENGTH_OF_PASSWORD,
  MAX_LENGTH_OF_USERNAME,
} from "./utility";

export const loginSchema = z
  .object({
    username: z.string().min(1).max(MAX_LENGTH_OF_USERNAME).optional(),
    email: z.string().min(1).max(MAX_LENGTH_OF_EMAIL).optional(),
    password: z.string().min(1).max(MAX_LENGTH_OF_PASSWORD),
  })
  .superRefine((data, ctx) => {
    const { username, email } = data;
    if (!(username || email))
      ctx.addIssue({
        path: ["username", "email"],
        code: "custom",
        message: "Username and empty cannot be empty..",
      });
  });
