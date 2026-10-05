import Link from "next/link";
import type { Idea, Trail } from "@/lib/content";
import { getIdea } from "@/lib/content";
import { CLAIM_STATUS, CONNECTION_KINDS, type ClaimStatus } from "@/lib/content/taxonomy";

const STATUS_MARK: Record<ClaimStatus, { mark: string; color: string }> = {
  established: { mark: "●", color: "text-[var(--st-established)]" },
  interpretation: { mark: "◑", color: "text-[var(--st-interpretation)]" },
  disputed: { mark: "◐", color: "text-[var(--st-disputed)]" },
  anecdote: { mark: "◌", color: "text-[var(--st-anecdote)]" },
  myth: { mark: "○", color: "text-[var(--st-myth)]" },
};

export function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="label">
      {children}
    </h2>
  );
}

export function StatusLabel({ status }: { status: ClaimStatus }) {
  const s = STATUS_MARK[status];
  return (
    <span title={CLAIM_STATUS[status].hint} className={`font-mono text-[11px] font-medium uppercase tracking-[0.08em] ${s.color}`}>
      {s.mark} {CLAIM_STATUS[status].label}
    </span>
  );
}

export function Claims({ claims }: { claims: Idea["claims"] }) {
  if (!claims.length) return null;
  return (
    <section className="border border-rule bg-sheet p-6">
      <SectionHeading>Fact check</SectionHeading>
      <p className="mt-1 text-[14.5px] italic text-ink-3">What is established, what is interpretation, and what is just a good story.</p>
      <ul className="mt-5 flex flex-col gap-4">
        {claims.map((c, i) => (
          <li key={i} className="text-[16px] leading-[1.45]">
            <StatusLabel status={c.status} />
            <div className={c.status === "myth" ? "text-ink-3 line-through decoration-ink-3/60" : ""}>{c.text}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Sources({ sources }: { sources: Idea["sources"] }) {
  return (
    <section>
      <SectionHeading>Sources</SectionHeading>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-[16px] leading-[1.5] text-ink-2 marker:font-mono marker:text-[12px] marker:text-ink-3">
        {sources.map((s, i) => {
          const by = [s.author, s.year].filter(Boolean).join(", ");
          return (
            <li key={i}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-rule-strong underline-offset-[3px] hover:text-accent hover:decoration-accent">
                  {s.title}
                </a>
              ) : (
                <i>{s.title}</i>
              )}
              {by && <span className="text-ink-3"> — {by}</span>}
              <span className="label ml-2 text-[10.5px]">{s.type}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function Connections({ idea }: { idea: Idea }) {
  if (!idea.connections.length) return null;
  return (
    <ol>
      {idea.connections.map((c, i) => {
        const target = getIdea(c.slug)!;
        return (
          <li key={c.slug} className={`border-t border-rule ${i === idea.connections.length - 1 ? "border-b" : ""}`}>
            <Link href={`/idea/${c.slug}`} className="group grid gap-x-6 gap-y-1 py-5 sm:grid-cols-[140px_minmax(0,1fr)]">
              <span className="label pt-1.5 text-[11px]">{CONNECTION_KINDS[c.kind]}</span>
              <span className="min-w-0">
                <span className="block text-[23px] leading-snug text-ink transition-colors group-hover:text-accent">
                  {target.title} <span aria-hidden>→</span>
                </span>
                <span className="mt-1 block text-[16px] text-ink-2">{c.why}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function TrailNav({ trail, slug }: { trail: Trail; slug: string }) {
  const i = trail.steps.findIndex((s) => s.idea === slug);
  const next = trail.steps[i + 1];
  const nextIdea = next ? getIdea(next.idea) : null;
  return (
    <section className="border-t border-ink pt-4">
      <SectionHeading>On a trail</SectionHeading>
      <p className="mt-2 text-[20px] leading-snug">
        <Link href={`/trail/${trail.slug}`} className="hover:text-accent">
          {trail.title}
        </Link>{" "}
        <span className="label text-[11px]">
          {i + 1} / {trail.steps.length}
        </span>
      </p>
      <div className="mt-3 flex gap-1" aria-hidden>
        {trail.steps.map((s, j) => (
          <span key={s.idea} className={`h-[3px] flex-1 ${j <= i ? "bg-ink" : "bg-rule"}`} />
        ))}
      </div>
      {nextIdea ? (
        <Link href={`/idea/${nextIdea.slug}`} className="mt-3 inline-block text-[16px] text-accent hover:underline">
          Next: {nextIdea.title} →
        </Link>
      ) : (
        <p className="mt-3 text-[15px] italic text-ink-3">The end of this trail.</p>
      )}
    </section>
  );
}
