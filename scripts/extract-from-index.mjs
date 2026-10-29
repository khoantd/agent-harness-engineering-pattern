#!/usr/bin/env node
/**
 * One-shot migration: legacy/index.html (or ./index.html) → content/*
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const htmlPath = [
  path.join(root, 'legacy', 'index.html'),
  path.join(root, 'index.html'),
].find((p) => fs.existsSync(p));

if (!htmlPath) {
  console.error('No index.html found at legacy/index.html or ./index.html');
  process.exit(1);
}

const out = {
  patterns: path.join(root, 'content', 'patterns'),
  chapters: path.join(root, 'content', 'chapters'),
  diagrams: path.join(root, 'content', 'diagrams'),
  publicDiagrams: path.join(root, 'public', 'diagrams'),
};

for (const d of Object.values(out)) fs.mkdirSync(d, { recursive: true });

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

function decode(text) {
  return (text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function yamlEscape(s) {
  if (s == null) return '""';
  const str = String(s);
  if (/[:#{}[\],&*?|>!%@`]|^\s|\s$|"|'/.test(str) || str.includes('\n')) {
    return JSON.stringify(str);
  }
  return str;
}

function chapterSlugFromId(id) {
  return id.replace(/^ch-/, '');
}

/** Map pattern id → chapter slug via section ancestry */
function chapterForArticle($art) {
  const section = $art.closest('section.chapter');
  const id = section.attr('id') || '';
  return chapterSlugFromId(id);
}

function fitFromBadge($art) {
  const fit = $art.find('.fit').first();
  if (!fit.length) return 'adapted';
  if (fit.hasClass('fit-direct')) return 'direct';
  if (fit.hasClass('fit-stretch') || fit.hasClass('fit-stretched')) return 'stretched';
  return 'adapted';
}

function reviewIdFromArt($art) {
  const href = $art.find('a.rev').attr('href') || '';
  return href.replace(/^#/, '') || null;
}

function extractCode($art) {
  const code = $art.find('.code pre code').first();
  if (!code.length) return '';
  // Get text with newlines preserved; strip span chrome
  return code.text().replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

function extractSteps($art) {
  const items = [];
  $art.find('.steps ol li').each((_, li) => {
    items.push(decode($(li).text()));
  });
  return items;
}

function saveSvg(id, svgHtml) {
  if (!svgHtml) return null;
  // Ensure role/class preserved
  const file = `${id}.svg`;
  const wrapped = svgHtml.includes('xmlns')
    ? svgHtml
    : svgHtml.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  fs.writeFileSync(path.join(out.diagrams, file), wrapped);
  fs.writeFileSync(path.join(out.publicDiagrams, file), wrapped);
  return file;
}

function figCaption($art) {
  const cap = $art.find('figcaption').first();
  if (!cap.length) return { fig: null, caption: null };
  const fn = decode(cap.find('.fn').text()) || null;
  const clone = cap.clone();
  clone.find('.fn').remove();
  const caption = decode(clone.text());
  return { fig: fn, caption };
}

const patterns = [];
const chapterMeta = new Map();

$('section.chapter').each((_, sec) => {
  const $sec = $(sec);
  const sid = $sec.attr('id') || '';
  const slug = chapterSlugFromId(sid);
  const opener = $sec.find('.opener').first();
  const number = decode(opener.find('.chn').text());
  const kick = decode(opener.find('.kick').text());
  const title = decode(opener.find('h2').first().text());
  const summary = decode(opener.find('p').first().text());
  const patternIds = [];
  opener.find('.chips a.chip').each((__, a) => {
    const href = $(a).attr('href') || '';
    patternIds.push(href.replace(/^#/, ''));
  });

  chapterMeta.set(slug, {
    id: slug,
    sectionId: sid,
    number,
    kick,
    title,
    summary,
    patternIds,
  });

  // Review / glossary special bodies
  if (slug === 'review' || slug === 'glossary') {
    const bodyHtml = $sec
      .clone()
      .find('.opener')
      .remove()
      .end()
      .html();
    chapterMeta.get(slug).bodyHtml = (bodyHtml || '').trim();
  }
});

$('article.pat').each((_, art) => {
  const $art = $(art);
  const id = $art.attr('id');
  if (!id) return;

  const chapter = chapterForArticle($art);
  const number = decode($art.find('.num').first().text());
  const title = decode($art.find('h3').first().text());
  const aka = decode($art.find('.aka').first().text()) || null;
  const gist = decode($art.find('.gist').first().text());
  const fit = fitFromBadge($art);
  const reviewId = reviewIdFromArt($art);

  const analogyTitle = decode($art.find('.analogy h4').first().text()) || null;
  const analogy = decode($art.find('.analogy p').first().text()) || null;
  const classic = decode($art.find('.classic p').first().text()) || null;
  const harness = decode($art.find('p.harness').first().text()) || null;
  const enterprise = decode($art.find('.ent p').first().text()) || null;
  const watch = (() => {
    const w = $art.find('p.watch').first();
    if (!w.length) return null;
    const clone = w.clone();
    clone.find('.lab').remove();
    return decode(clone.text());
  })();

  const steps = extractSteps($art);
  const code = extractCode($art);
  const { fig, caption } = figCaption($art);

  const svgEl = $art.find('figure.fig svg').first();
  const diagram = svgEl.length ? saveSvg(id, $.html(svgEl)) : null;

  const front = [
    '---',
    `id: ${yamlEscape(id)}`,
    // Always quote so YAML does not parse 8.01 as a float
    `number: ${JSON.stringify(number)}`,
    `title: ${yamlEscape(title)}`,
    `chapter: ${yamlEscape(chapter)}`,
    `fit: ${fit}`,
  ];
  if (aka) front.push(`aka: ${yamlEscape(aka)}`);
  if (reviewId) front.push(`review_id: ${yamlEscape(reviewId)}`);
  if (fig) front.push(`figure_number: ${yamlEscape(fig)}`);
  if (caption) front.push(`figure_caption: ${yamlEscape(caption)}`);
  if (diagram) front.push(`diagram: ${yamlEscape(diagram)}`);
  if (analogyTitle) front.push(`analogy_title: ${yamlEscape(analogyTitle)}`);
  front.push('---', '');

  const body = [];
  body.push('## Gist', '', gist, '');
  if (analogy) {
    body.push('## Everyday comparison', '');
    if (analogyTitle) body.push(`### ${analogyTitle}`, '');
    body.push(analogy, '');
  }
  if (classic) body.push('## Classic meaning', '', classic, '');
  if (harness) body.push('## In the agent system', '', harness, '');
  if (enterprise) body.push('## In a large company', '', enterprise, '');
  if (steps.length) {
    body.push('## Step by step', '');
    steps.forEach((s) => body.push(`1. ${s}`));
    body.push('');
  }
  if (code) {
    body.push('## Code sketch', '', '```python', code.replace(/\n$/, ''), '```', '');
  }
  if (watch) body.push('## Be careful', '', watch, '');
  if (diagram) {
    body.push(
      '## Diagram',
      '',
      `![${fig || id}: ${caption || title}](/diagrams/${diagram})`,
      '',
    );
  }

  const md = front.join('\n') + body.join('\n');
  fs.writeFileSync(path.join(out.patterns, `${id}.md`), md);

  patterns.push({
    id,
    number,
    title,
    chapter,
    fit,
    aka,
    reviewId,
    gist,
    diagram,
    figure_number: fig,
    figure_caption: caption,
    path: `content/patterns/${id}.md`,
    url: `/patterns/${id}/`,
  });
});

// Chapters markdown
for (const [slug, ch] of chapterMeta) {
  const front = [
    '---',
    `id: ${yamlEscape(ch.id)}`,
    `section_id: ${yamlEscape(ch.sectionId)}`,
    `number: ${yamlEscape(ch.number)}`,
    `title: ${yamlEscape(ch.title)}`,
    `kick: ${yamlEscape(ch.kick)}`,
    `patterns:`,
    ...ch.patternIds.map((p) => `  - ${p}`),
    '---',
    '',
    '## Summary',
    '',
    ch.summary || '',
    '',
  ];
  if (ch.bodyHtml && (slug === 'review' || slug === 'glossary')) {
    // Keep raw HTML appendix in a sidecar for React to render carefully
    fs.writeFileSync(
      path.join(out.chapters, `${slug}.html`),
      ch.bodyHtml,
    );
  }
  fs.writeFileSync(path.join(out.chapters, `${slug}.md`), front.join('\n'));
}

// Front matter (cover)
const cover = $('section.cover.front').first();
const coverDiagrams = [];
cover.find('figure.fig').each((i, fig) => {
  const $fig = $(fig);
  const svg = $fig.find('svg').first();
  const cap = $fig.find('figcaption');
  const fn = decode(cap.find('.fn').text());
  const clone = cap.clone();
  clone.find('.fn').remove();
  const caption = decode(clone.text());
  const id = i === 0 ? 'harness-map' : `legend-${i}`;
  if (svg.length) {
    saveSvg(id, $.html(svg));
    coverDiagrams.push({ id, figure_number: fn, figure_caption: caption, diagram: `${id}.svg` });
  }
});

const howto = [];
cover.find('.howto div').each((_, d) => {
  const $d = $(d);
  howto.push({
    title: decode($d.find('b').text()),
    body: decode($d.clone().children('b').remove().end().text()),
  });
});

const frontMatter = {
  eyebrow: decode(cover.find('.eyebrow').text()),
  title_html: 'Harness <em>Patterns</em>',
  title: 'Harness Patterns',
  lede: decode(cover.find('.lede').text()),
  stats: [],
  sections: [],
  howto,
  diagrams: coverDiagrams,
};

cover.find('.stats span').each((_, s) => {
  const $s = $(s);
  frontMatter.stats.push({
    value: decode($s.find('b').text()),
    label: decode($s.clone().children('b').remove().end().text()),
  });
});

cover.find('h2').each((_, h2) => {
  const $h2 = $(h2);
  const heading = decode($h2.text());
  const paras = [];
  let n = $h2.next();
  while (n.length && !n.is('h2') && !n.is('.howto') && !n.is('figure')) {
    if (n.is('p')) paras.push(decode(n.text()));
    n = n.next();
  }
  frontMatter.sections.push({ heading, paragraphs: paras });
});

fs.writeFileSync(
  path.join(root, 'content', 'front-matter.json'),
  JSON.stringify(frontMatter, null, 2),
);

// Catalog
const chapters = [...chapterMeta.values()].map((ch) => ({
  id: ch.id,
  section_id: ch.sectionId,
  number: ch.number,
  title: ch.title,
  kick: ch.kick,
  summary: ch.summary,
  patterns: ch.patternIds,
  url: `/chapters/${ch.id}/`,
  path: `content/chapters/${ch.id}.md`,
}));

const catalog = {
  title: 'Harness Patterns',
  description:
    'Software design patterns mapped onto AI agent harness engineering, in plain English.',
  pattern_count: patterns.length,
  chapter_count: chapters.filter((c) => !['review', 'glossary'].includes(c.id)).length,
  generated_at: new Date().toISOString(),
  chapters,
  patterns,
};

fs.writeFileSync(
  path.join(root, 'content', 'catalog.json'),
  JSON.stringify(catalog, null, 2),
);
fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'public', 'catalog.json'),
  JSON.stringify(catalog, null, 2),
);

// TOC order from original nav
const toc = [];
$('#toc > .tch').each((_, li) => {
  const $li = $(li);
  const chLink = $li.children('a.tct').first();
  const href = (chLink.attr('href') || '').replace(/^#/, '');
  const slug = chapterSlugFromId(href);
  const patternsInCh = [];
  $li.find('ol a').each((__, a) => {
    const $a = $(a);
    patternsInCh.push({
      id: ($a.attr('href') || '').replace(/^#/, ''),
      number: decode($a.find('.tn').text()),
      title: decode($a.clone().children('.tn').remove().end().text()),
      search_name: $a.attr('data-name') || '',
    });
  });
  toc.push({
    id: slug,
    number: decode(chLink.find('.tn').text()),
    title: decode(chLink.clone().children('.tn').remove().end().text()),
    patterns: patternsInCh,
  });
});

fs.writeFileSync(
  path.join(root, 'content', 'toc.json'),
  JSON.stringify(toc, null, 2),
);

console.log(`Extracted ${patterns.length} patterns, ${chapters.length} chapters from ${path.relative(root, htmlPath)}`);
if (patterns.length < 190) {
  console.warn('WARNING: expected ~192 patterns');
  process.exitCode = 1;
}
