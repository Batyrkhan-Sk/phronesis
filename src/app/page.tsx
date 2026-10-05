import Link from "next/link";
import { IdeaCard, IdeaPlate, KIND_LABEL } from "@/components/idea/idea-card";
import { SectionTitle } from "@/components/page-header";
import { TrailCard } from "@/components/trail-card";
import { getAllIdeas, getAllTrails, getIdeaOfTheDay, getIdeasByMode, summarize } from "@/lib/content";
import { MODES, TOPICS, topicBySlug } from "@/lib/content/taxonomy";
import { catalogueNo, roman } from "@/lib/format";

// Re-render at most hourly so the idea of the day rolls over.
export const revalidate = 3600;

export default function HomePage() {
  const now = new Date();
  const today = getIdeaOfTheDay(now);
  const topic = topicBySlug(today.topics[0])!;
  const all = getAllIdeas();
  const trails = getAllTrails();
  const starters = getIdeasByMode("conversation").filter((i) => i.slug !== today.slug).slice(0, 3);
  const strange = getIdeasByMode("strange").filter((i) => i.slug !== today.slug).slice(0, 3);

  return (
    <div>
      {/* Idea of the day */}
      <section className="pt-12 sm:pt-16">
        <div className="label flex flex-wrap justify-between gap-2 border-b border-ink pb-3">
          <span>Today · {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</span>
          <span>{all.length} ideas in the archive</span>
        </div>
        <Link href={`/idea/${today.slug}`} className="group mt-10 flex flex-wrap items-start gap-x-14 gap-y-8">
          <div className="min-w-0 flex-[999_1_560px]">
            <div className="label flex flex-wrap gap-x-5">
              <span>Idea of the day</span>
              <span>{catalogueNo(today.no)}</span>
              <span>{topic.name}</span>
              <span>{KIND_LABEL[today.kind]}</span>
            </div>
            <h1 className="mt-4 text-[44px] font-medium leading-[1.04] tracking-[-0.025em] transition-colors group-hover:text-accent sm:text-[68px]">
              {today.title}
            </h1>
            <p className="mt-5 max-w-[640px] text-[22px] italic leading-[1.45] text-ink-2">{today.hook}</p>
            <p className="mt-5 max-w-[640px] text-[18px] leading-[1.6]">{today.short}</p>
            <span className="label mt-8 inline-flex min-h-11 items-center bg-accent px-6 text-accent-ink">
              Read it · {today.readingMinutes} min
            </span>
          </div>
          <IdeaPlate idea={today} size="lg" className="aspect-square w-full max-w-[320px] flex-[1_1_240px]" />
        </Link>
      </section>

      {/* Discovery modes */}
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

      {/* Trails */}
      <SectionTitle
        title="Follow a trail"
        action={
          <Link href="/trails" className="label hover:text-ink">
            All trails →
          </Link>
        }
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {trails.slice(0, 3).map((t) => (
          <TrailCard key={t.slug} trail={t} />
        ))}
      </div>

      {/* Strange but true */}
      <SectionTitle
        title="Strange but true"
        action={
          <Link href="/mode/strange" className="label hover:text-ink">
            See all →
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {strange.map((i) => (
          <IdeaCard key={i.slug} idea={summarize(i)} />
        ))}
      </div>

      {/* Conversation starters */}
      <SectionTitle title="Bring these up tonight" />
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
        {starters.map((i) => (
          <Link key={i.slug} href={`/idea/${i.slug}`} className="group block">
            <blockquote className="text-[22px] italic leading-[1.4] transition-colors group-hover:text-accent">“{i.conversationStarter}”</blockquote>
            <div className="label mt-3 text-[11px]">From {catalogueNo(i.no)} · {i.title}</div>
          </Link>
        ))}
      </div>

      {/* Topics */}
      <SectionTitle
        title="The index"
        action={
          <Link href="/topics" className="label hover:text-ink">
            Topics & modes →
          </Link>
        }
      />
      <ul className="columns-2 gap-10 sm:columns-3 lg:columns-4">
        {TOPICS.map((t) => {
          const count = all.filter((i) => i.topics.includes(t.slug)).length;
          return (
            <li key={t.slug} className="break-inside-avoid border-b border-rule">
              <Link href={`/topic/${t.slug}`} className="group flex items-baseline justify-between gap-3 py-2.5">
                <span className="text-[18px] transition-colors group-hover:text-accent">{t.name}</span>
                <span className="label text-[11px]">{count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
