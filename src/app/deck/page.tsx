import type { Metadata } from "next";
import { SwipeDeck, type DeckCard } from "@/components/deck/swipe-deck";
import { KIND_LABEL } from "@/components/idea/idea-card";
import { getAllIdeas } from "@/lib/content";
import { topicBySlug } from "@/lib/content/taxonomy";

export const metadata: Metadata = {
  title: "Deck",
  description: "Swipe through ideas: right to keep, left to skip, tap to read.",
};

export default function DeckPage() {
  const cards: DeckCard[] = getAllIdeas().map((i) => ({
    slug: i.slug,
    no: i.no,
    title: i.title,
    hook: i.hook,
    short: i.short,
    kind: KIND_LABEL[i.kind],
    topic: topicBySlug(i.topics[0])!.name,
    glyph: i.glyph ?? i.title.replace(/[^\p{L}]/gu, "").slice(0, 1),
    conversationStarter: i.conversationStarter,
    image: i.image ? { src: i.image.src, alt: i.image.alt || `Image illustrating “${i.title}”` } : undefined,
  }));

  return (
    <div className="pt-6 sm:pt-12">
      <header className="mx-auto mb-5 max-w-[460px]">
        <div className="label">The deck</div>
        <h1 className="mt-1 text-[32px] font-medium leading-tight tracking-[-0.02em]">One idea at a time</h1>
      </header>
      <SwipeDeck cards={cards} />
    </div>
  );
}
