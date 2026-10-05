import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { IdeaRow } from "@/components/idea/idea-card";
import { EmptyState } from "@/components/page-header";
import { CollectionActions, RemoveFromCollectionButton } from "@/components/library/collection-forms";
import { requireUser } from "@/lib/auth/require";
import { getIdea, summarize } from "@/lib/content";
import { db, schema } from "@/lib/db";
import { relativeDate } from "@/lib/format";

export default async function CollectionPage({ params }: PageProps<"/library/collections/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/library/collections/${id}`);
  const col = await db.query.collection.findFirst({
    where: and(eq(schema.collection.id, id), eq(schema.collection.userId, user.id)),
  });
  if (!col) notFound();
  const rows = await db
    .select()
    .from(schema.collectionItem)
    .where(eq(schema.collectionItem.collectionId, id))
    .orderBy(desc(schema.collectionItem.addedAt));
  const items = rows.map((r) => ({ ...r, idea: getIdea(r.ideaSlug) })).filter((r) => r.idea);

  return (
    <>
      <Link href="/library/collections" className="label hover:text-ink">
        ← All collections
      </Link>
      <div className="mb-8 mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[44px] font-medium leading-tight tracking-[-0.02em]">{col.name}</h1>
          {col.description && <p className="mt-1 max-w-xl text-[18px] italic text-ink-2">{col.description}</p>}
        </div>
        <CollectionActions collection={{ id: col.id, name: col.name, description: col.description }} />
      </div>
      {items.length === 0 ? (
        <EmptyState title="This collection is empty">
          Open any idea and use <b className="not-italic">Add to a collection</b> to put it here.
        </EmptyState>
      ) : (
        <div className="border-b border-rule">
          {items.map((r) => (
            <div key={r.ideaSlug} className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <IdeaRow idea={summarize(r.idea!)} meta={<>Added {relativeDate(r.addedAt)}</>} />
              </div>
              <RemoveFromCollectionButton collectionId={col.id} slug={r.ideaSlug} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
