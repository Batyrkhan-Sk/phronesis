#!/usr/bin/env node
/**
 * Discussion leads from Mastodon.
 *
 * Finds the least-covered topics in content/ideas, maps them to hashtags, reads
 * recent public posts for those hashtags from Mastodon's public API, ranks them
 * by engagement and writes a Markdown digest (default: leads/leads.md).
 *
 * Leads are for discovering what people find interesting. They are never evidence:
 * every fact must still be verified against reliable sources before it is written up.
 *
 * Usage:
 *   pnpm leads
 *   pnpm leads --topics law,music --per-tag 5
 *   pnpm leads --tags etymology,foodhistory --instance mastodon.social --out leads/leads.md
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const IDEAS_DIR = path.join(ROOT, "content", "ideas");
const USER_AGENT = "PhronesisLeads/1.0 (+https://github.com/Batyrkhan-Sk/phronesis)";

/** Hashtags worth following for each topic slug in src/lib/content/taxonomy.ts. */
const TOPIC_TAGS = {
  science: ["science", "scicomm"],
  technology: ["technology", "computerhistory"],
  ai: ["ai", "machinelearning"],
  history: ["history", "histodons"],
  geography: ["geography", "maps"],
  psychology: ["psychology", "cognitivescience"],
  philosophy: ["philosophy"],
  economics: ["economics", "econtwitter"],
  business: ["business", "economichistory"],
  art: ["art", "arthistory"],
  literature: ["literature", "books"],
  cinema: ["film", "filmhistory"],
  music: ["music", "musichistory"],
  language: ["linguistics", "etymology"],
  mathematics: ["math", "mathematics"],
  food: ["food", "foodhistory"],
  people: ["biography", "womeninhistory"],
  countries: ["travel", "geopolitics"],
  cities: ["cities", "urbanism"],
  law: ["law", "legalhistory"],
  society: ["sociology", "anthropology"],
  religion: ["religion", "religiousstudies"],
  fashion: ["fashion", "fashionhistory"],
  nature: ["nature", "biology"],
  space: ["space", "astronomy"],
  inventions: ["inventions", "engineering"],
  "internet-culture": ["internetculture", "memes"],
  architecture: ["architecture"],
  design: ["design", "typography"],
  "everyday-life": ["everydayhistory", "funfacts"],
};

const list = (v) => v.split(",");
const OPTIONS = {
  "--topics": ["topics", list],
  "--tags": ["tags", list],
  "--instance": ["instance", String],
  "--per-tag": ["perTag", Number],
  "--pages": ["pages", Number],
  "--thinnest": ["thinnest", Number],
  "--out": ["out", String],
};

function parseArgs(argv) {
  const args = { instance: "mastodon.social", perTag: 6, pages: 3, out: "leads/leads.md", thinnest: 3 };
  for (let i = 0; i < argv.length; i += 2) {
    const option = OPTIONS[argv[i]];
    if (!option) throw new Error(`Unknown option: ${argv[i]}`);
    const [key, parse] = option;
    args[key] = parse(argv[i + 1]);
  }
  return args;
}

/** Topics ordered from fewest to most ideas (topics with zero ideas come first). */
function topicCoverage() {
  const counts = Object.fromEntries(Object.keys(TOPIC_TAGS).map((t) => [t, 0]));
  for (const file of fs.readdirSync(IDEAS_DIR).filter((f) => f.endsWith(".md"))) {
    const { data } = matter(fs.readFileSync(path.join(IDEAS_DIR, file), "utf8"));
    for (const t of data.topics ?? []) if (t in counts) counts[t]++;
  }
  return Object.entries(counts).sort((a, b) => a[1] - b[1]);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const toText = (html) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "’")
    .trim();

async function fetchTag(instance, tag, pages) {
  const posts = [];
  let url = `https://${instance}/api/v1/timelines/tag/${encodeURIComponent(tag)}?limit=40`;
  for (let page = 0; page < pages && url; page++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
    if (res.status === 429) {
      console.warn(`  rate limited on #${tag}; stopping this tag`);
      break;
    }
    if (!res.ok) {
      console.warn(`  #${tag}: HTTP ${res.status}`);
      break;
    }
    posts.push(...(await res.json()));
    // Follow the Link header to older posts.
    url = /<([^>]+)>;\s*rel="next"/.exec(res.headers.get("link") ?? "")?.[1] ?? null;
    await sleep(400);
  }
  return posts;
}

const PROMO = /\b(check out|discount|on sale|sale\b|giveaway|subscribe|buy now|pre-?order|kickstarter|bookfunnel|link in bio|use code|% off|free shipping|follow me|like,? follow)/i;

/** Drops reposts, bots, sensitive and non-English posts, promotions and hashtag soup. */
function clean(posts) {
  return posts
    .filter((p) => !p.reblog && !p.sensitive && !p.account?.bot)
    .filter((p) => !p.language || p.language === "en")
    .map((p) => {
      const text = toText(p.content ?? "");
      const words = text.split(/\s+/).filter(Boolean);
      const hashtags = words.filter((w) => w.startsWith("#"));
      return {
        url: p.url ?? p.uri,
        author: p.account?.acct,
        date: p.created_at?.slice(0, 10),
        text,
        tags: (p.tags ?? []).map((t) => t.name.toLowerCase()),
        hashtagShare: words.length ? hashtags.length / words.length : 1,
        score: (p.favourites_count ?? 0) + 2 * (p.reblogs_count ?? 0) + (p.replies_count ?? 0),
        engagement: `${p.favourites_count ?? 0}♥ ${p.reblogs_count ?? 0}↻ ${p.replies_count ?? 0}↩`,
      };
    })
    .filter((p) => p.text.length >= 80 && p.hashtagShare <= 0.3 && p.tags.length <= 8 && !PROMO.test(p.text));
}

const rank = (posts) => [...posts].sort((a, b) => b.score - a.score);

const CONCEPT =
  /\b((?:[A-Za-z][A-Za-z’'-]+ ){0,2}[A-Za-z][A-Za-z’'-]+) (effect|paradox|law|principle|syndrome|fallacy|bias|theory|hypothesis|problem|dilemma|illusion|phenomenon|rule|index|test)\b/g;
const QUOTED = /[“"]([^”"\n]{3,40})[”"]/g;
const STOP = new Set(["the", "this", "that", "a", "an", "of", "my", "your", "our", "their", "his", "her", "its", "same", "new", "big", "real", "whole"]);

/**
 * Candidate terms for ideas: named concepts (“Streisand effect”, “Goodhart’s law”),
 * short quoted words or phrases, and hashtags that co-occur with the ones we searched.
 */
function spotTerms(posts, searchedTags) {
  const concepts = new Map();
  const quoted = new Map();
  const cotags = new Map();
  // Count distinct authors, so one prolific account can’t dominate.
  const bump = (map, key, post) => {
    const entry = map.get(key) ?? { authors: new Set(), url: post.url };
    entry.authors.add(post.author);
    map.set(key, entry);
  };

  for (const p of posts) {
    for (const m of p.text.matchAll(CONCEPT)) {
      const words = m[1].split(/\s+/).filter((w) => !STOP.has(w.toLowerCase()));
      if (!words.length) continue;
      bump(concepts, `${words.join(" ")} ${m[2]}`.toLowerCase(), p);
    }
    for (const m of p.text.matchAll(QUOTED)) {
      const phrase = m[1].trim();
      if (phrase.split(/\s+/).length <= 4 && !/https?:/.test(phrase)) bump(quoted, phrase.toLowerCase(), p);
    }
    for (const t of p.tags) if (!searchedTags.includes(t)) bump(cotags, t, p);
  }

  const top = (map, n) =>
    [...map.entries()]
      .map(([term, { authors, url }]) => [term, { count: authors.size, url }])
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, n);
  return { concepts: top(concepts, 15), quoted: top(quoted, 15), cotags: top(cotags, 20) };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const coverage = topicCoverage();

  const topics = args.tags ? [] : (args.topics ?? coverage.slice(0, args.thinnest).map(([t]) => t));
  const unknown = topics.filter((t) => !TOPIC_TAGS[t]);
  if (unknown.length) throw new Error(`Unknown topic(s): ${unknown.join(", ")}`);
  const groups = args.tags ? [["custom", args.tags]] : topics.map((t) => [t, TOPIC_TAGS[t]]);

  const lines = [
    "# Discussion leads",
    "",
    `Generated ${new Date().toISOString()} from public posts on ${args.instance}.`,
    "",
    "> Leads only. These posts show what people find interesting; they are NOT evidence.",
    "> Verify every fact against reliable sources before writing an idea. Cite a post",
    "> (type: discussion) only if it genuinely shaped the idea.",
    "",
    "## Topic coverage (fewest ideas first)",
    "",
    coverage.map(([t, n]) => `${t} ${n}`).join(" · "),
    "",
  ];

  const seen = new Set();
  const allPosts = [];
  const postLines = [];
  for (const [topic, tags] of groups) {
    postLines.push(`## ${topic}`, "");
    for (const tag of tags) {
      console.log(`#${tag}…`);
      const posts = clean(await fetchTag(args.instance, tag, args.pages)).filter((p) => !seen.has(p.url));
      posts.forEach((p) => seen.add(p.url));
      allPosts.push(...posts);
      const top = rank(posts).slice(0, args.perTag);
      postLines.push(`### #${tag}`, "");
      if (!top.length) postLines.push("_No suitable posts found._", "");
      for (const p of top) {
        const excerpt = p.text.length > 400 ? `${p.text.slice(0, 400).trimEnd()}…` : p.text;
        postLines.push(`- **${p.engagement}** · ${p.date} · ${p.author} · ${p.url}`, `  > ${excerpt.replace(/\n+/g, " ")}`, "");
      }
    }
  }

  const searched = groups.flatMap(([, tags]) => tags);
  const terms = spotTerms(allPosts, searched);
  const termList = (entries) =>
    entries.length ? entries.map(([term, { count, url }]) => `- **${term}** (${count} ${count === 1 ? "author" : "authors"}) · e.g. ${url}`) : ["_None spotted._"];
  lines.push(
    "## Terms spotted",
    "",
    "Candidate concepts, words and related subjects that came up in these posts. Promising ones may make good ideas, but research them from scratch.",
    "",
    "### Named concepts (effects, laws, paradoxes…)",
    "",
    ...termList(terms.concepts),
    "",
    "### Quoted words and phrases",
    "",
    ...termList(terms.quoted),
    "",
    "### Related hashtags",
    "",
    ...termList(terms.cotags),
    "",
    `Scanned ${allPosts.length} posts after filtering.`,
    "",
    ...postLines,
  );

  const out = path.join(ROOT, args.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, lines.join("\n"));
  console.log(`Wrote ${path.relative(ROOT, out)}`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
