import { z } from "zod";
import { LIKEABLE_CONTENT } from "./utility";

export const likeContentSchema = z.object({
  contentId: z.string().uuid(),
  contentType: z.enum(LIKEABLE_CONTENT),
});
