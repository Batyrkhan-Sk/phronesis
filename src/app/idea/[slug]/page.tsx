import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IdeaCard, KIND_LABEL } from "@/components/idea/idea-card";
import { DepthReader } from "@/components/idea/depth-reader";
import { CopyButton, SaveControls } from "@/components/idea/save-controls";
import { Claims, Connections, SectionHeading, Sources, TrailNav } from "@/components/idea/idea-sections";
import { SectionTitle } from "@/components/page-header";
import { getAllIdeas, getIdea, getRecommendations, getTrailsForIdea, summarize } from "@/lib/content";
import { topicBySlug } from "@/lib/content/taxonomy";
import { catalogueNo } from "@/lib/format";

export function generateStaticParams() {
  return getAllIdeas().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/idea/[slug]">): Promise<Metadata> {
  const idea = getIdea((await params).slug);
  return idea ? { title: idea.title, description: idea.hook } : {};
}

export default async function IdeaPage({ params }: PageProps<"/idea/[slug]">) {
  const { slug } = await params;
  const idea = getIdea(slug);
  if (!idea) notFound();

  const trails = getTrailsForIdea(slug);
  const recs = getRecommendations(slug, 3);

  return (
    <article className="pt-12 sm:pt-16">
      <div className="flex flex-wrap gap-14">
        {/* Main column */}
        <div className="min-w-0 flex-[999_1_640px]">
          <div className="label flex flex-wrap gap-x-5 gap-y-1">
            <span>{catalogueNo(idea.no)}</span>
            <span>{KIND_LABEL[idea.kind]}</span>
            {idea.era && <span>{idea.era}</span>}
            <span className="flex flex-wrap gap-x-2">
              {idea.topics.map((t, i) => (
                <span key={t}>
                  <Link href={`/topic/${t}`} className="hover:text-ink">
                    {topicBySlug(t)!.name}
                  </Link>
                  {i < idea.topics.length - 1 && " ·"}
                </span>
              ))}
            </span>
          </div>
          <h1 className="mt-4 text-[44px] font-medium leading-[1.04] tracking-[-0.025em] sm:text-[64px] lg:text-[72px]">{idea.title}</h1>
          <p className="mt-5 max-w-[660px] text-[22px] italic leading-[1.45] text-ink-2 sm:text-[24px]">{idea.hook}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <SaveControls slug={idea.slug} title={idea.title} />
            <span className="label text-[11px]">{idea.readingMinutes} min read</span>
          </div>

          <div className="mt-12 max-w-[700px]">
            <DepthReader short={idea.short} bodyHtml={idea.bodyHtml} deepDiveHtml={idea.deepDiveHtml} />
          </div>

          {idea.quote && (
            <figure className="mt-14 max-w-[700px] border-y border-rule py-7">
              <blockquote className="text-[25px] italic leading-[1.4]">“{idea.quote.text}”</blockquote>
              <figcaption className="label mt-3">{idea.quote.by}</figcaption>
            </figure>
          )}

          {idea.conversationStarter && (
            <figure className="mt-14 max-w-[700px] border-b border-rule border-t-ink border-t py-7">
              <div className="flex items-center justify-between gap-4">
                <SectionHeading>Bring it up</SectionHeading>
                <CopyButton text={idea.conversationStarter} />
              </div>
              <blockquote className="mt-2 text-[25px] italic leading-[1.4]">“{idea.conversationStarter}”</blockquote>
            </figure>
          )}

          {idea.connections.length > 0 && (
            <section className="mt-16 max-w-[820px]">
              <SectionHeading>Follow the thread</SectionHeading>
              <div className="mt-4">
                <Connections idea={idea} />
              </div>
            </section>
          )}
        </div>

        {/* Side column */}
        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-10 lg:sticky lg:top-8 lg:self-start">
          <Claims claims={idea.claims} />
          <Sources sources={idea.sources} />
          {trails.map((t) => (
            <TrailNav key={t.slug} trail={t} slug={idea.slug} />
          ))}
        </aside>
      </div>

      {recs.length > 0 && (
        <>
          <SectionTitle title="You might also find interesting" />
          <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((r) => (
              <IdeaCard key={r.slug} idea={summarize(r)} />
            ))}
          </div>
        </>
      )}
    </article>
  );
}
