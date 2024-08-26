import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const defaultPort: number = 5432;

const db = new Pool({
  user: process.env.DATABASE_USERNAME,
  host: process.env.DATABASE_HOST || "localhost",
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: Number(process.env.DATABASE_PORT) || defaultPort,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default db;
