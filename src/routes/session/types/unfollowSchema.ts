import { z } from "zod";
import { MAX_LENGTH_FOR_USERNAME, MIN_LENGTH_FOR_USERNAME } from "./utility";

export const unfollowUserSchema = z.object({
  username: z
    .string()
    .min(MIN_LENGTH_FOR_USERNAME, {
      message: `Username must be at least ${MIN_LENGTH_FOR_USERNAME} characters.`,
    })
    .max(MAX_LENGTH_FOR_USERNAME, {
      message: `Username must be no more than ${MAX_LENGTH_FOR_USERNAME} characters.`,
    }),
});
