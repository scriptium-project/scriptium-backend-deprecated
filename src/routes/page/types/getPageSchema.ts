import { z } from "zod";
import {
  langCodeRefineFunction,
  MAX_PAGE_IN_QURAN,
} from "../../utility/types/utility";

export const getPageSchema = z.object({
  pageNumber: z
    .string()
    .transform((val: string) => parseInt(val))
    .refine((val: number) => !isNaN(val), {
      message: "pageNumber must be a valid number",
    })
    .refine((val: number) => val >= 0 && val <= MAX_PAGE_IN_QURAN, {
      message: "pageNumber must be between 0 and 620",
    }),
  langCode: z.string().min(1).optional().refine(
    langCodeRefineFunction,

    {
      message: "Invalid language code.",
    }
  ),
});
