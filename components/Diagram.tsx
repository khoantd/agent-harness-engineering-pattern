import { readDiagramSvg } from '@/lib/content';

type Props = {
  filename: string;
  figureNumber?: string;
  caption?: string;
  className?: string;
};

export function Diagram({ filename, figureNumber, caption, className }: Props) {
  const svg = readDiagramSvg(filename);
  if (!svg) return null;

  // Inject book diagram class if missing
  const markup = svg.includes('class="dg"')
    ? svg
    : svg.replace('<svg', '<svg class="dg"');

  return (
    <figure className={className ? `fig ${className}` : 'fig'}>
      <div
        className="dgwrap"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      {(figureNumber || caption) && (
        <figcaption>
          {figureNumber ? <span className="fn">{figureNumber}</span> : null}
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
