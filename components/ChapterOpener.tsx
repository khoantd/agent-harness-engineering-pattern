import Link from 'next/link';
import type { ChapterMeta } from '@/lib/schema';

export function ChapterOpener({
  chapter,
  patternTitles,
}: {
  chapter: ChapterMeta;
  patternTitles: { id: string; title: string }[];
}) {
  return (
    <div className="opener">
      <div className="chn">{chapter.number}</div>
      <div>
        <div className="kick">{chapter.kick}</div>
        <h2>{chapter.title}</h2>
        <p>{chapter.summary}</p>
        {patternTitles.length > 0 ? (
          <nav className="chips" aria-label="Patterns in this chapter">
            {patternTitles.map((p) => (
              <Link key={p.id} className="chip" href={`/patterns/${p.id}/`}>
                {p.title}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
