import { z } from "zod";

export const getNotificationsSchema = z.object({
  quantity: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    })
    .refine((val) => val === undefined || !isNaN(val), {
      message: "quantity must be a valid number",
    }),
});
