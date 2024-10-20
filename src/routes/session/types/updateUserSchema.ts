import { registerSchema } from "../../auth/types/registerSchema";

//TODO: Email update will be integrated soon.
export const updateUserSchema = registerSchema
  .pick({
    username: true,
    name: true,
    surname: true,
    gender: true,
    biography: true,
    email: true,
    langCode: true,
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one property must be provided for update.",
  });
