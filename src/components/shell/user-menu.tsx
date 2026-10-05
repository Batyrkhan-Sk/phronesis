"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { signOut } from "@/lib/auth/client";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Account: ${name}`}
        className="flex size-11 items-center justify-center rounded-full border border-ink font-mono text-[13px] font-medium text-ink hover:bg-ink hover:text-paper"
      >
        {initials(name)}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full z-40 mt-2 w-64 border border-ink bg-sheet"
          >
            <div className="border-b border-rule px-4 py-3">
              <div className="truncate text-[16px]">{name}</div>
              <div className="truncate font-mono text-[12px] text-ink-3">{email}</div>
            </div>
            <Link href="/library" onClick={() => setOpen(false)} className="label flex min-h-11 items-center px-4 hover:bg-wash hover:text-ink">
              Your library
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                setOpen(false);
                router.push("/");
                router.refresh();
              }}
              className="label flex min-h-11 w-full items-center border-t border-rule px-4 text-left hover:bg-wash hover:text-ink"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
