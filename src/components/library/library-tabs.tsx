"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const TABS = [
  { href: "/library", label: "Kept" },
  { href: "/library/collections", label: "Collections" },
  { href: "/library/history", label: "History" },
];

export function LibraryTabs() {
  const pathname = usePathname();
  const active = TABS.slice()
    .reverse()
    .find((t) => pathname === t.href || pathname.startsWith(t.href + "/"))?.href;

  return (
    <nav aria-label="Library" className="flex gap-x-7 border-b border-rule">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={active === t.href ? "page" : undefined}
          className={`label relative flex min-h-11 items-center ${active === t.href ? "text-ink" : "hover:text-ink"}`}
        >
          {t.label}
          {active === t.href && (
            <motion.span
              layoutId="library-tab"
              className="absolute inset-x-0 -bottom-px h-[2px] bg-ink"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
        </Link>
      ))}
    </nav>
  );
}
