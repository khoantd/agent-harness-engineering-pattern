import Link from 'next/link';
import type { Pattern } from '@/lib/schema';
import { highlightCode } from '@/lib/content';
import { Diagram } from './Diagram';

const fitLabel: Record<string, string> = {
  direct: 'Direct fit',
  adapted: 'Adapted fit',
  stretched: 'Stretched fit',
};

type Props = {
  pattern: Pattern;
  headingLevel?: 'h2' | 'h3';
  linkedTitle?: boolean;
};

export function PatternCard({
  pattern,
  headingLevel = 'h3',
  linkedTitle = false,
}: Props) {
  const Heading = headingLevel;
  const title = linkedTitle ? (
    <Link href={pattern.url}>{pattern.title}</Link>
  ) : (
    pattern.title
  );

  return (
    <article className="pat" id={pattern.id}>
      <header>
        <span className="num">{pattern.number}</span>
        <Heading>{title}</Heading>
        {pattern.aka ? <span className="aka">{pattern.aka}</span> : null}
        <div className="badges">
          <span
            className={`fit fit-${pattern.fit === 'stretched' ? 'stretch' : pattern.fit}`}
            title="How faithfully the harness use matches the classic pattern"
          >
            {fitLabel[pattern.fit] || pattern.fit}
          </span>
          {pattern.review_id ? (
            <Link className="rev" href={`/chapters/review/#${pattern.review_id}`}>
              Corrected in review
            </Link>
          ) : null}
        </div>
      </header>

      <p className="gist">{pattern.gist}</p>

      {pattern.diagram ? (
        <Diagram
          filename={pattern.diagram}
          figureNumber={pattern.figure_number}
          caption={pattern.figure_caption}
        />
      ) : null}

      {(pattern.analogy || pattern.classic) && (
        <div className="duo">
          {pattern.analogy ? (
            <aside className="analogy">
              <div className="lab">Everyday comparison</div>
              {pattern.analogyTitle ? <h4>{pattern.analogyTitle}</h4> : null}
              <p>{pattern.analogy}</p>
            </aside>
          ) : (
            <div />
          )}
          {pattern.classic ? (
            <div className="classic">
              <div className="lab">Classic meaning</div>
              <p>{pattern.classic}</p>
            </div>
          ) : null}
        </div>
      )}

      {pattern.harness ? (
        <>
          <div className="lab">In the agent system</div>
          <p className="harness">{pattern.harness}</p>
        </>
      ) : null}

      {pattern.enterprise ? (
        <div className="ent">
          <div className="lab">In a large company</div>
          <p>{pattern.enterprise}</p>
        </div>
      ) : null}

      {(pattern.steps.length > 0 || pattern.code) && (
        <div className="cols2">
          {pattern.steps.length > 0 ? (
            <div className="steps">
              <div className="lab">Step by step</div>
              <ol>
                {pattern.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          ) : (
            <div />
          )}
          {pattern.code ? (
            <div className="code">
              <div className="lab">Code sketch</div>
              <pre>
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(pattern.code),
                  }}
                />
              </pre>
            </div>
          ) : null}
        </div>
      )}

      {pattern.watch ? (
        <p className="watch">
          <span className="lab">Be careful</span>
          {pattern.watch}
        </p>
      ) : null}
    </article>
  );
}
