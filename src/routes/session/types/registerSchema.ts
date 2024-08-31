import { z } from "zod";
import {
  MAX_LENGTH_OF_NAME,
  MAX_LENGTH_OF_USERNAME,
  MAX_LENGTH_OF_EMAIL,
  MAX_LENGTH_OF_PASSWORD,
} from "./utility";

export const registerSchema = z.object({
  username: z.string().min(1).max(MAX_LENGTH_OF_USERNAME),
  name: z.string().min(1).max(MAX_LENGTH_OF_NAME),
  surname: z.string().min(1).max(MAX_LENGTH_OF_USERNAME),
  gender: z.string().min(1).max(1).optional(),
  email: z.string().min(1).max(MAX_LENGTH_OF_EMAIL),
  password: z.string().min(1).max(MAX_LENGTH_OF_PASSWORD),
});
