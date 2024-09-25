import { registerSchema } from "../../auth/types/registerSchema";

//TODO: Remove that and integrate email update.
export const updateUserSchema = registerSchema
  .partial()
  .omit({
    password: true,
    email: true,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one property must be provided for update.",
  });
