import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IdeaGrid } from "@/components/idea/idea-card";
import { PageHeader } from "@/components/page-header";
import { getIdeasByMode, summarize } from "@/lib/content";
import { MODES, modeBySlug, type ModeSlug } from "@/lib/content/taxonomy";
import { roman } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODES.map((m) => ({ mode: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/mode/[mode]">): Promise<Metadata> {
  const mode = modeBySlug((await params).mode);
  return mode ? { title: mode.name, description: mode.blurb } : {};
}

export default async function ModePage({ params }: PageProps<"/mode/[mode]">) {
  const mode = modeBySlug((await params).mode);
  if (!mode) notFound();
  const ideas = getIdeasByMode(mode.slug as ModeSlug).map(summarize);
  if (mode.slug === "learn-in-5") ideas.sort((a, b) => a.readingMinutes - b.readingMinutes);
  const n = MODES.findIndex((m) => m.slug === mode.slug) + 1;

  return (
    <div>
      <PageHeader eyebrow={`Mode ${roman(n)} · ${ideas.length} ideas`} title={mode.name} subtitle={mode.blurb} />
      <IdeaGrid ideas={ideas} />
    </div>
  );
}
