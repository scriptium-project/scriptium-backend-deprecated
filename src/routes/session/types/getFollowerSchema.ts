import { z } from "zod";

export const getFollowerSchema = z.object({
  type: z.string().refine((value: string) => {
    if (!(value === "pending" || value === "accepted")) return false;
    return true;
  }),
});
