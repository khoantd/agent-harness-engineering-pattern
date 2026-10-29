import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
  PatternFrontmatterSchema,
  type ChapterMeta,
  type Pattern,
  type PatternSections,
  type TocChapter,
} from './schema';

const root = process.cwd();
const contentRoot = path.join(root, 'content');

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, rel), 'utf8')) as T;
}

export function getCatalog() {
  return readJson<{
    title: string;
    description: string;
    pattern_count: number;
    chapter_count: number;
    chapters: ChapterMeta[];
    patterns: Array<{
      id: string;
      number: string;
      title: string;
      chapter: string;
      fit: string;
      gist: string;
      path: string;
      url: string;
    }>;
  }>('catalog.json');
}

export function getToc(): TocChapter[] {
  return readJson<TocChapter[]>('toc.json');
}

export function getFrontMatter() {
  return readJson<{
    eyebrow: string;
    title: string;
    title_html: string;
    lede: string;
    stats: { value: string; label: string }[];
    sections: { heading: string; paragraphs: string[] }[];
    howto: { title: string; body: string }[];
    diagrams: {
      id: string;
      figure_number: string;
      figure_caption: string;
      diagram: string;
    }[];
  }>('front-matter.json');
}

function parseSections(body: string): PatternSections {
  const sections: Record<string, string> = {};
  const parts = body.split(/^## /m).filter(Boolean);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const title = (nl === -1 ? part : part.slice(0, nl)).trim();
    const content = (nl === -1 ? '' : part.slice(nl + 1)).trim();
    sections[title] = content;
  }

  const everyday = sections['Everyday comparison'] || '';
  let analogyTitle: string | undefined;
  let analogy: string | undefined;
  if (everyday) {
    const m = everyday.match(/^###\s+(.+)\n+([\s\S]*)$/);
    if (m) {
      analogyTitle = m[1].trim();
      analogy = m[2].trim();
    } else {
      analogy = everyday;
    }
  }

  const stepsRaw = sections['Step by step'] || '';
  const steps = stepsRaw
    .split('\n')
    .map((l) => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);

  let code: string | undefined;
  const codeBlock = sections['Code sketch'] || '';
  const codeMatch = codeBlock.match(/```(?:\w+)?\n([\s\S]*?)```/);
  if (codeMatch) code = codeMatch[1].replace(/\n$/, '');

  return {
    gist: sections['Gist'] || '',
    analogyTitle,
    analogy,
    classic: sections['Classic meaning'],
    harness: sections['In the agent system'],
    enterprise: sections['In a large company'],
    steps,
    code,
    watch: sections['Be careful'],
  };
}

export function getPatternIds(): string[] {
  return getCatalog().patterns.map((p) => p.id);
}

export function getPattern(id: string): Pattern | null {
  const file = path.join(contentRoot, 'patterns', `${id}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const fm = PatternFrontmatterSchema.parse(data);
  const sections = parseSections(content);
  return {
    ...fm,
    ...sections,
    path: `content/patterns/${id}.md`,
    url: `/patterns/${id}/`,
  };
}

export function getAllPatterns(): Pattern[] {
  return getPatternIds()
    .map((id) => getPattern(id))
    .filter((p): p is Pattern => Boolean(p));
}

export function getChapter(id: string): ChapterMeta | null {
  return getCatalog().chapters.find((c) => c.id === id) || null;
}

export function getChapterIds(): string[] {
  return getCatalog().chapters.map((c) => c.id);
}

export function getPatternsForChapter(chapterId: string): Pattern[] {
  const ch = getChapter(chapterId);
  if (!ch) return [];
  return ch.patterns
    .map((id) => getPattern(id))
    .filter((p): p is Pattern => Boolean(p));
}

export function getChapterHtml(id: string): string | null {
  const file = path.join(contentRoot, 'chapters', `${id}.html`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

export function readDiagramSvg(filename: string): string | null {
  const file = path.join(contentRoot, 'diagrams', filename);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

export function highlightCode(code: string): string {
  // Lightweight highlight matching original book style
  const esc = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return esc
    .replace(
      /(^|\n)(\s*)(#.*)$/gm,
      '$1$2<span class="cm">$3</span>',
    )
    .replace(
      /\b(while|and|not|if|raise|continue|break|class|def|for|in|return|or|else|elif|True|False|None|from|import|async|await|yield|try|except|with|as|lambda|pass)\b/g,
      '<span class="kw">$1</span>',
    );
}
