import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import fs from "fs";

const DB_PATH = process.env.DATABASE_URL;

if (!fs.existsSync(DB_PATH!)) {
  fs.writeFileSync(DB_PATH!, "");
}
const sqlite = new Database(DB_PATH!);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
