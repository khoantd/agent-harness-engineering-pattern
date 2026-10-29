'use client';

import { useEffect } from 'react';

/** Marks the matching TOC link as .on for the current pattern page. */
export function ActiveTocHighlight({ patternId }: { patternId: string }) {
  useEffect(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>('#toc a[href]');
    links.forEach((a) => a.classList.remove('on'));
    const match = document.querySelector<HTMLAnchorElement>(
      `#toc a[href="/patterns/${patternId}/"]`,
    );
    match?.classList.add('on');
    match?.scrollIntoView({ block: 'nearest' });
  }, [patternId]);
  return null;
}
