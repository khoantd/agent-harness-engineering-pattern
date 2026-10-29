import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActiveTocHighlight } from '@/components/ActiveTocHighlight';
import { PatternCard } from '@/components/PatternCard';
import {
  getChapter,
  getPattern,
  getPatternIds,
} from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPatternIds().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) return {};
  return {
    title: `${pattern.number} ${pattern.title}`,
    description: pattern.gist,
    openGraph: {
      title: `${pattern.number} ${pattern.title} · Harness Patterns`,
      description: pattern.gist,
      type: 'article',
    },
  };
}

export default async function PatternPage({ params }: Props) {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) notFound();

  const chapter = getChapter(pattern.chapter);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: pattern.title,
    alternativeHeadline: pattern.number,
    description: pattern.gist,
    articleSection: chapter?.title,
    keywords: [
      pattern.title,
      pattern.chapter,
      'agent harness',
      'design pattern',
      pattern.fit,
    ],
    isPartOf: {
      '@type': 'Book',
      name: 'Harness Patterns',
    },
  };

  return (
    <section className="chapter">
      <ActiveTocHighlight patternId={pattern.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {chapter ? (
        <p className="kick" style={{ marginBottom: 8 }}>
          <Link href={`/chapters/${chapter.id}/`}>
            Chapter {chapter.number} · {chapter.title}
          </Link>
          {' · '}
          <a href="/catalog.json">catalog</a>
          {' · '}
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
            source: content/patterns/{pattern.id}.md
          </span>
        </p>
      ) : null}

      <PatternCard pattern={pattern} headingLevel="h2" />

      <p className="end">
        {chapter ? (
          <>
            Back to{' '}
            <Link href={`/chapters/${chapter.id}/`}>{chapter.title}</Link>
            {' · '}
          </>
        ) : null}
        <Link href="/">All chapters</Link>
        {' · '}
        <Link href="/llms.txt">llms.txt</Link>
      </p>
    </section>
  );
}
