import { Authenticator } from "@fastify/passport";
import type { SerializedUser } from "./type";
import type { User } from "./type";
import db from "../../db/db";

export const SelectFromUserExceptPasswordQuery = `SELECT id, username, name, surname, gender, biography, email, email_verified, created_at, last_active, is_private, role_id, preferred_languageId FROM "user"`;

export const fastifyPassport = new Authenticator();

fastifyPassport.registerUserSerializer<User, SerializedUser>(
  async (user, _request) => user.id
);

fastifyPassport.registerUserDeserializer<SerializedUser, User>(
  async (id, request) => {
    try {
      const {
        rows: [user],
      } = await db.query<User>(
        `${SelectFromUserExceptPasswordQuery} WHERE id = $1`,
        [id]
      );
      if (user === null) {
        request.session.destroy();
        return null as unknown as User;
      }

      return user;
    } catch (error) {
      console.error("Error deserializing user:", error);
      throw error;
    }
  }
);
