import { z } from "zod";

export const getFollowedSchema = z.object({
  type: z.enum(["pending", "accepted"]),
});
