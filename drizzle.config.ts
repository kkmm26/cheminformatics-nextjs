import type { Config } from "drizzle-kit";

export default {
  schema: "./app/lib/db/schema.ts",
  out: "./app/lib/db/migrations",
  dialect: "sqlite",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
