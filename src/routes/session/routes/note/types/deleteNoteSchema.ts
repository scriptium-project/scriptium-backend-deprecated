import { z } from "zod";

export const deleteNoteSchema = z.object({
  noteId: z.string().uuid(),
});
