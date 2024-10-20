import { registerSchema } from "../../auth/types/registerSchema";

export const freezeUserSchema = registerSchema.pick({ password: true });
