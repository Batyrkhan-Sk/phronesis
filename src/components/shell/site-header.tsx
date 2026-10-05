"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useSession } from "@/lib/auth/client";
import { useShell } from "./app-shell";
import { UserMenu } from "./user-menu";

const NAV = [
  { href: "/", label: "Today" },
  { href: "/explore", label: "Explore" },
  { href: "/trails", label: "Trails" },
  { href: "/topics", label: "Topics" },
  { href: "/library", label: "Library" },
];

const subscribeNoop = () => () => {};
const useMounted = () => useSyncExternalStore(subscribeNoop, () => true, () => false);

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/topics") return pathname.startsWith("/topic") || pathname.startsWith("/mode");
  if (href === "/trails") return pathname.startsWith("/trail");
  return pathname === href || pathname.startsWith(href + "/");
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const current = mounted ? (theme ?? "system") : "system";
  const next = current === "light" ? "dark" : current === "dark" ? "system" : "light";
  const label = { light: "Light", dark: "Dark", system: "Auto" }[current] ?? "Auto";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${label}. Switch to ${next}.`}
      className="label min-h-11 px-1 hover:text-ink"
    >
      {label}
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { openSearch, index } = useShell();
  const { data: session, isPending } = useSession();
  const mounted = useMounted();
  const isMac = mounted && /Mac|iPhone|iPad/.test(navigator.platform);

  const surprise = () => {
    const pick = index[Math.floor(Math.random() * index.length)];
    if (pick) router.push(`/idea/${pick.slug}`);
  };

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-8 gap-y-1 px-5 pt-3 sm:px-10 lg:py-3">
        <Link href="/" className="text-[26px] font-semibold tracking-[-0.01em] text-ink">
          Phronesis
        </Link>

        <nav aria-label="Main" className="order-last -mx-1 flex w-full gap-6 overflow-x-auto px-1 lg:order-none lg:w-auto">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`label flex min-h-11 shrink-0 items-center border-b-2 ${
                  active ? "border-ink text-ink" : "border-transparent hover:text-ink"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <button
            type="button"
            onClick={openSearch}
            className="hidden min-h-11 min-w-[240px] items-center gap-3 border-b border-ink text-left md:flex"
          >
            <span className="label">Search</span>
            <span className="flex-1 truncate text-[15px] italic text-ink-3">an idea, a word, a century</span>
            <span className="label text-[11px]">{isMac ? "⌘K" : "Ctrl K"}</span>
          </button>
          <button type="button" onClick={openSearch} className="label min-h-11 hover:text-ink md:hidden">
            Search
          </button>
          <button type="button" onClick={surprise} className="label hidden min-h-11 hover:text-ink sm:inline" title="Open a random idea">
            Surprise me
          </button>
          <ThemeSwitch />
          {isPending ? (
            <span className="size-11" aria-hidden />
          ) : session ? (
            <UserMenu name={session.user.name} email={session.user.email} />
          ) : (
            <Link
              href={`/sign-in?next=${encodeURIComponent(pathname)}`}
              className="label inline-flex min-h-11 items-center border border-ink px-4 text-ink hover:bg-ink hover:text-paper"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
