import type { UUID } from "crypto";
import type { UserProperty } from "../../../../../libs/utility/types/types";

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
