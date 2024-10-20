import type { UUID } from "crypto";
import type { UserProperty } from "../../../../../libs/utility/types/types";

export type Comment = {
  id: UUID;
  userId: UserProperty<"id">;
  text: string;
  verseId: number;
  created_at: Date;
  updated_at: Date;
};
