import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { IdeaPlate } from "@/components/idea/idea-card";
import { EmptyState } from "@/components/page-header";
import { NewCollectionButton } from "@/components/library/collection-forms";
import { requireUser } from "@/lib/auth/require";
import { getIdea } from "@/lib/content";
import { db, schema } from "@/lib/db";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const user = await requireUser("/library/collections");
  const cols = await db
    .select()
    .from(schema.collection)
    .where(eq(schema.collection.userId, user.id))
    .orderBy(desc(schema.collection.createdAt));
  const items = cols.length
    ? await db
        .select()
        .from(schema.collectionItem)
        .where(inArray(schema.collectionItem.collectionId, cols.map((c) => c.id)))
        .orderBy(desc(schema.collectionItem.addedAt))
    : [];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[44px] font-medium leading-tight tracking-[-0.02em]">Collections</h1>
        <NewCollectionButton />
      </div>
      {cols.length === 0 ? (
        <EmptyState title="No collections yet">
          Group ideas your own way, such as “Dinner-party stories”, “For my kids” or “Things about language”.
        </EmptyState>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {cols.map((c) => {
            const ideas = items
              .filter((i) => i.collectionId === c.id)
              .map((i) => getIdea(i.ideaSlug))
              .filter((i) => i !== undefined);
            return (
              <Link key={c.id} href={`/library/collections/${c.id}`} className="group flex gap-5 border border-rule bg-sheet p-5 transition-colors hover:border-ink">
                <div className="grid size-24 shrink-0 grid-cols-2 gap-1">
                  {[0, 1, 2, 3].map((n) =>
                    ideas[n] ? (
                      <IdeaPlate key={n} idea={ideas[n]} size="sm" className="!border-rule-strong [&_span]:!text-[13px]" />
                    ) : (
                      <span key={n} className="border border-dashed border-rule" />
                    ),
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-[24px] leading-tight transition-colors group-hover:text-accent">{c.name}</h2>
                  {c.description && <p className="mt-1 line-clamp-2 text-[15.5px] italic text-ink-2">{c.description}</p>}
                  <div className="label mt-2 text-[11px]">
                    {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
