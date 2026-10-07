import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { databaseCredentials } from "./src/lib/db/credentials";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: databaseCredentials(),
});
