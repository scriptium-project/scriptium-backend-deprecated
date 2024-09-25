import { z } from "zod";
import { registerSchema } from "../../auth/types/registerSchema";

export const unfollowUserSchema = z.object({
  username: registerSchema.shape.username,
});
