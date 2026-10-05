"use client";

import { useTransition } from "react";
import { clearHistory } from "@/app/actions";

export function ClearHistoryButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Clear your reading history? Kept ideas and collections stay.")) start(() => clearHistory());
      }}
      className="label inline-flex min-h-11 items-center border border-rule-strong px-5 text-ink hover:border-ink disabled:opacity-50"
    >
      Clear history
    </button>
  );
}
