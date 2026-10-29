import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChapterOpener } from '@/components/ChapterOpener';
import { PatternCard } from '@/components/PatternCard';
import {
  getChapter,
  getChapterHtml,
  getChapterIds,
  getPatternsForChapter,
} from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getChapterIds().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) return {};
  return {
    title: `${chapter.number} ${chapter.title}`,
    description: chapter.summary,
  };
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const patterns = getPatternsForChapter(slug);
  const appendixHtml = getChapterHtml(slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: chapter.title,
    description: chapter.summary,
    hasPart: patterns.map((p) => ({
      '@type': 'TechArticle',
      name: p.title,
      url: p.url,
      abstract: p.gist,
    })),
  };

  return (
    <section className="chapter" id={chapter.section_id}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChapterOpener
        chapter={chapter}
        patternTitles={patterns.map((p) => ({ id: p.id, title: p.title }))}
      />

      {appendixHtml ? (
        <div
          className="appendix"
          dangerouslySetInnerHTML={{ __html: appendixHtml }}
        />
      ) : (
        patterns.map((p) => (
          <PatternCard key={p.id} pattern={p} linkedTitle />
        ))
      )}
    </section>
  );
}
