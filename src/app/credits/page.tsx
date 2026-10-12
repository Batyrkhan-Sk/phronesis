import type { Metadata } from "next";
import Link from "next/link";
import { IdeaThumb } from "@/components/idea/idea-image";
import { PageHeader } from "@/components/page-header";
import { getAllIdeas } from "@/lib/content";

export const metadata: Metadata = { title: "Image credits" };

export default function CreditsPage() {
  const illustrated = getAllIdeas().filter((i) => i.image);
  return (
    <div className="mx-auto max-w-[980px]">
      <PageHeader
        eyebrow="Credits"
        title="Image credits"
        subtitle="Every image on Phronesis is freely licensed and comes from Wikimedia Commons. Thank you to the photographers, artists and archivists who share their work."
      />
      <ul className="border-b border-rule">
        {illustrated.map((idea) => {
          const image = idea.image!;
          return (
            <li key={idea.slug} className="flex gap-4 border-t border-rule py-4 sm:gap-5">
              <IdeaThumb image={image} title={idea.title} className="aspect-square w-16 shrink-0 sm:w-20" sizes="80px" />
              <div className="min-w-0 text-[15.5px] leading-snug">
                <Link href={`/idea/${idea.slug}`} className="text-[18px] hover:text-accent">
                  {idea.title}
                </Link>
                <div className="mt-1 break-words text-ink-2">{image.credit}</div>
                <div className="label mt-1 flex flex-wrap gap-x-2 text-[10.5px] normal-case tracking-[0.04em]">
                  {image.licenseUrl ? (
                    <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline hover:text-ink">
                      {image.license}
                    </a>
                  ) : (
                    <span>{image.license}</span>
                  )}
                  <span aria-hidden>·</span>
                  <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                    File on Wikimedia Commons
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
