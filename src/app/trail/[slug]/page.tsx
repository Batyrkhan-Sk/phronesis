import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IdeaMeta } from "@/components/idea/idea-card";
import { getAllTrails, getIdea, getTrail, summarize } from "@/lib/content";
import { roman } from "@/lib/format";

export function generateStaticParams() {
  return getAllTrails().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/trail/[slug]">): Promise<Metadata> {
  const trail = getTrail((await params).slug);
  return trail ? { title: trail.title, description: trail.description } : {};
}

export default async function TrailPage({ params }: PageProps<"/trail/[slug]">) {
  const trail = getTrail((await params).slug);
  if (!trail) notFound();

  return (
    <div className="mx-auto max-w-[860px] pt-12 sm:pt-16">
      <div className="label flex justify-between border-b border-ink pb-3">
        <span>Trail</span>
        <span>{trail.steps.length} steps</span>
      </div>
      <h1 className="mt-8 text-[44px] font-medium leading-[1.04] tracking-[-0.025em] sm:text-[64px]">{trail.title}</h1>
      <p className="mt-4 text-[22px] italic leading-[1.45] text-ink-2">{trail.description}</p>
      <div className="prose-idea mt-6" dangerouslySetInnerHTML={{ __html: trail.introHtml }} />
      <Link
        href={`/idea/${trail.steps[0].idea}`}
        className="label mt-8 inline-flex min-h-11 items-center bg-accent px-6 text-accent-ink hover:opacity-90"
      >
        Start the trail →
      </Link>

      <ol className="mt-14 border-t border-ink">
        {trail.steps.map((step, i) => {
          const idea = getIdea(step.idea)!;
          return (
            <li key={step.idea} className="grid gap-x-8 gap-y-2 border-b border-rule py-8 sm:grid-cols-[72px_minmax(0,1fr)]">
              <span className="text-[40px] font-medium leading-none text-ink-3">{roman(i + 1)}</span>
              <div className="min-w-0">
                <p className="text-[18px] italic leading-normal text-ink-2">{step.bridge}</p>
                <Link href={`/idea/${idea.slug}`} className="group mt-4 block">
                  <IdeaMeta idea={summarize(idea)} />
                  <span className="mt-1 block text-[28px] leading-[1.15] tracking-[-0.01em] transition-colors group-hover:text-accent">
                    {idea.title} <span aria-hidden>→</span>
                  </span>
                  <span className="mt-1 block text-[16.5px] text-ink-2">{idea.hook}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
