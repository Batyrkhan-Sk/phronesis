import { sqliteTable, text, integer, primaryKey, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });
const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

/* ── Better Auth tables ─────────────────────────────────────────── */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().default(now),
  updatedAt: timestamp("updated_at").notNull().default(now),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().default(now),
  updatedAt: timestamp("updated_at").notNull().default(now),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().default(now),
  updatedAt: timestamp("updated_at").notNull().default(now),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().default(now),
  updatedAt: timestamp("updated_at").notNull().default(now),
});

/* ── Phronesis tables ───────────────────────────────────────────── */

export const save = sqliteTable(
  "save",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    ideaSlug: text("idea_slug").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().default(now),
  },
  (t) => [primaryKey({ columns: [t.userId, t.ideaSlug] })],
);

export const collection = sqliteTable(
  "collection",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    emoji: text("emoji"),
    createdAt: timestamp("created_at").notNull().default(now),
  },
  (t) => [index("collection_user_idx").on(t.userId)],
);

export const collectionItem = sqliteTable(
  "collection_item",
  {
    collectionId: text("collection_id").notNull().references(() => collection.id, { onDelete: "cascade" }),
    ideaSlug: text("idea_slug").notNull(),
    addedAt: timestamp("added_at").notNull().default(now),
  },
  (t) => [primaryKey({ columns: [t.collectionId, t.ideaSlug] })],
);

export const view = sqliteTable(
  "view",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    ideaSlug: text("idea_slug").notNull(),
    count: integer("count").notNull().default(1),
    firstViewedAt: timestamp("first_viewed_at").notNull().default(now),
    lastViewedAt: timestamp("last_viewed_at").notNull().default(now),
  },
  (t) => [primaryKey({ columns: [t.userId, t.ideaSlug] }), index("view_recent_idx").on(t.userId, t.lastViewedAt)],
);
