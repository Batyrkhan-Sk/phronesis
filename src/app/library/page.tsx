import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { IdeaRow } from "@/components/idea/idea-card";
import { EmptyState } from "@/components/page-header";
import { requireUser } from "@/lib/auth/require";
import { getIdea, summarize } from "@/lib/content";
import { db, schema } from "@/lib/db";
import { relativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Kept" };

export default async function SavedPage() {
  const user = await requireUser("/library");
  const rows = await db.select().from(schema.save).where(eq(schema.save.userId, user.id)).orderBy(desc(schema.save.createdAt));
  const saved = rows.map((r) => ({ ...r, idea: getIdea(r.ideaSlug) })).filter((r) => r.idea);

  return (
    <>
      <h1 className="mb-8 text-[44px] font-medium leading-tight tracking-[-0.02em]">Kept ideas</h1>
      {saved.length === 0 ? (
        <EmptyState title="Nothing kept yet">
          When something surprises you, press <b className="not-italic">Keep this</b> and it will wait for you here.{" "}
          <Link href="/" className="text-accent underline">
            Find something worth keeping →
          </Link>
        </EmptyState>
      ) : (
        <div className="border-b border-rule">
          {saved.map((r) => (
            <IdeaRow key={r.ideaSlug} idea={summarize(r.idea!)} meta={<>Kept {relativeDate(r.createdAt)}</>} />
          ))}
        </div>
      )}
    </>
  );
}
