import { z } from "zod";

export const getFollowerSchema = z.object({
  type: z.enum(["pending", "accepted"]),
});
