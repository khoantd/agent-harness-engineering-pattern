import type { Metadata } from 'next';
import { BookShell } from '@/components/BookShell';
import { getCatalog, getToc } from '@/lib/content';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Harness Patterns',
    template: '%s · Harness Patterns',
  },
  description:
    'Software design patterns mapped onto AI agent harness engineering, in plain English.',
  other: {
    'llms-txt': '/llms.txt',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const toc = getToc();
  const catalog = getCatalog();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,800&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
        <meta name="pattern-count" content={String(catalog.pattern_count)} />
      </head>
      <body>
        <BookShell toc={toc}>{children}</BookShell>
      </body>
    </html>
  );
}
