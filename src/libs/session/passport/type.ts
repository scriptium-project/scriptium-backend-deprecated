import type { UUID } from "crypto";
import type { AvailableRoles } from "../utility";

export type SerializedUser = string;

type RoleId = (typeof AvailableRoles)[keyof typeof AvailableRoles]["id"];

export type User = {
  id: UUID;
  username: string;
  name: string;
  surname: string;
  gender: "M" | "F" | null;
  biography: string | null;
  email: string | null;
  email_verified: Date | null;
  password: never;
  created_at: Date | null;
  last_active: Date | null;
  is_frozen: Date | null;
  is_private?: Date | null;
  role_id: RoleId;
  preferred_languageid: number;
};

//Extending the PassportUser interface
declare module "fastify" {
  interface PassportUser extends User {}
}
