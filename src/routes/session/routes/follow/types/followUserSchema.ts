import { registerSchema } from "../../../../auth/types/registerSchema";

export const followUserSchema = registerSchema.pick({ username: true });
