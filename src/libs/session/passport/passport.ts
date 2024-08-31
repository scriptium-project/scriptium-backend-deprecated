import { Authenticator } from "@fastify/passport";
import type { SerializedUser } from "./type";
import type { User } from "./type";
import db from "../../db/db";

export const fastifyPassport = new Authenticator();

/*
 * The reason I create this type:
 * It is unnecessary to access the password as it can be vulnerable. At least for now...
 * We will also re-evaluate the password privately in cases where the password is required (username change, password change, etc.).
 */
type UserWithoutPassword = Omit<User, "password">;

fastifyPassport.registerUserSerializer<UserWithoutPassword, SerializedUser>(
  async (user, _request) => user.id
);

fastifyPassport.registerUserDeserializer<SerializedUser, UserWithoutPassword>(
  async (id, _request) => {
    try {
      const { rows } = await db.query<User>(
        "SELECT * FROM users WHERE id = $1",
        [id]
      );
      if (rows.length === 0) throw new Error("User not found!");

      return { ...rows[0], password: undefined };
    } catch (error) {
      console.error("Error deserializing user:", error);
      throw error;
    }
  }
);
