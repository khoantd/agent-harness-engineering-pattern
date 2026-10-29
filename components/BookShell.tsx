'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TocChapter } from '@/lib/schema';

function Brand() {
  return (
    <Link className="brand" href="/">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle
          cx="11"
          cy="11"
          r="8.5"
          fill="none"
          stroke="var(--rope)"
          strokeWidth="2.4"
        />
        <path
          d="M11 2.5v17M4 7h14M4 15h14"
          stroke="var(--ink)"
          strokeWidth="1.6"
          fill="none"
        />
      </svg>
      <span>Harness Patterns</span>
    </Link>
  );
}

export function BookShell({
  toc,
  activePatternId,
  children,
}: {
  toc: TocChapter[];
  activePatternId?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const firstHitRef = useRef<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        if (window.matchMedia('(max-width:980px)').matches) setOpen(true);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => {
    const v = query.trim().toLowerCase();
    firstHitRef.current = null;
    return toc.map((ch) => {
      const patterns = ch.patterns.filter((p) => {
        if (!v) return true;
        return `${p.title} ${p.search_name} ${p.number}`
          .toLowerCase()
          .includes(v);
      });
      if (patterns.length && !firstHitRef.current) {
        firstHitRef.current = patterns[0].id;
      }
      return { ...ch, patterns, hide: Boolean(v) && patterns.length === 0 };
    });
  }, [toc, query]);

  const noMatches = Boolean(query.trim()) && filtered.every((c) => c.hide);

  return (
    <>
      <header className="bar">
        <div className="bar-in">
          <button
            className="menu-btn"
            type="button"
            aria-expanded={open}
            aria-controls="rail"
            onClick={() => setOpen((o) => !o)}
          >
            Contents
          </button>
          <Brand />
          <div className="sp" />
          <div className="search">
            <input
              ref={inputRef}
              id="q"
              type="search"
              placeholder="Find a pattern"
              aria-label="Find a pattern"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setQuery('');
                  e.currentTarget.blur();
                }
                if (e.key === 'Enter' && firstHitRef.current) {
                  window.location.href = `/patterns/${firstHitRef.current}/`;
                  setOpen(false);
                }
              }}
            />
            <kbd>/</kbd>
          </div>
        </div>
      </header>

      <div className="shell" id="top">
        <nav
          className={open ? 'rail open' : 'rail'}
          id="rail"
          aria-label="Contents"
        >
          <ol id="toc">
            {filtered.map((ch) => (
              <li key={ch.id} className={ch.hide ? 'tch hide' : 'tch'}>
                <Link
                  className="tct"
                  href={`/chapters/${ch.id}/`}
                  onClick={() => setOpen(false)}
                >
                  <span className="tn">{ch.number}</span>
                  {ch.title}
                </Link>
                {ch.patterns.length > 0 ? (
                  <ol>
                    {ch.patterns.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/patterns/${p.id}/`}
                          className={
                            activePatternId === p.id ? 'on' : undefined
                          }
                          data-name={p.search_name}
                          onClick={() => setOpen(false)}
                        >
                          <span className="tn">{p.number}</span>
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </li>
            ))}
          </ol>
          {noMatches ? <div className="none">No pattern matches.</div> : null}
        </nav>

        <main>
          <div className="col">{children}</div>
        </main>
      </div>
    </>
  );
}
