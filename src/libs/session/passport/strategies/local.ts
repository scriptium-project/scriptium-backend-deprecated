import type { IVerifyOptions } from "passport-local";
import { Strategy as Local } from "passport-local";
import db from "../../../db/db";
import type { User } from "../type";
import bcrypt from "bcrypt";
import { SelectFromUserExceptPasswordQuery } from "../passport";

export const LocalStrategy = new Local(
  async (
    username: string,
    password: string,
    done: (
      error: unknown,
      user?: User | false,
      options?: IVerifyOptions
    ) => void
  ) => {
    try {
      const [user] = (
        await db.query<User>(
          `${SelectFromUserExceptPasswordQuery} WHERE id = $1 WHERE username = $1`,
          [username]
        )
      ).rows;
      if (!user)
        return done(null, false, { message: "Invalid username or password" });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return done(null, false, { message: "Invalid username or password" });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);
