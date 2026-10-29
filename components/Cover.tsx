import { Diagram } from './Diagram';
import type { getFrontMatter } from '@/lib/content';

type Front = ReturnType<typeof getFrontMatter>;

export function Cover({ front }: { front: Front }) {
  return (
    <section className="cover front">
      <div className="eyebrow">{front.eyebrow}</div>
      <h1>
        Harness <em>Patterns</em>
      </h1>
      <p className="lede">{front.lede}</p>
      <div className="stats">
        {front.stats.map((s) => (
          <span key={s.label}>
            <b>{s.value}</b>
            {s.label}
          </span>
        ))}
      </div>

      {front.sections
        .filter((sec) => sec.heading !== 'How each entry works')
        .map((sec, i) => (
          <div key={sec.heading}>
            <h2>{sec.heading}</h2>
            {sec.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            {i === 1 && front.diagrams[0] ? (
              <Diagram
                filename={front.diagrams[0].diagram}
                figureNumber={front.diagrams[0].figure_number}
                caption={front.diagrams[0].figure_caption}
              />
            ) : null}
            {i === 2 && front.diagrams[1] ? (
              <Diagram
                filename={front.diagrams[1].diagram}
                figureNumber={front.diagrams[1].figure_number}
                caption={front.diagrams[1].figure_caption}
              />
            ) : null}
          </div>
        ))}

      <h2>How each entry works</h2>
      <div className="howto">
        {front.howto.map((h) => (
          <div key={h.title}>
            <b>{h.title}</b>
            {h.body}
          </div>
        ))}
      </div>
    </section>
  );
}
