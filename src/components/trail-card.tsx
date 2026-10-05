import Link from "next/link";
import type { Trail } from "@/lib/content";
import { getIdea } from "@/lib/content";

export function TrailCard({ trail }: { trail: Trail }) {
  return (
    <Link href={`/trail/${trail.slug}`} className="group flex flex-col border border-rule bg-sheet p-6 transition-colors hover:border-ink">
      <div className="label flex justify-between text-[11px]">
        <span>Trail</span>
        <span>{trail.steps.length} steps</span>
      </div>
      <h3 className="mt-3 text-[25px] font-medium leading-[1.15] tracking-[-0.01em] transition-colors group-hover:text-accent">{trail.title}</h3>
      <p className="mt-2 text-[16px] italic leading-normal text-ink-2">{trail.description}</p>
      <ol className="mt-5 border-t border-rule">
        {trail.steps.map((s, i) => (
          <li key={s.idea} className="flex items-baseline gap-3 border-b border-rule py-2 text-[15.5px]">
            <span className="label w-5 shrink-0 text-[11px]">{i + 1}</span>
            <span className="truncate">{getIdea(s.idea)?.title}</span>
          </li>
        ))}
      </ol>
    </Link>
  );
}
