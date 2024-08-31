import type { FastifyRegisterOptions, Session } from "fastify";
import db from "../db/db";
import dotenv from "dotenv";
import type { FastifySessionOptions } from "@fastify/session";

dotenv.config();

export const secretKey = process.env.SESSION_STORAGE_SECRET_KEY;

if (!secretKey) throw new Error("Session storage key is undefined.");

export const sessionStorage = {
  get: (
    sessionId: string,
    callback: (err: unknown, result?: Session | null) => void
  ): void => {
    /*
      The reason I typed using curly brackets is that pg matches the data with the column header when pulling the data from the database. For example, the type of data that should come from here is as follows:
      { cookies: { [key:string]: unknown } }
      But for the reason I mentioned above, we receive this type of data:
      {session: { cookies: { [key:string]: unknown } } }}
      To prevent this situation, I need to access the “session” object, which is a subkey of the incoming data. We can avoid this by using this typing: { session: Session }
   */
    db.query<{ session: Session }>(
      "SELECT session FROM sessions WHERE id = $1",
      [sessionId]
    )
      .then((result) => {
        const [session] = result.rows;

        if (!session.session) throw new Error("Something went wrong!");

        callback(null, session.session);
      })
      .catch((error) => {
        callback(error, null);
      });
  },
  set: (
    sessionId: string,
    session: Session,
    callback: (err?: unknown) => void
  ): void => {
    db.query(
      "INSERT INTO sessions (id, expires_at, session) VALUES ($1, $2::TIMESTAMPTZ, $3) ON CONFLICT (id) DO UPDATE SET session = $3, expires_at = $2::TIMESTAMPTZ",
      [sessionId, session.cookie.expires, session]
    )
      .then((result) => {
        if (result.rowCount === 0)
          throw new Error("Session could NOT been inserted.");

        callback(null);
      })
      .catch((error) => {
        callback(error);
      });
  },

  destroy: (sessionId: string, callback: (err?: unknown) => void): void => {
    db.query("DELETE FROM sessions WHERE id = $1", [sessionId])
      .then((result) => {
        if (result.rowCount === 0)
          throw new Error("Session could NOT been deleted.");

        callback(null);
      })
      .catch((error) => {
        callback(error);
      });
  },
};

const MAX_AGE = 30000;

export const fastifySessionOptions: FastifyRegisterOptions<FastifySessionOptions> =
  {
    secret: secretKey,
    cookie: {
      maxAge: MAX_AGE,
      secure: false,
    },
    store: sessionStorage,
    saveUninitialized: true,
  };
