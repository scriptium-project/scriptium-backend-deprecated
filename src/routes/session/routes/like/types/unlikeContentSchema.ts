import { z } from "zod";
import { LIKEABLE_CONTENT } from "./utility";

export const unlikeContentSchema = z.object({
  contentId: z.string().uuid(),
  contentType: z.enum(LIKEABLE_CONTENT),
});
