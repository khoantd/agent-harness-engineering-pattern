#!/usr/bin/env node
/**
 * Emit llms.txt, llms-full.txt, catalog.json (public), sitemap.xml, robots.txt
 * from content/catalog.json and pattern markdown.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const contentDir = path.join(root, 'content');
const publicDir = path.join(root, 'public');
const catalogPath = path.join(contentDir, 'catalog.json');

if (!fs.existsSync(catalogPath)) {
  console.error('Missing content/catalog.json — run npm run extract first');
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const siteUrl = process.env.SITE_URL || '';

fs.mkdirSync(publicDir, { recursive: true });

function abs(p) {
  if (!siteUrl) return p;
  return `${siteUrl.replace(/\/$/, '')}${p}`;
}

// catalog.json (public)
fs.writeFileSync(
  path.join(publicDir, 'catalog.json'),
  JSON.stringify(catalog, null, 2),
);

// llms.txt
const llmsLines = [
  '# Harness Patterns',
  '',
  `> ${catalog.description}`,
  '',
  `Patterns: ${catalog.pattern_count} · Chapters: ${catalog.chapter_count}`,
  '',
  '## Learn from source (preferred for AI agents)',
  '',
  '- Markdown corpus: content/patterns/*.md',
  '- Chapters: content/chapters/*.md',
  '- Machine index: /catalog.json',
  '- Full text dump: /llms-full.txt',
  '',
  '## Chapters',
  '',
];

for (const ch of catalog.chapters) {
  if (ch.id === 'review' || ch.id === 'glossary') continue;
  llmsLines.push(`- [${ch.number} ${ch.title}](${abs(ch.url)}): ${ch.summary?.slice(0, 140) || ''}`);
}

llmsLines.push('', '## Patterns', '');
for (const p of catalog.patterns) {
  llmsLines.push(`- [${p.number} ${p.title}](${abs(p.url)}): ${p.gist}`);
}

llmsLines.push(
  '',
  '## Appendices',
  '',
  `- [Enterprise review](${abs('/chapters/review/')})`,
  `- [Glossary](${abs('/chapters/glossary/')})`,
  '',
);

fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsLines.join('\n'));

// llms-full.txt — concatenate all pattern markdown
const full = [
  '# Harness Patterns — full text for AI agents',
  '',
  catalog.description,
  '',
  '---',
  '',
];

for (const p of catalog.patterns) {
  const mdPath = path.join(root, p.path);
  if (!fs.existsSync(mdPath)) continue;
  full.push(fs.readFileSync(mdPath, 'utf8').trim(), '', '---', '');
}

fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), full.join('\n'));

// robots.txt
fs.writeFileSync(
  path.join(publicDir, 'robots.txt'),
  [
    'User-agent: *',
    'Allow: /',
    '',
    siteUrl ? `Sitemap: ${abs('/sitemap.xml')}` : 'Sitemap: /sitemap.xml',
    '',
    '# AI / LLM crawlers: prefer structured corpus',
    '# llms.txt: /llms.txt',
    '# Full text: /llms-full.txt',
    '# Catalog: /catalog.json',
    '',
  ].join('\n'),
);

// sitemap.xml
const urls = [
  { loc: '/', priority: '1.0' },
  ...catalog.chapters.map((c) => ({ loc: c.url, priority: '0.8' })),
  ...catalog.patterns.map((p) => ({ loc: p.url, priority: '0.7' })),
  { loc: '/llms.txt', priority: '0.9' },
  { loc: '/catalog.json', priority: '0.9' },
];

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(
    (u) =>
      `  <url><loc>${abs(u.loc)}</loc><changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`,
  ),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);

console.log(
  `Emitted agent artifacts: llms.txt, llms-full.txt (${catalog.pattern_count} patterns), catalog.json, sitemap.xml, robots.txt`,
);
