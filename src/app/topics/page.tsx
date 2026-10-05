import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { getAllIdeas, getIdeasByMode } from "@/lib/content";
import { MODES, TOPICS } from "@/lib/content/taxonomy";
import { roman } from "@/lib/format";

export const metadata: Metadata = { title: "Topics & modes" };

export default function TopicsPage() {
  const all = getAllIdeas();
  return (
    <div>
      <PageHeader
        eyebrow="The index"
        title="Topics & modes"
        subtitle="Browse by subject, or by the kind of surprise you’re in the mood for."
      />

      <SectionTitle title="Ways to discover" />
      <ol className="grid gap-x-10 sm:grid-cols-2">
        {MODES.map((m, i) => (
          <li key={m.slug} className="border-b border-rule">
            <Link href={`/mode/${m.slug}`} className="group flex items-baseline gap-4 py-4">
              <span className="label w-9 shrink-0">{roman(i + 1)}.</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[22px] leading-snug transition-colors group-hover:text-accent">{m.name}</span>
                <span className="block text-[15.5px] italic text-ink-3">{m.blurb}</span>
              </span>
              <span className="label text-[11px]">{getIdeasByMode(m.slug).length}</span>
            </Link>
          </li>
        ))}
      </ol>

      <SectionTitle title="Subjects" />
      <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((t) => {
          const count = all.filter((i) => i.topics.includes(t.slug)).length;
          return (
            <li key={t.slug} className="border-b border-rule">
              <Link href={`/topic/${t.slug}`} className="group block py-4">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[22px] transition-colors group-hover:text-accent">{t.name}</span>
                  <span className="label text-[11px]">
                    {count} {count === 1 ? "idea" : "ideas"}
                  </span>
                </span>
                <span className="block text-[15.5px] italic text-ink-3">{t.blurb}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
