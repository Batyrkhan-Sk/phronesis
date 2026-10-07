/**
 * Database credentials, shared by the app and drizzle.config.ts.
 *
 * Accepts the names set by the Turso Vercel integration (with our "DATABASE"
 * prefix, or its defaults) as well as our own DATABASE_URL / DATABASE_AUTH_TOKEN.
 * Falls back to the local SQLite file for development.
 */
const first = (...names: string[]) => names.map((n) => process.env[n]).find((v) => v);

export function databaseCredentials() {
  return {
    url: first("DATABASE_TURSO_DATABASE_URL", "TURSO_DATABASE_URL", "DATABASE_URL") ?? "file:local.db",
    authToken: first("DATABASE_TURSO_AUTH_TOKEN", "TURSO_AUTH_TOKEN", "DATABASE_AUTH_TOKEN"),
  };
}
