import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IdeaGrid } from "@/components/idea/idea-card";
import { EmptyState, PageHeader } from "@/components/page-header";
import { getIdeasByTopic, summarize } from "@/lib/content";
import { TOPICS, topicBySlug, type TopicSlug } from "@/lib/content/taxonomy";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/topic/[slug]">): Promise<Metadata> {
  const topic = topicBySlug((await params).slug);
  return topic ? { title: topic.name, description: topic.blurb } : {};
}

export default async function TopicPage({ params }: PageProps<"/topic/[slug]">) {
  const topic = topicBySlug((await params).slug);
  if (!topic) notFound();
  const ideas = getIdeasByTopic(topic.slug as TopicSlug).map(summarize);

  return (
    <div>
      <PageHeader eyebrow={`Subject · ${ideas.length} ${ideas.length === 1 ? "idea" : "ideas"}`} title={topic.name} subtitle={topic.blurb} />
      {ideas.length ? (
        <IdeaGrid ideas={ideas} />
      ) : (
        <EmptyState title="Nothing filed here yet">
          We’re still collecting ideas about {topic.name.toLowerCase()}. In the meantime,{" "}
          <Link href="/explore" className="text-accent underline">
            explore the archive
          </Link>
          .
        </EmptyState>
      )}
    </div>
  );
}
