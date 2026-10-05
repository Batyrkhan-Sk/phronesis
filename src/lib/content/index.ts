import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";
import { ideaFrontmatter, trailFrontmatter, type IdeaFrontmatter, type TrailFrontmatter } from "./schema";
import { type ConnectionKind, type ModeSlug, type TopicSlug } from "./taxonomy";

const CONTENT_DIR = path.join(process.cwd(), "content");
const DEEP_DIVE_MARKER = /^<!--\s*deep-dive\s*-->\s*$/m;

export type Connection = { slug: string; kind: ConnectionKind; why: string; direction: "out" | "in" };

export type Idea = Omit<IdeaFrontmatter, "connections"> & {
  slug: string;
  /** Catalogue number, stable for a given set of ideas (alphabetical by slug). */
  no: number;
  bodyHtml: string;
  deepDiveHtml: string | null;
  readingMinutes: number;
  connections: Connection[];
};

export type IdeaSummary = Pick<Idea, "slug" | "no" | "title" | "hook" | "kind" | "era" | "glyph" | "topics" | "modes" | "readingMinutes">;

export type Trail = TrailFrontmatter & { slug: string; introHtml: string };

/* ── Markdown ───────────────────────────────────────────────────── */

// `[text](idea:some-slug)` links to another idea.
const markdown = new Marked({ gfm: true });
markdown.use({
  walkTokens(token) {
    if (token.type === "link" && token.href.startsWith("idea:")) {
      token.href = `/idea/${token.href.slice(5)}`;
    }
  },
});
const render = (md: string) => markdown.parse(md.trim(), { async: false });

const countWords = (s: string) => s.split(/\s+/).filter(Boolean).length;

/* ── Loading ────────────────────────────────────────────────────── */

function readDir(dir: string) {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, ""), file: path.join(full, f), raw: fs.readFileSync(path.join(full, f), "utf8") }));
}

function fail(file: string, message: string): never {
  throw new Error(`[content] ${path.relative(process.cwd(), file)}: ${message}`);
}

type Store = { ideas: Map<string, Idea>; trails: Map<string, Trail> };
let store: Store | null = null;

function load(): Store {
  if (store && process.env.NODE_ENV === "production") return store;

  const ideas = new Map<string, Idea>();
  const outgoing = new Map<string, IdeaFrontmatter["connections"]>();

  for (const { slug, file, raw } of readDir("ideas")) {
    const { data, content } = matter(raw);
    const parsed = ideaFrontmatter.safeParse(data);
    if (!parsed.success) fail(file, parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    const fm = parsed.data;

    const [body, deep] = content.split(DEEP_DIVE_MARKER);
    const modes = new Set<ModeSlug>(fm.modes);
    if (deep?.trim()) modes.add("deep-dive");
    if (fm.conversationStarter) modes.add("conversation");
    if (fm.connections.length >= 3) modes.add("connections");

    ideas.set(slug, {
      ...fm,
      slug,
      no: 0,
      modes: [...modes],
      bodyHtml: render(body),
      deepDiveHtml: deep?.trim() ? render(deep) : null,
      readingMinutes: Math.max(1, Math.ceil(countWords(fm.short + body + (deep ?? "")) / 220)),
      connections: [],
    });
    outgoing.set(slug, fm.connections);
  }

  [...ideas.keys()].sort().forEach((slug, i) => (ideas.get(slug)!.no = i + 1));

  // Connections are written once and shown from both ends.
  for (const [from, conns] of outgoing) {
    for (const c of conns) {
      if (!ideas.has(c.to)) fail(path.join(CONTENT_DIR, "ideas", `${from}.md`), `connection to unknown idea "${c.to}"`);
      if (c.to === from) fail(path.join(CONTENT_DIR, "ideas", `${from}.md`), "an idea cannot connect to itself");
      // When both ideas link to each other, the idea's own wording wins over the mirrored one.
      const source = ideas.get(from)!;
      source.connections = source.connections.filter((x) => x.slug !== c.to);
      source.connections.push({ slug: c.to, kind: c.kind, why: c.why, direction: "out" });
      const target = ideas.get(c.to)!;
      if (!target.connections.some((x) => x.slug === from)) {
        target.connections.push({ slug: from, kind: c.kind, why: c.why, direction: "in" });
      }
    }
  }

  const trails = new Map<string, Trail>();
  for (const { slug, file, raw } of readDir("trails")) {
    const { data, content } = matter(raw);
    const parsed = trailFrontmatter.safeParse(data);
    if (!parsed.success) fail(file, parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    for (const step of parsed.data.steps) {
      if (!ideas.has(step.idea)) fail(file, `trail step references unknown idea "${step.idea}"`);
    }
    trails.set(slug, { ...parsed.data, slug, introHtml: render(content) });
  }

  store = { ideas, trails };
  return store;
}

/* ── Queries ────────────────────────────────────────────────────── */

export const summarize = (i: Idea): IdeaSummary => ({
  slug: i.slug,
  no: i.no,
  title: i.title,
  hook: i.hook,
  kind: i.kind,
  era: i.era,
  glyph: i.glyph,
  topics: i.topics,
  modes: i.modes,
  readingMinutes: i.readingMinutes,
});

export function getAllIdeas(): Idea[] {
  return [...load().ideas.values()].sort((a, b) => a.title.localeCompare(b.title));
}

export function getIdea(slug: string): Idea | undefined {
  return load().ideas.get(slug);
}

export function getIdeasBySlugs(slugs: string[]): Idea[] {
  const { ideas } = load();
  return slugs.map((s) => ideas.get(s)).filter((i): i is Idea => Boolean(i));
}

export const getIdeasByTopic = (topic: TopicSlug) => getAllIdeas().filter((i) => i.topics.includes(topic));
export const getIdeasByMode = (mode: ModeSlug) => getAllIdeas().filter((i) => i.modes.includes(mode));

export function getAllTrails(): Trail[] {
  return [...load().trails.values()];
}
export const getTrail = (slug: string) => load().trails.get(slug);
export const getTrailsForIdea = (slug: string) => getAllTrails().filter((t) => t.steps.some((s) => s.idea === slug));

/**
 * "You might also find interesting": ideas two steps away in the graph, or
 * sharing topics, excluding direct connections (those are shown separately).
 */
export function getRecommendations(slug: string, limit = 4): Idea[] {
  const idea = getIdea(slug);
  if (!idea) return [];
  const direct = new Set([slug, ...idea.connections.map((c) => c.slug)]);
  const scores = new Map<string, number>();
  const bump = (s: string, n: number) => !direct.has(s) && scores.set(s, (scores.get(s) ?? 0) + n);

  for (const c of idea.connections) {
    for (const cc of getIdea(c.slug)?.connections ?? []) bump(cc.slug, 3);
  }
  for (const other of getAllIdeas()) {
    const shared = other.topics.filter((t) => idea.topics.includes(t)).length;
    if (shared) bump(other.slug, shared * 2);
    if (other.modes.some((m) => idea.modes.includes(m))) bump(other.slug, 0.5);
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([s]) => getIdea(s)!);
}

/** A stable pick per calendar day (UTC), so everyone sees the same idea of the day. */
export function getIdeaOfTheDay(date = new Date()): Idea {
  const ideas = getAllIdeas();
  const key = date.toISOString().slice(0, 10);
  let h = 2166136261;
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ideas[Math.abs(h) % ideas.length];
}

export function getRandomIdea(exclude?: string): Idea {
  const pool = getAllIdeas().filter((i) => i.slug !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}
