# Project structure map

> Persistent overview for AI agents. Generated on first run by `/understand` (see `.cursor/commands/understand-project.md`). Update when architecture changes significantly.

## Meta

| Field | Value |
|-------|-------|
| **Updated** | 2026-10-29 |
| **Tool** | cursor |

## Stack

- **App:** Next.js 15 (App Router) + React 19 + TypeScript — static export (`output: 'export'`)
- **Canonical content:** Markdown + JSON under `content/` (192 patterns)
- **UI:** Ported field-manual CSS (`app/globals.css`), Google Fonts (Bricolage Grotesque, Literata, IBM Plex Mono)
- **Agent harness scaffolding:** `.cursor/`, `.claude/`, `.kiro/`, `.agents/` (+ `AGENTS.md`, `GEMINI.md`)
- **Legacy:** original single-file book at `legacy/index.html` (migration source only)

## Layout

| Path | Purpose |
|------|---------|
| `app/` | Next.js routes: home, `/chapters/[slug]`, `/patterns/[slug]` |
| `components/` | BookShell (TOC/search), PatternCard, Diagram, Cover |
| `content/patterns/` | Canonical pattern Markdown (agent learning corpus) |
| `content/chapters/` | Chapter openers (+ `.html` sidecars for appendices) |
| `content/diagrams/` | SVG diagrams |
| `content/catalog.json` | Machine index of all patterns/chapters |
| `lib/` | Content loaders + Zod schema |
| `public/` | `llms.txt`, `llms-full.txt`, `catalog.json`, `sitemap.xml`, diagrams |
| `scripts/` | `extract-from-index.mjs`, `emit-agent-artifacts.mjs` |
| `legacy/index.html` | Pre-migration monolith |
| `.cursor/` etc. | Agent workflow trees |

## Entry points

- **Human / browser:** `npm run dev` → http://localhost:3000 (or open `out/` after build)
- **AI agents (preferred):** read `content/patterns/*.md`, `/llms.txt`, `/catalog.json`, `/llms-full.txt`
- **Agent workflow:** `AGENTS.md` → tool hub → `/spec` → `/plan` → `/build` …

### Book chapters (192 patterns)

1. The Agent Loop  
2. The Tool System  
3. The Model Call Layer  
4. Context and Memory  
5. Multi-Agent Orchestration  
6. Async, Concurrency and Scheduling  
7. Safety, Permissions and Resilience  
8. Harness Architecture  
9. Functional Plumbing  
10. The Harness Frontend  
11. Performance Internals  
12. Testing and Evals  
13. Code-Level Idioms  

Plus appendices A (enterprise review) and B (glossary).

## Key files

- `content/patterns/*.md` — source of truth for pattern prose
- `app/patterns/[slug]/page.tsx` — crawlable pattern pages + JSON-LD
- `scripts/extract-from-index.mjs` — regenerate content from legacy HTML
- `.agent/SESSION.md` — cross-tool handoff

## Commands

| Action | Command |
|--------|---------|
| Install | `npm install` |
| Dev | `npm run dev` |
| Build (static) | `npm run build` → `out/` |
| Re-extract content | `npm run extract` |
| Emit agent files | `npm run emit-agent` |

## Notes

- Product intent: map classic software design patterns onto **AI agent harness** engineering.
- Prefer Markdown under `content/` for learning — do not scrape `legacy/index.html`.
- Do not store secrets in `.agent/` files.
