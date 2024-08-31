export type SerializedUser = string;

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
};
