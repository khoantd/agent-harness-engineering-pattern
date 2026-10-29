import Link from 'next/link';
import { Cover } from '@/components/Cover';
import { getCatalog, getFrontMatter, getToc } from '@/lib/content';

export default function HomePage() {
  const front = getFrontMatter();
  const catalog = getCatalog();
  const toc = getToc().filter(
    (c) => c.id !== 'review' && c.id !== 'glossary',
  );

  return (
    <>
      <Cover front={front} />

      <section className="chapter" aria-label="Chapter index">
        <div className="opener">
          <div className="chn">∞</div>
          <div>
            <div className="kick">Browse the field manual</div>
            <h2>All chapters</h2>
            <p>
              {catalog.pattern_count} patterns across {catalog.chapter_count}{' '}
              chapters. Agents: prefer{' '}
              <Link href="/llms.txt">llms.txt</Link>,{' '}
              <Link href="/catalog.json">catalog.json</Link>, or the Markdown
              files under <code>content/patterns/</code>.
            </p>
          </div>
        </div>
        <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 40px' }}>
          {toc.map((ch) => (
            <li key={ch.id} style={{ marginBottom: 12 }}>
              <Link
                href={`/chapters/${ch.id}/`}
                style={{
                  display: 'flex',
                  gap: 12,
                  textDecoration: 'none',
                  fontFamily: 'var(--display)',
                  fontWeight: 600,
                  fontSize: 18,
                }}
              >
                <span className="tn" style={{ color: 'var(--rope-ink)' }}>
                  {ch.number}
                </span>
                {ch.title}
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: 'var(--muted)',
                    fontWeight: 500,
                  }}
                >
                  {ch.patterns.length} patterns
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="end">
          Appendices:{' '}
          <Link href="/chapters/review/">Enterprise review</Link>
          {' · '}
          <Link href="/chapters/glossary/">Glossary</Link>
        </p>
      </section>
    </>
  );
}
