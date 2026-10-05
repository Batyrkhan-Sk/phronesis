"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn, signUp } from "@/lib/auth/client";

const field = "w-full border-b border-ink bg-transparent py-2 text-[19px] outline-none placeholder:italic placeholder:text-ink-3 focus:border-accent focus-visible:outline-none";

function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function AuthForm({ mode, next, providers }: { mode: "sign-in" | "sign-up"; next?: string; providers: ("github" | "google")[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const target = safeNext(next);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res =
        mode === "sign-up"
          ? await signUp.email({ name: name.trim() || email.split("@")[0], email, password })
          : await signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(target);
      router.refresh();
    });
  };

  const other = mode === "sign-in" ? "/sign-up" : "/sign-in";

  return (
    <div className="w-full max-w-[440px]">
      <div className="label border-b border-ink pb-3">{mode === "sign-in" ? "Reader’s card" : "New reader"}</div>
      <h1 className="mt-6 text-[44px] font-medium leading-[1.05] tracking-[-0.02em]">
        {mode === "sign-in" ? "Welcome back" : "Join the archive"}
      </h1>
      <p className="mt-2 text-[18px] italic text-ink-2">
        {mode === "sign-in" ? "Sign in to see what you’ve kept and collected." : "Keep ideas, build collections, and see how much you’ve explored."}
      </p>

      {providers.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          {providers.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => signIn.social({ provider: p, callbackURL: target })}
              className="label min-h-11 border border-rule-strong text-ink hover:border-ink"
            >
              Continue with {p === "github" ? "GitHub" : "Google"}
            </button>
          ))}
          <div className="label mt-2 text-center text-[11px]">or with email</div>
        </div>
      )}

      <form onSubmit={submit} className="mt-8 flex flex-col gap-6">
        {mode === "sign-up" && (
          <label className="block">
            <span className="label text-[11px]">Name</span>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ada Lovelace" />
          </label>
        )}
        <label className="block">
          <span className="label text-[11px]">Email</span>
          <input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
        </label>
        <label className="block">
          <span className="label text-[11px]">Password</span>
          <input
            className={field}
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            placeholder={mode === "sign-up" ? "At least 8 characters" : ""}
          />
        </label>
        {error && (
          <p role="alert" className="border-l-2 border-[var(--st-myth)] pl-3 text-[16px] text-[var(--st-myth)]">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className="label min-h-12 bg-accent text-accent-ink hover:opacity-90 disabled:opacity-60">
          {pending ? "One moment…" : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-8 border-t border-rule pt-5 text-[17px] text-ink-2">
        {mode === "sign-in" ? "New here? " : "Already have an account? "}
        <Link href={next ? `${other}?next=${encodeURIComponent(next)}` : other} className="text-accent underline underline-offset-[3px]">
          {mode === "sign-in" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
