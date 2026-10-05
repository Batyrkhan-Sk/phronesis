import { z } from "zod";
import { CLAIM_STATUS, CONNECTION_KINDS, MODE_SLUGS, TOPIC_SLUGS } from "./taxonomy";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slugs are kebab-case");

export const ideaFrontmatter = z.object({
  title: z.string().min(3),
  /** One-line teaser shown on cards. */
  hook: z.string().min(10),
  /** The 30-second version. */
  short: z.string().min(20),
  kind: z.enum(["fact", "story", "concept", "phenomenon", "person", "place", "word", "law", "dish", "object", "event"]),
  /** Optional date or era shown above the title, e.g. "1839" or "c. 79 AD". */
  era: z.string().optional(),
  /** A big typographic mark for the cover, e.g. "OK" or "φ". */
  glyph: z.string().max(6).optional(),
  topics: z.array(z.enum(TOPIC_SLUGS)).min(1),
  modes: z.array(z.enum(MODE_SLUGS)).default([]),
  conversationStarter: z.string().optional(),
  quote: z.object({ text: z.string(), by: z.string() }).optional(),
  connections: z
    .array(
      z.object({
        to: slug,
        kind: z.enum(Object.keys(CONNECTION_KINDS) as [keyof typeof CONNECTION_KINDS]),
        why: z.string().min(5),
      }),
    )
    .default([]),
  claims: z
    .array(
      z.object({
        text: z.string(),
        status: z.enum(Object.keys(CLAIM_STATUS) as [keyof typeof CLAIM_STATUS]),
      }),
    )
    .default([]),
  sources: z
    .array(
      z.object({
        title: z.string(),
        url: z.url().optional(),
        author: z.string().optional(),
        year: z.union([z.number(), z.string()]).optional(),
        type: z.enum(["book", "paper", "article", "archive", "reference", "video", "discussion"]).default("article"),
      }),
    )
    .min(1, "every idea needs at least one source"),
  published: z.coerce.date().optional(),
});

export const trailFrontmatter = z.object({
  title: z.string(),
  description: z.string(),
  glyph: z.string().max(6).optional(),
  steps: z.array(z.object({ idea: slug, bridge: z.string() })).min(2),
});

export type IdeaFrontmatter = z.infer<typeof ideaFrontmatter>;
export type TrailFrontmatter = z.infer<typeof trailFrontmatter>;
