import { z } from "zod";

export const getSuggestionSchema = z.object({
  quantity: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .refine((val) => val === undefined || (Number.isInteger(val) && val >= 1), {
      message: "Quantity must be an integer greater than or equal to 1",
    })
    .optional(),
});
