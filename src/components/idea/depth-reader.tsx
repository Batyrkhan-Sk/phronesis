"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { roman } from "@/lib/format";

type Depth = "short" | "full" | "deep";

/** Underlined text tabs. Used for depth and for sort controls. */
export function TabRow<T extends string>({
  value,
  onChange,
  options,
  label,
  numbered = false,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  numbered?: boolean;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-x-7 border-b border-rule">
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`label relative min-h-11 ${active ? "text-ink" : "hover:text-ink"}`}
          >
            {numbered ? `${roman(i + 1)}. ${o.label}` : o.label}
            {active && (
              <motion.span
                layoutId={`tab-${label}`}
                className="absolute inset-x-0 -bottom-px h-[2px] bg-ink"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function DepthReader({
  short,
  bodyHtml,
  deepDiveHtml,
}: {
  short: string;
  bodyHtml: string;
  deepDiveHtml: string | null;
}) {
  const [depth, setDepth] = useState<Depth>("full");
  const options: { value: Depth; label: string }[] = [
    { value: "short", label: "In brief" },
    { value: "full", label: "The story" },
  ];
  if (deepDiveHtml) options.push({ value: "deep", label: "Deep dive" });

  return (
    <div>
      <TabRow label="Depth" value={depth} onChange={setDepth} options={options} numbered />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={depth}
          className="mt-9"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {depth === "short" ? (
            <p className="text-[24px] italic leading-[1.5] text-ink">{short}</p>
          ) : (
            <>
              <div className="prose-idea" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              {depth === "deep" && deepDiveHtml && (
                <div className="mt-12 border-t border-ink pt-8">
                  <div className="label mb-3">III. Deep dive</div>
                  <div className="prose-idea" dangerouslySetInnerHTML={{ __html: deepDiveHtml }} />
                </div>
              )}
              {depth === "full" && deepDiveHtml && (
                <button
                  type="button"
                  onClick={() => setDepth("deep")}
                  className="label mt-10 inline-flex min-h-11 items-center border border-ink px-5 text-ink hover:bg-ink hover:text-paper"
                >
                  Continue to the deep dive →
                </button>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
