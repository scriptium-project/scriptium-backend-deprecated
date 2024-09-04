import type { AvailableRoles } from "../../../routes/session/types/utility";

export type SerializedUser = string;

type RoleId = (typeof AvailableRoles)[keyof typeof AvailableRoles]["id"];

export type User = {
  id: string;
  username: string;
  name?: string | null;
  surname?: string | null;
  gender?: "M" | "F" | null;
  email?: string | null;
  email_verified?: Date | null;
  password: never;
  created_at?: Date | null;
  last_active?: Date | null;
  is_frozen?: Date | null;
  role_id: RoleId;
};

//Extending the PassportUser interface
declare module "fastify" {
  interface PassportUser extends User {}
}
