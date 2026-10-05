"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  createCollection,
  getIdeaUserState,
  recordView,
  toggleInCollection,
  toggleSave,
  type IdeaUserState,
} from "@/app/actions";

const primary =
  "label inline-flex min-h-11 items-center px-5 transition-colors disabled:opacity-60 bg-accent text-accent-ink hover:opacity-90";
const secondary =
  "label inline-flex min-h-11 items-center px-5 border border-rule-strong text-ink transition-colors hover:border-ink disabled:opacity-60";

export function SaveControls({ slug, title }: { slug: string; title: string }) {
  const [state, setState] = useState<IdeaUserState | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    getIdeaUserState(slug).then((s) => alive && setState(s));
    recordView(slug);
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenuOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const shareButton = (
    <button type="button" onClick={share} className={secondary}>
      {copied ? "Link copied" : "Share"}
    </button>
  );

  if (!state) return <div className="flex min-h-11 flex-wrap gap-3">{shareButton}</div>;

  if (!state.signedIn) {
    return (
      <div className="flex flex-wrap gap-3">
        <Link href={`/sign-in?next=/idea/${slug}`} className={primary}>
          Sign in to keep this
        </Link>
        {shareButton}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        disabled={pending}
        aria-pressed={state.saved}
        onClick={() =>
          startTransition(async () => {
            const saved = await toggleSave(slug);
            setState((s) => s && { ...s, saved });
          })
        }
        className={state.saved ? secondary : primary}
      >
        {state.saved ? "✓ Kept in your library" : "Keep this"}
      </button>

      <div ref={menuRef} className="relative">
        <button type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} className={secondary}>
          Add to a collection
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14 }}
              className="absolute left-0 top-full z-30 mt-2 w-72 border border-ink bg-sheet"
            >
              {state.collections.length === 0 && (
                <p className="px-4 py-3 text-[15px] italic text-ink-3">No collections yet. Start one below.</p>
              )}
              {state.collections.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={pending}
                  aria-pressed={c.has}
                  onClick={() =>
                    startTransition(async () => {
                      const has = await toggleInCollection(c.id, slug);
                      setState((s) => s && { ...s, collections: s.collections.map((x) => (x.id === c.id ? { ...x, has } : x)) });
                    })
                  }
                  className="flex min-h-11 w-full items-center gap-3 border-b border-rule px-4 text-left text-[16px] hover:bg-wash"
                >
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="label text-[11px]">{c.has ? "✓ In" : "Add"}</span>
                </button>
              ))}
              <form
                className="flex items-center gap-2 p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = newName.trim();
                  if (!name) return;
                  startTransition(async () => {
                    const id = await createCollection({ name, withIdea: slug });
                    setNewName("");
                    setState((s) => s && { ...s, collections: [{ id, name, emoji: null, has: true }, ...s.collections] });
                  });
                }}
              >
                <label className="sr-only" htmlFor="new-collection">
                  New collection name
                </label>
                <input
                  id="new-collection"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New collection…"
                  className="h-10 min-w-0 flex-1 border-b border-ink bg-transparent text-[16px] italic outline-none focus:border-accent focus-visible:outline-none"
                />
                <button type="submit" disabled={pending} className="label min-h-10 bg-ink px-3 text-paper">
                  Create
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {shareButton}
    </div>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="label min-h-11 hover:text-ink"
    >
      {done ? "Copied ✓" : label}
    </button>
  );
}
