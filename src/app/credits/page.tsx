import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CommonsCredit, IdeaThumb } from "@/components/idea/idea-image";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { getAllIdeas } from "@/lib/content";

export const metadata: Metadata = { title: "Credits" };

export default function CreditsPage() {
  const ideas = getAllIdeas();
  const illustrated = ideas.filter((i) => i.image);
  const filmed = ideas.filter((i) => i.media);
  return (
    <div className="mx-auto max-w-[980px]">
      <PageHeader
        eyebrow="Credits"
        title="Images and video"
        subtitle="Every image, video and animation on Phronesis is freely licensed and comes from Wikimedia Commons. Thank you to the photographers, artists, scientists and archivists who share their work."
      />

      {filmed.length > 0 && (
        <>
          <SectionTitle title="Video and animation" />
          <ul className="mb-14 border-b border-rule">
            {filmed.map((idea) => {
              const media = idea.media!;
              return (
                <li key={idea.slug} className="flex gap-4 border-t border-rule py-4 sm:gap-5">
                  <div className="relative aspect-square w-16 shrink-0 overflow-hidden bg-sheet sm:w-20">
                    <Image src={media.poster} alt="" fill sizes="80px" className="object-cover saturate-[0.85] dark:brightness-[0.92]" />
                  </div>
                  <Entry slug={idea.slug} title={idea.title} credit={media.credit}>
                    <CommonsCredit label={media.kind === "video" ? "Video" : "Animation"} {...media} />
                  </Entry>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <SectionTitle title="Images" />
      <ul className="border-b border-rule">
        {illustrated.map((idea) => {
          const image = idea.image!;
          return (
            <li key={idea.slug} className="flex gap-4 border-t border-rule py-4 sm:gap-5">
              <IdeaThumb image={image} title={idea.title} className="aspect-square w-16 shrink-0 sm:w-20" sizes="80px" />
              <Entry slug={idea.slug} title={idea.title} credit={image.credit}>
                <CommonsCredit label="Image" {...image} />
              </Entry>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Entry({ slug, title, credit, children }: { slug: string; title: string; credit: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 text-[15.5px] leading-snug">
      <Link href={`/idea/${slug}`} className="text-[18px] hover:text-accent">
        {title}
      </Link>
      <div className="mt-1 break-words text-ink-2">{credit}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
