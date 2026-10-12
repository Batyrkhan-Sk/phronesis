#!/usr/bin/env node
/**
 * Finds a freely licensed image for each idea and records it in content/images.json.
 *
 * For every idea that cites a Wikipedia article, it takes that article's lead image,
 * looks the file up on Wikimedia Commons and keeps it only if the licence is free
 * (public domain, CC0, CC BY or CC BY-SA). Non-free “fair use” files are skipped.
 * Each entry stores the author, licence and file page so the site can credit it.
 *
 * The image is then downloaded once, resized to at most 1200px wide as WebP and saved
 * in public/images/ideas/, so the site serves it itself instead of hotlinking Wikimedia
 * on every visit. Downloads are slow on purpose and back off when rate-limited.
 *
 * Usage:
 *   pnpm images              # fill in ideas that have no image yet, download missing files
 *   pnpm images --refresh    # re-check every idea
 *   pnpm images sator-square # only these slugs
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = process.cwd();
const IDEAS_DIR = path.join(ROOT, "content", "ideas");
const OUT = path.join(ROOT, "content", "images.json");
const PUBLIC_DIR = path.join(ROOT, "public", "images", "ideas");
const localPath = (slug) => `/images/ideas/${slug}.webp`;
const USER_AGENT = "PhronesisImages/1.0 (+https://github.com/Batyrkhan-Sk/phronesis)";
const WIDTH = 1200;

const FREE = /^(public domain|pd\b|cc0|cc[ -]by(-sa)?([ -]\d(\.\d)?)?)/i;
const NOT_FREE = /non-free|fair use|copyrighted|all rights reserved/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripHtml = (html = "") =>
  html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "’").replace(/\s+/g, " ").trim();

/** Removes tracking parameters (?utm_source=…) from image URLs. */
const withoutQuery = (url) => url.split("?")[0];

/** Commons sometimes repeats the author ("Unknown authorUnknown author"); keep one copy. */
function cleanCredit(text) {
  const t = text.replace(/^(.+?)\1$/, "$1").trim();
  return t || "Unknown author";
}

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/** The first English Wikipedia article an idea cites, if any. */
function wikipediaTitle(sources) {
  for (const s of sources ?? []) {
    const m = /^https?:\/\/en\.wikipedia\.org\/wiki\/([^#?]+)/.exec(s.url ?? "");
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}

async function findImage(title) {
  const summary = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
  const original = summary.originalimage?.source;
  if (!original) return { skip: "article has no lead image" };
  // Files hosted on Commons live under /commons/; files under /en/ are local and usually non-free.
  if (!new URL(original).pathname.includes("/wikipedia/commons/")) return { skip: "lead image is not on Commons (likely non-free)" };

  // Drop query strings such as ?utm_source=… that the API now appends.
  const fileName = decodeURIComponent(new URL(original).pathname.split("/").pop());
  const params = new URLSearchParams({
    action: "query",
    titles: `File:${fileName}`,
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: String(WIDTH),
    format: "json",
    origin: "*",
  });
  const data = await getJson(`https://commons.wikimedia.org/w/api.php?${params}`);
  const page = Object.values(data.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) return { skip: "file not found on Commons" };

  const meta = info.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value);
  const usage = stripHtml(meta.UsageTerms?.value);
  if (!license || NOT_FREE.test(`${license} ${usage}`) || !FREE.test(license)) return { skip: `licence not free: ${license || "unknown"}` };
  if (/\.(svg|tif|tiff|pdf|djvu)$/i.test(fileName) && !info.thumburl) return { skip: "unsupported format" };

  const description = stripHtml(meta.ImageDescription?.value);
  return {
    image: {
      remoteSrc: withoutQuery(info.thumburl ?? info.url),
      width: info.thumbwidth ?? info.width,
      height: info.thumbheight ?? info.height,
      alt: description ? description.slice(0, 160) : "",
      credit: cleanCredit(stripHtml(meta.Artist?.value)),
      license,
      licenseUrl: meta.LicenseUrl?.value || undefined,
      sourceUrl: info.descriptionurl,
      article: title,
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const refresh = args.includes("--refresh");
  const only = args.filter((a) => !a.startsWith("--"));
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const result = { ...existing };

  const files = fs.readdirSync(IDEAS_DIR).filter((f) => f.endsWith(".md")).sort();
  let added = 0;
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    if (only.length && !only.includes(slug)) continue;
    if (!refresh && !only.length && slug in existing) continue;

    const { data } = matter(fs.readFileSync(path.join(IDEAS_DIR, file), "utf8"));
    const title = wikipediaTitle(data.sources);
    if (!title) {
      console.log(`- ${slug}: no Wikipedia source`);
      result[slug] = null;
      continue;
    }
    try {
      const found = await findImage(title);
      if (found.image) {
        result[slug] = found.image;
        added++;
        console.log(`✓ ${slug}: ${found.image.license} · ${found.image.credit.slice(0, 40)}`);
      } else {
        result[slug] = null;
        console.log(`- ${slug}: ${found.skip}`);
      }
    } catch (err) {
      console.warn(`! ${slug}: ${err.message}`);
    }
    await sleep(250);
  }

  // Drop entries (and files) for ideas that no longer exist.
  for (const slug of Object.keys(result)) {
    if (fs.existsSync(path.join(IDEAS_DIR, `${slug}.md`))) continue;
    delete result[slug];
    fs.rmSync(path.join(PUBLIC_DIR, `${slug}.webp`), { force: true });
  }

  // Download any image that isn't stored locally yet.
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  let downloaded = 0;
  for (const [slug, image] of Object.entries(result)) {
    if (!image) continue;
    // Older entries kept the Wikimedia URL in `src`.
    if (!image.remoteSrc && /^https?:/.test(image.src ?? "")) image.remoteSrc = image.src;
    const file = path.join(PUBLIC_DIR, `${slug}.webp`);
    if (fs.existsSync(file) && image.src === localPath(slug)) continue;
    try {
      const { width, height } = await download(image.remoteSrc, file);
      Object.assign(image, { src: localPath(slug), width, height });
      downloaded++;
      console.log(`↓ ${slug}: ${width}×${height}`);
    } catch (err) {
      // Keep the entry out of the site until its file exists; the next run retries it.
      delete image.src;
      console.warn(`! ${slug}: download failed (${err.message}); will retry next run`);
    }
    await sleep(1500);
  }

  const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
  const ready = Object.values(sorted).filter((i) => i?.src).length;
  console.log(`\n${added} new image(s), ${downloaded} downloaded. ${ready} of ${Object.keys(sorted).length} ideas have an image ready. Wrote content/images.json`);
}

/** Fetches an image politely (retrying on 429) and stores it as WebP, at most WIDTH pixels wide. */
async function download(url, file) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.status === 429 || res.status === 503) {
      const wait = Number(res.headers.get("retry-after")) * 1000 || 10_000 * 2 ** attempt;
      console.log(`  rate-limited, waiting ${Math.round(wait / 1000)}s…`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const input = Buffer.from(await res.arrayBuffer());
    const info = await sharp(input)
      .rotate()
      .resize({ width: WIDTH, withoutEnlargement: true })
      .flatten({ background: "#f7f5f0" })
      .webp({ quality: 78 })
      .toFile(file);
    return { width: info.width, height: info.height };
  }
  throw new Error("still rate-limited after retries");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
