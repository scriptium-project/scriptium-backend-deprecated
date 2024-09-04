import { z } from "zod";
import { langCodeRefineFunction } from "../../../libs/utility/types/utility";
import { LENGTH_OF_LONGEST_ROOT, LENGTH_OF_SMALLEST_ROOT } from "./utility";

export const getRootSchema = z.object({
  rootLatin: z
    .string()
    .min(LENGTH_OF_SMALLEST_ROOT)
    .max(LENGTH_OF_LONGEST_ROOT),
  langCode: z.string().min(1).optional().refine(langCodeRefineFunction, {
    message: "Invalid language code.",
  }),
});
