#!/usr/bin/env node
/**
 * Short videos and animations for ideas, recorded in content/media.json.
 *
 * Unlike images, media are chosen by hand: a Wikipedia article often holds clips that
 * only show the subject, and an idea should only get one that explains it. So the
 * script first lists the candidates, then adds the one you pick:
 *
 *   pnpm media --scan [slug…]            # videos and GIFs in the Wikipedia articles each idea cites
 *   pnpm media <slug> "File:Name.webm"   # check the licence, then download and convert that file
 *   pnpm media <slug> --remove           # drop an idea's clip
 *   pnpm media                           # convert anything missing; drop clips of deleted ideas
 *
 * Only freely licensed files (public domain, CC0, CC BY, CC BY-SA) on Wikimedia Commons
 * are accepted, and clips longer than MAX_SECONDS are refused. Every file is converted
 * once to H.264 MP4, which plays on every phone (Commons only serves WebM and Ogg), plus a
 * WebP poster frame, and saved in public/media/ideas/. GIFs become silent looping MP4s,
 * which are far smaller than the GIF and can be paused.
 *
 * Edit the `caption` in content/media.json so it says plainly what the clip shows
 * (for example that a film is a modern reconstruction).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = process.cwd();
const IDEAS_DIR = path.join(ROOT, "content", "ideas");
const OUT = path.join(ROOT, "content", "media.json");
const PUBLIC_DIR = path.join(ROOT, "public", "media", "ideas");
const USER_AGENT = "PhronesisImages/1.0 (+https://github.com/Batyrkhan-Sk/phronesis)";
const MAX_SECONDS = 180;
const MAX_WIDTH = 854;
const PAPER = "0xf7f5f0";

const FREE = /^(public domain|pd\b|cc0|cc[ -]by(-sa)?([ -]\d(\.\d)?)?)/i;
const NOT_FREE = /non-free|fair use|copyrighted|all rights reserved/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripHtml = (html = "") =>
  html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "’").replace(/\s+/g, " ").trim();
const withoutQuery = (url) => url.split("?")[0];
const cleanCredit = (text) => text.replace(/^(.+?)\1$/, "$1").trim() || "Unknown author";
const files = (slug) => ({ video: path.join(PUBLIC_DIR, `${slug}.mp4`), poster: path.join(PUBLIC_DIR, `${slug}.webp`) });

async function fetchPolitely(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.status === 429 || res.status === 503) {
      const wait = Number(res.headers.get("retry-after")) * 1000 || 10_000 * 2 ** attempt;
      console.log(`  rate-limited, waiting ${Math.round(wait / 1000)}s…`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res;
  }
  throw new Error("still rate-limited after retries");
}
const getJson = async (url) => (await fetchPolitely(url)).json();

/** Every English Wikipedia article an idea cites. */
function wikipediaTitles(sources) {
  const titles = [];
  for (const s of sources ?? []) {
    const m = /^https?:\/\/en\.wikipedia\.org\/wiki\/([^#?]+)/.exec(s.url ?? "");
    if (m) titles.push(decodeURIComponent(m[1]));
  }
  return [...new Set(titles)];
}

/** Licence, size, duration and Commons transcodes of one file. */
async function fileInfo(file) {
  const params = new URLSearchParams({
    action: "query",
    titles: file,
    prop: "videoinfo",
    viprop: "url|size|mediatype|extmetadata|derivatives",
    format: "json",
  });
  const data = await getJson(`https://commons.wikimedia.org/w/api.php?${params}`);
  const info = Object.values(data.query?.pages ?? {})[0]?.videoinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value);
  const usage = stripHtml(meta.UsageTerms?.value);
  return {
    info,
    license,
    free: Boolean(license) && FREE.test(license) && !NOT_FREE.test(`${license} ${usage}`),
    description: stripHtml(meta.ImageDescription?.value),
    credit: cleanCredit(stripHtml(meta.Artist?.value)),
    licenseUrl: meta.LicenseUrl?.value || undefined,
  };
}

async function scan(slugs) {
  for (const file of fs.readdirSync(IDEAS_DIR).filter((f) => f.endsWith(".md")).sort()) {
    const slug = file.replace(/\.md$/, "");
    if (slugs.length && !slugs.includes(slug)) continue;
    const { data } = matter(fs.readFileSync(path.join(IDEAS_DIR, file), "utf8"));
    for (const title of wikipediaTitles(data.sources)) {
      const list = await getJson(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`).catch(() => null);
      await sleep(200);
      for (const item of list?.items ?? []) {
        if (!(item.type === "video" || /\.gif$/i.test(item.title))) continue;
        const found = await fileInfo(item.title).catch(() => null);
        await sleep(200);
        if (!found) continue;
        const { info } = found;
        const seconds = info.duration ? `${Math.round(info.duration)}s` : "still";
        const verdict = !found.free ? "not free" : info.duration > MAX_SECONDS ? "too long" : !info.duration ? "not animated" : "ok";
        console.log(`${slug} · ${verdict} · ${item.title} · ${seconds} · ${info.width}×${info.height} · ${found.license}`);
        if (found.description) console.log(`    ${found.description.slice(0, 160)}`);
      }
    }
  }
}

/** Records the chosen file for an idea after checking it is free, short and animated. */
async function choose(slug, file, media) {
  if (!fs.existsSync(path.join(IDEAS_DIR, `${slug}.md`))) throw new Error(`no idea called ${slug}`);
  const name = file.startsWith("File:") ? file : `File:${file}`;
  const found = await fileInfo(name);
  if (!found) throw new Error(`${name} is not on Wikimedia Commons`);
  const { info } = found;
  if (!found.free) throw new Error(`licence not free: ${found.license || "unknown"}`);
  if (!info.duration) throw new Error("this file is a still image, not a video or animation");
  if (info.duration > MAX_SECONDS) throw new Error(`too long (${Math.round(info.duration)}s, limit ${MAX_SECONDS}s)`);

  const animation = /\.gif$/i.test(name);
  // Prefer Commons’ ready-made 480p transcode (smaller download) over the original.
  const transcode = (info.derivatives ?? [])
    .filter((d) => d.type?.startsWith("video/webm") && d.height <= 480)
    .sort((a, b) => b.height - a.height)[0];
  media[slug] = {
    kind: animation ? "animation" : "video",
    file: name,
    caption: found.description.slice(0, 220),
    credit: found.credit,
    license: found.license,
    licenseUrl: found.licenseUrl,
    sourceUrl: info.descriptionurl,
    remoteSrc: withoutQuery(animation || !transcode ? info.url : transcode.src),
    width: info.width,
    height: info.height,
    duration: Math.round(info.duration),
  };
  for (const f of Object.values(files(slug))) fs.rmSync(f, { force: true });
  console.log(`✓ ${slug}: ${name} (${found.license}, ${Math.round(info.duration)}s)`);
}

/** ffmpeg comes from the ffmpeg-static package; its binary is fetched the first time it’s needed. */
function ffmpegPath() {
  const require = createRequire(import.meta.url);
  const bin = require("ffmpeg-static");
  if (!bin) throw new Error("ffmpeg-static has no binary for this platform");
  if (!fs.existsSync(bin)) {
    console.log("Fetching ffmpeg (once)…");
    execFileSync(process.execPath, [require.resolve("ffmpeg-static/install.js")], { stdio: "inherit" });
  }
  return bin;
}

/** Downloads a clip and converts it to MP4 plus a WebP poster frame. */
async function convert(slug, entry, ffmpeg) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "phronesis-media-"));
  try {
    const input = path.join(tmp, `input${path.extname(entry.remoteSrc)}`);
    fs.writeFileSync(input, Buffer.from(await (await fetchPolitely(entry.remoteSrc)).arrayBuffer()));

    const out = files(slug);
    // Even dimensions (H.264 needs them), never wider than MAX_WIDTH, never enlarged.
    const scale = `scale='min(${MAX_WIDTH},iw)':-2:flags=lanczos`;
    const args =
      entry.kind === "animation"
        ? // GIFs may be transparent: lay them on the site’s paper colour, then loop silently.
          [
            "-i", input,
            "-f", "lavfi", "-i", `color=c=${PAPER}:s=${entry.width}x${entry.height}`,
            "-filter_complex", `[1][0]overlay=shortest=1,${scale},format=yuv420p`,
            "-an",
          ]
        : ["-i", input, "-vf", `${scale},format=yuv420p`, "-c:a", "aac", "-b:a", "96k"];
    execFileSync(ffmpeg, ["-y", "-loglevel", "error", ...args, "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-movflags", "+faststart", out.video]);

    // Poster: the finished state of an animation (e.g. the complete character), early frame of a film.
    const seek = entry.kind === "animation" ? ["-sseof", "-0.3"] : ["-ss", String(Math.min(1, entry.duration / 10))];
    const frame = path.join(tmp, "poster.png");
    execFileSync(ffmpeg, ["-y", "-loglevel", "error", ...seek, "-i", out.video, "-frames:v", "1", frame]);
    const poster = await sharp(frame).webp({ quality: 78 }).toFile(out.poster);

    Object.assign(entry, {
      src: `/media/ideas/${slug}.mp4`,
      poster: `/media/ideas/${slug}.webp`,
      width: poster.width,
      height: poster.height,
    });
    console.log(`↓ ${slug}: ${poster.width}×${poster.height}, ${(fs.statSync(out.video).size / 1e6).toFixed(1)} MB`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const plain = args.filter((a) => !a.startsWith("--"));
  if (args.includes("--scan")) return scan(plain);

  const media = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  if (args.includes("--remove")) {
    for (const slug of plain) {
      delete media[slug];
      for (const f of Object.values(files(slug))) fs.rmSync(f, { force: true });
      console.log(`- ${slug}: removed`);
    }
  } else if (plain.length === 2) {
    await choose(plain[0], plain[1], media);
  } else if (plain.length) {
    throw new Error('usage: pnpm media --scan [slug…] | pnpm media <slug> "File:Name" | pnpm media <slug> --remove | pnpm media');
  }

  // Drop clips of ideas that no longer exist.
  for (const slug of Object.keys(media)) {
    if (fs.existsSync(path.join(IDEAS_DIR, `${slug}.md`))) continue;
    delete media[slug];
    for (const f of Object.values(files(slug))) fs.rmSync(f, { force: true });
  }

  // Convert anything not stored locally yet.
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  let ffmpeg;
  for (const [slug, entry] of Object.entries(media)) {
    const out = files(slug);
    if (entry.src && fs.existsSync(out.video) && fs.existsSync(out.poster)) continue;
    try {
      ffmpeg ??= ffmpegPath();
      await convert(slug, entry, ffmpeg);
    } catch (err) {
      // Keep the clip off the site until its files exist; the next run retries it.
      delete entry.src;
      delete entry.poster;
      console.warn(`! ${slug}: ${err.message}`);
    }
    await sleep(1500);
  }

  const sorted = Object.fromEntries(Object.entries(media).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
  const ready = Object.values(sorted).filter((m) => m.src).length;
  console.log(`\n${ready} idea(s) have a clip ready. Wrote content/media.json`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
