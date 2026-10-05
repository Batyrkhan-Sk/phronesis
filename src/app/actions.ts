"use server";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getIdea } from "@/lib/content";
import { db, schema } from "@/lib/db";

const { save, collection, collectionItem, view } = schema;

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  return session.user;
}

function assertIdea(slug: string) {
  if (!getIdea(slug)) throw new Error(`Unknown idea: ${slug}`);
}

async function assertOwnsCollection(userId: string, collectionId: string) {
  const row = await db.query.collection.findFirst({
    where: and(eq(collection.id, collectionId), eq(collection.userId, userId)),
    columns: { id: true },
  });
  if (!row) throw new Error("Collection not found");
}

export type IdeaUserState = {
  signedIn: boolean;
  saved: boolean;
  collections: { id: string; name: string; emoji: string | null; has: boolean }[];
};

export async function getIdeaUserState(slug: string): Promise<IdeaUserState> {
  const session = await getSession();
  if (!session) return { signedIn: false, saved: false, collections: [] };
  const userId = session.user.id;

  const [saved, cols] = await Promise.all([
    db.query.save.findFirst({ where: and(eq(save.userId, userId), eq(save.ideaSlug, slug)), columns: { ideaSlug: true } }),
    db.select().from(collection).where(eq(collection.userId, userId)).orderBy(desc(collection.createdAt)),
  ]);
  const inCols = cols.length
    ? await db
        .select({ id: collectionItem.collectionId })
        .from(collectionItem)
        .where(and(eq(collectionItem.ideaSlug, slug), inArray(collectionItem.collectionId, cols.map((c) => c.id))))
    : [];
  const has = new Set(inCols.map((r) => r.id));

  return {
    signedIn: true,
    saved: Boolean(saved),
    collections: cols.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji, has: has.has(c.id) })),
  };
}

export async function toggleSave(slug: string): Promise<boolean> {
  const user = await requireUser();
  assertIdea(slug);
  const existing = await db.query.save.findFirst({ where: and(eq(save.userId, user.id), eq(save.ideaSlug, slug)) });
  if (existing) {
    await db.delete(save).where(and(eq(save.userId, user.id), eq(save.ideaSlug, slug)));
  } else {
    await db.insert(save).values({ userId: user.id, ideaSlug: slug });
  }
  revalidatePath("/library");
  return !existing;
}

export async function recordView(slug: string) {
  const session = await getSession();
  if (!session || !getIdea(slug)) return;
  await db
    .insert(view)
    .values({ userId: session.user.id, ideaSlug: slug })
    .onConflictDoUpdate({
      target: [view.userId, view.ideaSlug],
      set: { count: sql`${view.count} + 1`, lastViewedAt: new Date() },
    });
}

export async function clearHistory() {
  const user = await requireUser();
  await db.delete(view).where(eq(view.userId, user.id));
  revalidatePath("/library/history");
}

export async function createCollection(input: { name: string; description?: string; emoji?: string; withIdea?: string }) {
  const user = await requireUser();
  const name = input.name.trim().slice(0, 80);
  if (!name) throw new Error("A collection needs a name");
  const id = crypto.randomUUID();
  await db.insert(collection).values({
    id,
    userId: user.id,
    name,
    description: input.description?.trim().slice(0, 280) || null,
    emoji: input.emoji?.trim().slice(0, 4) || null,
  });
  if (input.withIdea) {
    assertIdea(input.withIdea);
    await db.insert(collectionItem).values({ collectionId: id, ideaSlug: input.withIdea });
  }
  revalidatePath("/library/collections");
  return id;
}

export async function toggleInCollection(collectionId: string, slug: string): Promise<boolean> {
  const user = await requireUser();
  assertIdea(slug);
  await assertOwnsCollection(user.id, collectionId);
  const where = and(eq(collectionItem.collectionId, collectionId), eq(collectionItem.ideaSlug, slug));
  const existing = await db.query.collectionItem.findFirst({ where });
  if (existing) await db.delete(collectionItem).where(where);
  else await db.insert(collectionItem).values({ collectionId, ideaSlug: slug });
  revalidatePath(`/library/collections/${collectionId}`);
  revalidatePath("/library/collections");
  return !existing;
}

export async function updateCollection(collectionId: string, input: { name: string; description?: string; emoji?: string }) {
  const user = await requireUser();
  await assertOwnsCollection(user.id, collectionId);
  const name = input.name.trim().slice(0, 80);
  if (!name) throw new Error("A collection needs a name");
  await db
    .update(collection)
    .set({ name, description: input.description?.trim().slice(0, 280) || null, emoji: input.emoji?.trim().slice(0, 4) || null })
    .where(eq(collection.id, collectionId));
  revalidatePath(`/library/collections/${collectionId}`);
  revalidatePath("/library/collections");
}

export async function deleteCollection(collectionId: string) {
  const user = await requireUser();
  await assertOwnsCollection(user.id, collectionId);
  await db.delete(collection).where(eq(collection.id, collectionId));
  revalidatePath("/library/collections");
}
