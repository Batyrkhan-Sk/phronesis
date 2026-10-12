# Phronesis

Things worth knowing, things worth remembering, and things worth talking about.

A knowledge-exploration app where the unit of content is an **idea**: a short, sourced, connected piece of knowledge that leads to other ideas.

## Deploy

https://phronesis-three.vercel.app/

## Running it

```bash
pnpm install
pnpm db:push        # creates the local SQLite database (local.db)
pnpm dev            # http://localhost:3000
```

`.env.local` holds the configuration (see `.env.example`). Social sign-in buttons only appear when the matching `GITHUB_*` / `GOOGLE_*` keys are set. Email and password sign-in always works.

| Script | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build. **Also validates all content**: broken links between ideas fail the build |
| `pnpm db:push` | Apply the database schema |
| `pnpm db:studio` | Browse the database |
| `pnpm typecheck` / `pnpm lint` | Checks |

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Motion · Better Auth · Drizzle ORM + libSQL (SQLite locally, Turso in production) · Markdown content validated with Zod.

## Structure

```
content/
  ideas/*.md          one file per idea
  trails/*.md         curated chains of ideas
src/
  app/                routes: /, /idea/[slug], /trail/[slug], /topic/[slug], /mode/[mode],
                      /explore, /trails, /library (saved · collections · history), /sign-in, /sign-up
  app/actions.ts      server actions: save, collections, history
  components/shell/   site header, footer, ⌘K search
  components/idea/    idea cards, depth reader, fact check, sources, connections
  lib/content/        loader, schema, taxonomy (topics, modes, claim statuses)
  lib/db/             Drizzle schema + client
  lib/auth/           Better Auth server + client
```

## Writing an idea

Create `content/ideas/<slug>.md`:

```markdown
---
title: "Why do we say “OK”?"
hook: "One sentence that makes people want to click."
short: "The 30-second version."
kind: word            # fact | story | concept | phenomenon | person | place | word | law | dish | object | event
era: "1839"           # optional
glyph: "OK"           # optional, up to 6 characters, shown on the cover
topics: [language, history]
modes: [story, didnt-know]     # learn-in-5 | useful | strange | story | didnt-know (others are added automatically)
conversationStarter: "Optional ready-to-use line."
quote: { text: "…", by: "…" }  # optional
connections:
  - to: telegraphy               # slug of another idea; must exist
    kind: leads-to               # leads-to | related | same-pattern | contrast | influenced | part-of
    why: "Explain the connection. This text is shown to readers."
claims:
  - text: "A specific claim."
    status: established          # established | interpretation | disputed | anecdote | myth
sources:                         # at least one
  - title: "…"
    author: "…"
    year: 2011
    url: "https://…"             # optional
    type: book                   # book | paper | article | archive | reference | video
---

The full story in Markdown. Link to other ideas with [text](idea:other-slug).

<!-- deep-dive -->

Optional deeper layer. Adding it puts the idea in the "Deep dive" mode.
```

Connections only need to be written in one file; they appear on both ideas. The **Conversation starters** mode is assigned automatically when an idea has a `conversationStarter`, **Deep dive** when it has a deep-dive section, and **Hidden connections** when it has three or more connections.

Topics and modes are defined in `src/lib/content/taxonomy.ts`.

### Merging duplicates

If two ideas cover the same thing, keep the one people may already have saved, fold the best of the other into it, delete the other file and list its slug under `aliases:`. Old links and saved ideas then redirect to the remaining idea:

```yaml
aliases: [diabolus-in-musica]
```

## Images

`pnpm images` finds a freely licensed image for each idea: it takes the lead image of the Wikipedia article the idea cites, keeps it only if Wikimedia Commons lists a free licence (public domain, CC0, CC BY, CC BY-SA), and records the author and licence in `content/images.json`. It then downloads the image once, resizes it to at most 1200px wide as WebP and saves it in `public/images/ideas/`, so the site never hotlinks Wikimedia. Run it after adding ideas (`pnpm images <slug>` for specific ones, `--refresh` to re-check all). Images appear on idea pages (with credit), cards, the deck and the home page, and every one is credited on `/credits`.

## Video and animation

Some ideas are easier to see than to read: an experiment, a map changing over centuries, a character written stroke by stroke. `pnpm media` adds a short, freely licensed clip from Wikimedia Commons to such an idea. Clips are picked by hand, because the article an idea cites often holds clips that only show the subject:

```bash
pnpm media --scan kuleshov-effect                          # list videos and GIFs in the articles the idea cites
pnpm media kuleshov-effect "File:KuleshovEffectExample.ogv" # check the licence, download, convert
pnpm media kuleshov-effect --remove
```

Only add a clip that explains the idea, and rewrite its `caption` in `content/media.json` so it says exactly what is on screen (for example “a modern reconstruction, not the original footage”). Each clip is converted once to H.264 MP4 (plays on every phone) with a poster frame and stored in `public/media/ideas/`. GIFs become silent looping MP4s, much smaller than the GIF. The ffmpeg binary is fetched the first time the script needs it, so installs and deploys don’t download it. Clips appear on the idea page, are marked “▶ Video” or “▶ Animation” on cards, and are credited on `/credits`.

## The deck

`/deck` shows one idea at a time, built for phones: swipe right to keep an idea in your library, left to skip, tap to read. Buttons and the arrow keys do the same.

## Discussion leads

`pnpm leads` reads recent public Mastodon posts for the hashtags of the least-covered topics and writes `leads/leads.md` (gitignored). The file starts with a **Terms spotted** list (named concepts, quoted words and phrases, related hashtags), followed by the most-engaged posts. Leads are inspiration, not evidence: every fact must still be verified before it becomes an idea.

Options: `--topics law,music`, `--tags etymology,foodhistory`, `--instance mastodon.social`, `--per-tag 6`, `--pages 3`, `--thinnest 3`, `--out leads/leads.md`.

## Deploying (Vercel + Turso)

The local `local.db` file can't be used on serverless hosting, so production uses [Turso](https://turso.tech), hosted libSQL/SQLite. The code already supports it: set `DATABASE_URL` (a `libsql://` URL) and `DATABASE_AUTH_TOKEN`, or install the Turso integration from the Vercel Marketplace with the prefix `DATABASE`, which sets `DATABASE_TURSO_DATABASE_URL` and `DATABASE_TURSO_AUTH_TOKEN`. All of these names work; see `src/lib/db/credentials.ts`.

1. **Create a Turso database** (dashboard → Create database) and an auth token.
2. **Create the tables** in it:
   ```bash
   DATABASE_URL="libsql://<db>.turso.io" DATABASE_AUTH_TOKEN="<token>" pnpm db:push
   ```
3. **Import the GitHub repo on [Vercel](https://vercel.com)** and set these environment variables:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | the `libsql://…` URL |
   | `DATABASE_AUTH_TOKEN` | the Turso token |
   | `BETTER_AUTH_SECRET` | a new random secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
   | `BETTER_AUTH_URL` | the public URL, e.g. `https://phronesis.vercel.app` |

4. **Deploy.** If you add a custom domain, update `BETTER_AUTH_URL` and redeploy.
5. *Optional:* for GitHub/Google sign-in, add `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` or `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, with the OAuth callback URL `https://<domain>/api/auth/callback/<provider>`.

If Vercel’s install step fails on pnpm 11, add the environment variable `ENABLE_EXPERIMENTAL_COREPACK=1`.

When the schema in `src/lib/db/schema.ts` changes, run `pnpm db:push` against the production database again (with the Turso variables set).
