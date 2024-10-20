import { z } from "zod";
import { noteCheckFunction } from "./utility";

export const updateNoteSchema = z.object({
  noteId: z.string().uuid(),
  note: z.string().trim().min(1).transform(noteCheckFunction),
});
