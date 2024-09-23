import { z } from "zod";
import { MAX_LENGTH_FOR_USERNAME, MIN_LENGTH_FOR_USERNAME } from "./utility";

export const blockUserSchema = z.object({
  username: z
    .string()
    .min(MIN_LENGTH_FOR_USERNAME)
    .max(MAX_LENGTH_FOR_USERNAME),
});
