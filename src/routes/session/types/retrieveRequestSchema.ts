import { z } from "zod";
import { registerSchema } from "../../auth/types/registerSchema";

export const retrieveRequestSchema = z.object({
  username: registerSchema.shape.username,
});
