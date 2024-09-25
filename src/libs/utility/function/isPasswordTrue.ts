import bcrypt from "bcrypt";
import type { User } from "../../session/passport/type";
import db from "../../db/db";
import type { UserPick } from "../types/types";

/**
 * Checks if the provided userPassword matches the stored password for the given user.
 *
 * @param user - The user object with type User
 * @param userPassword - The plain-text password to verify.
 * @returns A promise that resolves to `true` if the password matches, `false` otherwise.
 * @throws An error if the database query fails or if the user is not found.
 */
export const isPasswordTrue = async (
  user: User,
  userPassword: string
): Promise<boolean> => {
  const queryString = 'SELECT password FROM "user" WHERE id = $1';

  try {
    const { rowCount, rows } = await db.query<UserPick<"password">>(
      queryString,
      [user.id]
    );

    if ((rowCount ?? 0) === 0) throw new Error("User not found.");

    const [{ password }] = rows;

    const isMatch = await bcrypt.compare(userPassword, password);

    return isMatch;
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error;
  }
};
