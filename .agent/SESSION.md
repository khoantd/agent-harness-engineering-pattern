# Agent session

> Cross-tool handoff state for Cursor, Claude Code, and Kiro. Update at session end (`/handoff`) or phase changes; read at session start (`/resume`).

## Meta

| Field | Value |
|-------|-------|
| **Updated** | 2026-10-29 |
| **Phase** | build |
| **Tool** | cursor |
| **Persona** | _(frontend / content migration)_ |

## Goal

Migrate Harness Patterns from a single HTML file into a Next.js React app whose canonical content is Markdown/JSON that AI agents can crawl and learn from.

## Done

- Scaffolded Next.js 15 App Router + TypeScript (`package.json`, `app/`, `lib/`, `components/`)
- Extracted 192 patterns + 15 chapters/appendices from `legacy/index.html` → `content/`
- Ported book CSS to `app/globals.css`; TOC, search, pattern plates, diagrams
- Routes: `/`, `/chapters/[slug]/`, `/patterns/[slug]/` with JSON-LD
- Agent artifacts: `public/llms.txt`, `llms-full.txt`, `catalog.json`, `sitemap.xml`, `robots.txt`
- `npm run build` succeeds (211 static pages exported to `out/`)
- README + `.agent/PROJECT.md` updated

## In progress

- _(none)_
- **Blockers:** none

## Next

1. Optional polish: theme toggle, scrollspy on chapter long pages, appendix HTML cleanup
2. Deploy `out/` (or Vercel) and set `SITE_URL` for absolute sitemap/llms links
3. Consider removing or further shrinking `legacy/index.html` once stakeholders confirm parity

## Decisions

- Next.js static export (not Vite SPA) so HTML is crawlable
- Markdown under `content/patterns/` is source of truth for agents
- Pattern numbers always YAML-quoted to avoid float parse (`8.01`)

## Gotchas

- Parent folder may have another `package-lock.json` — `outputFileTracingRoot` set in `next.config.ts`
- Re-run `npm run extract` only against `legacy/index.html`; edits should go to Markdown thereafter

## Pointers

| Item | Location |
|------|----------|
| Spec | plan: React agent-crawlable book |
| Tasks | `tasks/todo.md` |
| Branch | _(local)_ |
| Key files | `content/`, `app/`, `scripts/`, `legacy/index.html` |
