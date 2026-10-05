import Link from "next/link";
import type { IdeaSummary } from "@/lib/content";
import { topicBySlug } from "@/lib/content/taxonomy";
import { catalogueNo } from "@/lib/format";

export const KIND_LABEL: Record<IdeaSummary["kind"], string> = {
  fact: "Fact",
  story: "Story",
  concept: "Concept",
  phenomenon: "Phenomenon",
  person: "Person",
  place: "Place",
  word: "Word origin",
  law: "Law",
  dish: "Dish",
  object: "Object",
  event: "Event",
};

/** A framed catalogue plate showing the idea's glyph. */
export function IdeaPlate({
  idea,
  className = "",
  size = "md",
}: {
  idea: Pick<IdeaSummary, "glyph" | "title" | "no">;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const glyph = idea.glyph ?? idea.title.replace(/[^\p{L}]/gu, "").slice(0, 1);
  const long = [...glyph].length > 3;
  const text = {
    sm: long ? "text-[13px] tracking-[0.08em]" : "text-[22px]",
    md: long ? "text-[22px] tracking-[0.12em]" : "text-[44px]",
    lg: long ? "text-[clamp(1.6rem,4vw,2.6rem)] tracking-[0.16em]" : "text-[clamp(3.5rem,8vw,6rem)]",
  }[size];
  return (
    <div className={`relative flex items-center justify-center border border-ink bg-sheet ${className}`} aria-hidden>
      {size !== "sm" && (
        <span className="label absolute left-3 top-2.5 text-[10.5px]">{catalogueNo(idea.no)}</span>
      )}
      <span className={`select-none font-medium leading-none text-ink ${text}`}>{glyph}</span>
    </div>
  );
}

export function IdeaMeta({ idea, className = "" }: { idea: IdeaSummary; className?: string }) {
  const topic = topicBySlug(idea.topics[0])!;
  return (
    <div className={`label flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] ${className}`}>
      <span>{catalogueNo(idea.no)}</span>
      <span>{KIND_LABEL[idea.kind]}</span>
      <span>{topic.name}</span>
    </div>
  );
}

export function IdeaCard({ idea }: { idea: IdeaSummary }) {
  return (
    <Link href={`/idea/${idea.slug}`} className="group flex flex-col border-t border-ink pt-4">
      <IdeaMeta idea={idea} />
      <h3 className="mt-2 text-[23px] font-medium leading-[1.2] tracking-[-0.01em] text-ink transition-colors group-hover:text-accent">
        {idea.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-[16.5px] leading-normal text-ink-2">{idea.hook}</p>
      <div className="label mt-auto flex gap-3 pt-4 text-[11px]">
        <span>{idea.readingMinutes} min</span>
        {idea.era && <span className="truncate">{idea.era}</span>}
      </div>
    </Link>
  );
}

export function IdeaRow({ idea, meta }: { idea: IdeaSummary; meta?: React.ReactNode }) {
  return (
    <Link href={`/idea/${idea.slug}`} className="group flex items-start gap-5 border-t border-rule py-4">
      <IdeaPlate idea={idea} size="sm" className="size-14 shrink-0" />
      <div className="min-w-0 flex-1">
        <IdeaMeta idea={idea} />
        <div className="mt-0.5 truncate text-[20px] leading-snug transition-colors group-hover:text-accent">{idea.title}</div>
        <div className="truncate text-[15.5px] text-ink-2">{idea.hook}</div>
      </div>
      {meta && <div className="label hidden shrink-0 pt-1 text-right text-[11px] sm:block">{meta}</div>}
    </Link>
  );
}

export function IdeaGrid({ ideas }: { ideas: IdeaSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
      {ideas.map((i) => (
        <IdeaCard key={i.slug} idea={i} />
      ))}
    </div>
  );
}
