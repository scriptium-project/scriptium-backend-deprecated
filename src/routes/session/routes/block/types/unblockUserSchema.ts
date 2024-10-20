import { z } from "zod";
import { registerSchema } from "../../../../auth/types/registerSchema";

export const unblockUserSchema = z.object({
  username: registerSchema.shape.username,
});
