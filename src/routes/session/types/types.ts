import type { UUID } from "crypto";
import type { UserProperty } from "../../../libs/utility/types/types";

export type RowCountType = {
  row_count: number;
};

export type GetCollectionIdType = {
  collection_id?: number;
};

export type GetVerseIdType = {
  verse_id: number;
};

export type GetCollectionType = {
  [collectionName: string]: {
    description: string;
    verse: { text: string; withoutVowel: string; note: string };
  };
};

export type Comment = {
  id: UUID;
  userId: UserProperty<"id">;
  text: string;
  verseId: number;
  created_at: Date;
  updated_at: Date;
};
export type FOLLOW_STATUS = "pending" | "accepted";

export type FollowRequest = {
  id: UUID;
  follower_id: UserProperty<"id">;
  followed_id: UserProperty<"id">;
  status: FOLLOW_STATUS;
  followed_at: Date;
};

export type FollowRequestsStatus = {
  result: "not_found" | "already_done" | "done";
};

export type FollowerGetType = {
  username: string;
  name: string;
  surname: string;
  followed_at: Date;
};

export type FollowInformation = {
  id: UserProperty<"id">;
  is_private: UserProperty<"is_private">;
  is_blocked: boolean;
  is_already_following: boolean;
};
