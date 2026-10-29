# Harness Patterns

A field manual that maps classic software design patterns onto **AI agent harness** engineering — plain English, diagrams, and enterprise notes.

## Quick start

```bash
npm install
npm run extract   # only if regenerating from legacy/index.html
npm run emit-agent
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build     # static export → out/
```

## For AI agents (preferred learning surfaces)

| Surface | What it is |
|---------|------------|
| `content/patterns/*.md` | Canonical pattern corpus (192 files, structured Markdown) |
| `content/chapters/*.md` | Chapter openers |
| `content/catalog.json` | Machine index (ids, urls, gists) |
| `/llms.txt` | Short map + links ([llms.txt](https://llmstxt.org/) convention) |
| `/llms-full.txt` | Full concatenated text for bulk ingest |
| `/catalog.json` | Same catalog, served publicly |
| `/patterns/[slug]/` | One crawlable HTML page per pattern (+ JSON-LD) |

Do **not** treat `legacy/index.html` as the source of truth.

## Project layout

```
app/                 Next.js App Router pages
components/          Book UI (TOC, pattern plates, diagrams)
content/             Canonical Markdown + JSON corpus
lib/                 Content loaders + Zod schema
public/              Agent artifacts + diagram SVGs
scripts/             extract-from-index.mjs, emit-agent-artifacts.mjs
legacy/index.html    Original single-file book (migration source)
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Next.js server |
| `npm run build` | Emit agent artifacts + static export |
| `npm run extract` | Re-parse `legacy/index.html` into `content/` |
| `npm run emit-agent` | Write `llms.txt`, `llms-full.txt`, sitemap, robots |

## Agent workflow trees

Cursor / Claude / Kiro / Antigravity harness files live under `.cursor/`, `.claude/`, `.kiro/`, `.agents/`. See [AGENTS.md](AGENTS.md).
