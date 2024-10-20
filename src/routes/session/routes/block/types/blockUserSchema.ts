import { z } from "zod";
import { registerSchema } from "../../../../auth/types/registerSchema";

export const blockUserSchema = z.object({
  username: registerSchema.shape.username,
});
