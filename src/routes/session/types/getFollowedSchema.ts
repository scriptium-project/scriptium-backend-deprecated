import { z } from "zod";

export const getFollowedSchema = z.object({
  type: z.string().refine((value: string) => {
    if (!(value === "pending" || value === "accepted")) return false;
    return true;
  }),
});
