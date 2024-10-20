import { z } from "zod";
import { registerSchema } from "../../../../auth/types/registerSchema";

export const removeFollowerSchema = z.object({
  username: registerSchema.shape.username,
});
