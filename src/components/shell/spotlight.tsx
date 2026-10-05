"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MODES, TOPICS } from "@/lib/content/taxonomy";
import { catalogueNo } from "@/lib/format";
import { useShell } from "./app-shell";

type Result = { key: string; href: string; title: string; subtitle: string; mark: string; group: string };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[“”"’']/g, "");

function score(haystack: string, q: string) {
  const h = norm(haystack);
  if (h.startsWith(q)) return 3;
  if (h.includes(" " + q)) return 2;
  if (h.includes(q)) return 1;
  return 0;
}

export function Spotlight({ open, onClose }: { open: boolean; onClose: () => void }) {
  // The panel mounts fresh on every open, so its query starts empty.
  return <AnimatePresence>{open && <SpotlightPanel onClose={onClose} />}</AnimatePresence>;
}

function SpotlightPanel({ onClose }: { onClose: () => void }) {
  const { index, trails } = useShell();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo<Result[]>(() => {
    const q = norm(query.trim());
    const ideas = index
      .map((i) => ({
        s: q ? score(i.title, q) * 3 + score(i.hook, q) + (i.topics.some((t) => norm(t).includes(q)) ? 1 : 0) : 1,
        r: {
          key: `i-${i.slug}`,
          href: `/idea/${i.slug}`,
          title: i.title,
          subtitle: i.hook,
          mark: catalogueNo(i.no),
          group: q ? "Ideas" : "Suggestions",
        },
      }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, q ? 8 : 5)
      .map((x) => x.r);

    if (!q) return ideas;

    const trailHits = trails
      .filter((t) => norm(t.title + " " + t.description).includes(q))
      .map<Result>((t) => ({ key: `tr-${t.slug}`, href: `/trail/${t.slug}`, title: t.title, subtitle: t.description, mark: "Trail", group: "Trails" }));
    const topics = TOPICS.filter((t) => norm(t.name).includes(q)).map<Result>((t) => ({
      key: `t-${t.slug}`,
      href: `/topic/${t.slug}`,
      title: t.name,
      subtitle: t.blurb,
      mark: "Topic",
      group: "Topics",
    }));
    const modes = MODES.filter((m) => norm(m.name).includes(q)).map<Result>((m) => ({
      key: `m-${m.slug}`,
      href: `/mode/${m.slug}`,
      title: m.name,
      subtitle: m.blurb,
      mark: "Mode",
      group: "Modes",
    }));
    return [...ideas, ...trailHits, ...topics, ...modes];
  }, [query, index, trails]);

  const go = (r: Result | undefined) => {
    if (!r) return;
    onClose();
    router.push(r.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") go(results[active]);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search">
      <motion.div
        className="absolute inset-0 bg-[#1e1c19]/30 dark:bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-[680px] border border-ink bg-sheet shadow-[0_24px_60px_rgba(30,28,25,0.18)]"
        onKeyDown={onKeyDown}
      >
        <label className="flex items-center gap-4 border-b border-ink px-5">
          <span className="label">Search</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="an idea, a word, a century…"
            className="h-16 min-w-0 flex-1 bg-transparent text-[22px] italic outline-none placeholder:text-ink-3 focus-visible:outline-none"
          />
          <span className="label hidden text-[11px] sm:inline">Esc</span>
        </label>
        <div className="max-h-[58vh] overflow-y-auto">
          {results.length === 0 && <p className="px-5 py-10 text-center italic text-ink-3">Nothing matches. Try another word.</p>}
          {results.map((r, i) => {
            const header = r.group !== results[i - 1]?.group ? r.group : null;
            const on = i === active;
            return (
              <div key={r.key}>
                {header && <div className="label px-5 pb-1 pt-4">{header}</div>}
                <button
                  type="button"
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(r)}
                  className={`flex w-full items-baseline gap-4 border-t border-rule px-5 py-3 text-left ${on ? "bg-wash" : ""}`}
                >
                  <span className="label w-16 shrink-0 text-[11px]">{r.mark}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[18px] ${on ? "text-accent" : ""}`}>{r.title}</span>
                    <span className="block truncate text-[14.5px] text-ink-3">{r.subtitle}</span>
                  </span>
                  {on && <span className="label hidden text-[11px] sm:inline">Enter ↵</span>}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
