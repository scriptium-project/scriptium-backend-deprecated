import { z } from "zod";
import { registerSchema } from "../../auth/types/registerSchema";

export const acceptFollowRequestSchema = z.object({
  username: registerSchema.shape.username,
});
