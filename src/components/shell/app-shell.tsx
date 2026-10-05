"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { IdeaSummary } from "@/lib/content";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Spotlight } from "./spotlight";

export type SearchEntry = IdeaSummary;
export type TrailEntry = { slug: string; title: string; description: string };

type ShellState = {
  index: SearchEntry[];
  trails: TrailEntry[];
  openSearch: () => void;
};
const ShellContext = createContext<ShellState | null>(null);
export const useShell = () => {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <AppShell>");
  return ctx;
};

export function AppShell({
  index,
  trails,
  children,
}: {
  index: SearchEntry[];
  trails: TrailEntry[];
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ShellContext.Provider value={{ index, trails, openSearch }}>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 pb-24 sm:px-10">{children}</main>
        <SiteFooter />
      </div>
      <Spotlight open={searchOpen} onClose={() => setSearchOpen(false)} />
    </ShellContext.Provider>
  );
}
