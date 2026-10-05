import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { IdeaRow } from "@/components/idea/idea-card";
import { EmptyState } from "@/components/page-header";
import { ClearHistoryButton } from "@/components/library/clear-history-button";
import { requireUser } from "@/lib/auth/require";
import { getAllIdeas, getIdea, summarize } from "@/lib/content";
import { db, schema } from "@/lib/db";
import { relativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "History" };

export default async function HistoryPage() {
  const user = await requireUser("/library/history");
  const rows = await db
    .select()
    .from(schema.view)
    .where(eq(schema.view.userId, user.id))
    .orderBy(desc(schema.view.lastViewedAt))
    .limit(200);
  const items = rows.map((r) => ({ ...r, idea: getIdea(r.ideaSlug) })).filter((r) => r.idea);
  const total = getAllIdeas().length;
  const pct = Math.round((items.length / total) * 100);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[44px] font-medium leading-tight tracking-[-0.02em]">History</h1>
          {items.length > 0 && (
            <p className="mt-1 text-[18px] italic text-ink-2">
              You’ve discovered {items.length} of {total} ideas in the archive.
            </p>
          )}
        </div>
        {items.length > 0 && <ClearHistoryButton />}
      </div>
      {items.length > 0 && (
        <div className="mb-8">
          <div className="h-[3px] bg-rule">
            <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
          </div>
          <div className="label mt-2 text-[11px]">{pct}% explored</div>
        </div>
      )}
      {items.length === 0 ? (
        <EmptyState title="No history yet">Ideas you read will appear here, so you can find your way back to them.</EmptyState>
      ) : (
        <div className="border-b border-rule">
          {items.map((r) => (
            <IdeaRow
              key={r.ideaSlug}
              idea={summarize(r.idea!)}
              meta={
                <>
                  {relativeDate(r.lastViewedAt)}
                  {r.count > 1 && <div>Read {r.count}×</div>}
                </>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
