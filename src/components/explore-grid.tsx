"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { IdeaSummary } from "@/lib/content";
import { TOPICS } from "@/lib/content/taxonomy";
import { IdeaCard } from "@/components/idea/idea-card";
import { TabRow } from "@/components/idea/depth-reader";

type Sort = "az" | "number" | "quick";

export function ExploreGrid({ ideas }: { ideas: IdeaSummary[] }) {
  const [topic, setTopic] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("az");

  const used = useMemo(() => TOPICS.filter((t) => ideas.some((i) => i.topics.includes(t.slug))), [ideas]);
  const shown = useMemo(() => {
    const list = topic ? ideas.filter((i) => (i.topics as readonly string[]).includes(topic)) : [...ideas];
    if (sort === "number") list.sort((a, b) => a.no - b.no);
    if (sort === "quick") list.sort((a, b) => a.readingMinutes - b.readingMinutes);
    return list;
  }, [ideas, topic, sort]);

  return (
    <>
      <div className="mb-10 flex flex-col gap-6">
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <Chip active={!topic} onClick={() => setTopic(null)} label={`All (${ideas.length})`} />
          {used.map((t) => (
            <Chip key={t.slug} active={topic === t.slug} onClick={() => setTopic(t.slug)} label={t.name} />
          ))}
        </div>
        <TabRow
          label="Sort"
          value={sort}
          onChange={setSort}
          options={[
            { value: "az", label: "A–Z" },
            { value: "number", label: "By number" },
            { value: "quick", label: "Quickest first" },
          ]}
        />
      </div>
      <motion.div layout className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((i) => (
            <motion.div
              key={i.slug}
              layout
              className="flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex w-full">
                <IdeaCard idea={i} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-9 text-[17px] transition-colors ${
        active ? "text-accent underline decoration-1 underline-offset-[5px]" : "text-ink-2 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
