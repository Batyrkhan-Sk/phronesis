"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createCollection, deleteCollection, toggleInCollection, updateCollection } from "@/app/actions";

type Values = { name: string; description: string };

const primary = "label inline-flex min-h-11 items-center bg-accent px-5 text-accent-ink hover:opacity-90 disabled:opacity-60";
const secondary = "label inline-flex min-h-11 items-center border border-rule-strong px-5 text-ink hover:border-ink disabled:opacity-60";
const field = "w-full border-b border-ink bg-transparent py-2 text-[18px] outline-none placeholder:italic placeholder:text-ink-3 focus:border-accent focus-visible:outline-none";

function CollectionDialog({
  title,
  initial,
  submitLabel,
  onSubmit,
  onClose,
}: {
  title: string;
  initial: Values;
  submitLabel: string;
  onSubmit: (v: Values) => Promise<void>;
  onClose: () => void;
}) {
  const [v, setV] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <motion.div className="absolute inset-0 bg-[#1e1c19]/30 dark:bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-md border border-ink bg-sheet p-7"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!v.name.trim()) return setError("Give it a name.");
          start(async () => {
            try {
              await onSubmit(v);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Something went wrong.");
            }
          });
        }}
      >
        <h2 className="label">{title}</h2>
        <label className="mt-6 block">
          <span className="label text-[11px]">Name</span>
          <input autoFocus value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="Dinner-party stories" maxLength={80} className={field} />
        </label>
        <label className="mt-5 block">
          <span className="label text-[11px]">Description (optional)</span>
          <textarea
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
            placeholder="What ties these together?"
            maxLength={280}
            rows={2}
            className={`${field} resize-none`}
          />
        </label>
        {error && <p className="mt-3 text-[15px] text-[var(--st-myth)]">{error}</p>}
        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={secondary}>
            Cancel
          </button>
          <button type="submit" disabled={pending} className={primary}>
            {submitLabel}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

export function NewCollectionButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={primary}>
        New collection
      </button>
      <AnimatePresence>
        {open && (
          <CollectionDialog
            title="New collection"
            submitLabel="Create"
            initial={{ name: "", description: "" }}
            onClose={() => setOpen(false)}
            onSubmit={async (v) => {
              const id = await createCollection(v);
              setOpen(false);
              router.push(`/library/collections/${id}`);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export function CollectionActions({ collection }: { collection: { id: string; name: string; description: string | null } }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex gap-3">
      <button type="button" onClick={() => setOpen(true)} className={secondary}>
        Edit
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete “${collection.name}”? The ideas themselves stay kept.`)) return;
          start(async () => {
            await deleteCollection(collection.id);
            router.push("/library/collections");
          });
        }}
        className={`${secondary} text-[var(--st-myth)]`}
      >
        Delete
      </button>
      <AnimatePresence>
        {open && (
          <CollectionDialog
            title="Edit collection"
            submitLabel="Save"
            initial={{ name: collection.name, description: collection.description ?? "" }}
            onClose={() => setOpen(false)}
            onSubmit={async (v) => {
              await updateCollection(collection.id, v);
              setOpen(false);
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function RemoveFromCollectionButton({ collectionId, slug }: { collectionId: string; slug: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Remove from collection"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await toggleInCollection(collectionId, slug);
          router.refresh();
        })
      }
      className="label min-h-11 px-2 hover:text-[var(--st-myth)] disabled:opacity-40"
    >
      Remove
    </button>
  );
}
