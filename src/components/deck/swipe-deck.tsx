"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { keepIdea } from "@/app/actions";
import { catalogueNo } from "@/lib/format";

export type DeckCard = {
  slug: string;
  no: number;
  title: string;
  hook: string;
  short: string;
  kind: string;
  topic: string;
  glyph: string;
  conversationStarter?: string;
  image?: { src: string; alt: string };
};

const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 500;

/** The card flies off in the direction it was swiped (passed via AnimatePresence custom). */
const EXIT_VARIANTS = {
  exit: (direction: "left" | "right") => ({
    x: direction === "right" ? 420 : -420,
    rotate: direction === "right" ? 10 : -10,
    opacity: 0,
    transition: { duration: 0.28 },
  }),
};

const subscribeNoop = () => () => {};

/** Fisher–Yates shuffle: a fresh order on every visit. */
function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function SwipeDeck({ cards }: { cards: DeckCard[] }) {
  // Shuffle only in the browser, so server and client render the same first frame.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [order, setOrder] = useState<DeckCard[] | null>(null);
  if (mounted && order === null) setOrder(shuffled(cards));

  const [index, setIndex] = useState(0);
  const [exit, setExit] = useState<"left" | "right">("left");
  const [kept, setKept] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  const deck = order ?? cards;
  const card = deck[index];
  const done = index >= deck.length;

  const next = useCallback(
    (direction: "left" | "right") => {
      if (!card) return;
      setExit(direction);
      setIndex((i) => i + 1);
      if (direction === "right") {
        keepIdea(card.slug).then((result) => {
          if (result === "kept") {
            setKept((k) => k + 1);
            setNotice(`Kept “${card.title}”`);
          } else {
            setNotice("signed-out");
          }
        });
      }
    },
    [card],
  );

  const back = () => setIndex((i) => Math.max(0, i - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") next("left");
      else if (e.key === "ArrowRight") next("right");
      else if (e.key === "Enter" && card) router.push(`/idea/${card.slug}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, card, router]);

  useEffect(() => {
    if (!notice || notice === "signed-out") return;
    const t = setTimeout(() => setNotice(null), 1800);
    return () => clearTimeout(t);
  }, [notice]);

  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col">
      <div className="label flex items-center justify-between text-[11px]">
        <span>
          {Math.min(index + 1, deck.length)} / {deck.length}
        </span>
        {kept > 0 && <span>{kept} kept</span>}
      </div>

      <div className="relative mt-4 h-[min(560px,68dvh)]">
        {/* The next card peeks from underneath. */}
        {deck[index + 1] && !done && (
          <div className="absolute inset-0 translate-y-2 scale-[0.97] border border-rule bg-sheet" aria-hidden />
        )}
        <AnimatePresence custom={exit} initial={false}>
          {!done && card && <SwipeCard key={card.slug} card={card} onSwipe={next} />}
        </AnimatePresence>
        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center border border-ink bg-sheet p-8 text-center">
            <div className="label">End of the deck</div>
            <p className="mt-3 text-[24px] leading-snug">You’ve seen all {deck.length} ideas.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setOrder(shuffled(cards));
                  setIndex(0);
                }}
                className="label inline-flex min-h-11 items-center bg-accent px-5 text-accent-ink"
              >
                Shuffle again
              </button>
              <Link href="/library" className="label inline-flex min-h-11 items-center border border-rule-strong px-5 text-ink">
                Your library
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-[auto_1fr_1fr_1fr] gap-2">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          aria-label="Previous card"
          className="label min-h-12 border border-rule-strong px-3 text-ink disabled:opacity-40"
        >
          ↺
        </button>
        <button
          type="button"
          onClick={() => next("left")}
          disabled={done}
          className="label min-h-12 border border-rule-strong text-ink disabled:opacity-40"
        >
          ← Skip
        </button>
        <Link
          href={card && !done ? `/idea/${card.slug}` : "#"}
          aria-disabled={done}
          className="label flex min-h-12 items-center justify-center border border-ink text-ink"
        >
          Read
        </Link>
        <button
          type="button"
          onClick={() => next("right")}
          disabled={done}
          className="label min-h-12 bg-accent text-accent-ink disabled:opacity-40"
        >
          Keep →
        </button>
      </div>

      <div className="mt-3 min-h-6 text-center text-[14.5px] italic text-ink-3" role="status" aria-live="polite">
        {notice === "signed-out" ? (
          <>
            <Link href="/sign-in?next=/deck" className="text-accent underline">
              Sign in
            </Link>{" "}
            to keep ideas in your library.
          </>
        ) : (
          notice
        )}
      </div>
    </div>
  );
}

function SwipeCard({ card, onSwipe }: { card: DeckCard; onSwipe: (direction: "left" | "right") => void }) {
  const router = useRouter();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-8, 8]);
  const keepOpacity = useTransform(x, [30, SWIPE_DISTANCE], [0, 1]);
  const skipOpacity = useTransform(x, [-SWIPE_DISTANCE, -30], [1, 0]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) onSwipe("right");
    else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) onSwipe("left");
  };

  return (
    <motion.article
      className="absolute inset-0 flex cursor-grab touch-pan-y select-none flex-col overflow-hidden border border-ink bg-sheet active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      onTap={() => router.push(`/idea/${card.slug}`)}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      variants={EXIT_VARIANTS}
      exit="exit"
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      aria-label={`${card.title}. Swipe right to keep, left to skip, tap to read.`}
    >
      <motion.span
        className="label absolute right-4 top-4 z-10 border-2 border-[var(--st-established)] px-2 py-1 text-[12px] text-[var(--st-established)]"
        style={{ opacity: keepOpacity }}
        aria-hidden
      >
        Keep
      </motion.span>
      <motion.span
        className="label absolute left-4 top-4 z-10 border-2 border-ink-3 px-2 py-1 text-[12px] text-ink-3"
        style={{ opacity: skipOpacity }}
        aria-hidden
      >
        Skip
      </motion.span>

      <div className="relative flex h-[34%] min-h-[120px] shrink-0 items-center justify-center overflow-hidden border-b border-rule">
        {card.image ? (
          // Not draggable, so the browser’s own image drag doesn’t fight the swipe.
          <Image
            src={card.image.src}
            alt={card.image.alt}
            fill
            sizes="(max-width: 500px) 100vw, 460px"
            draggable={false}
            className="pointer-events-none object-cover saturate-[0.85] dark:brightness-[0.92]"
          />
        ) : (
          <span className="select-none text-[clamp(2.4rem,11vw,4.5rem)] font-medium leading-none">{card.glyph}</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5 sm:p-6">
        <div className="label flex flex-wrap gap-x-3 text-[11px]">
          <span>{catalogueNo(card.no)}</span>
          <span>{card.kind}</span>
          <span>{card.topic}</span>
        </div>
        <h2 className="mt-2 line-clamp-3 shrink-0 text-[22px] font-medium leading-[1.15] tracking-[-0.015em] sm:text-[26px]">{card.title}</h2>
        <p className="mt-2 line-clamp-3 shrink-0 text-[15.5px] leading-normal text-ink-2 sm:line-clamp-4 sm:text-[16.5px]">{card.short}</p>
        {card.conversationStarter && (
          <div className="mt-auto shrink-0 border-t border-rule pt-3">
            <div className="label text-[10.5px]">Bring it up</div>
            <p className="mt-1 line-clamp-2 text-[15px] italic leading-snug sm:line-clamp-3 sm:text-[15.5px]">“{card.conversationStarter}”</p>
          </div>
        )}
      </div>
    </motion.article>
  );
}
