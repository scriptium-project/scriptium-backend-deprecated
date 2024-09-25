import { z } from "zod";
import { registerSchema } from "../../auth/types/registerSchema";

const passwordShape = registerSchema.shape.password;

export const updatePasswordSchema = z.object({
  password: passwordShape,
  newPassword: passwordShape,
});
