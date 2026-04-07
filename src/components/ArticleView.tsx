'use client';

import { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/common';
import type { ArticleData } from '@/lib/extractor';

export default function ArticleView({ article }: { article: ArticleData }) {
  const proseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prose = proseRef.current;
    if (!prose) return;

    // Query only blocks that haven't been highlighted yet.
    // hljs stamps data-highlighted="yes" on each block it processes,
    // so this selector is a fast no-op on re-renders where nothing changed.
    prose.querySelectorAll<HTMLElement>('pre code:not([data-highlighted])').forEach((block) => {
      hljs.highlightElement(block);

      // After highlightElement, hljs adds a "language-xxx" class — use it for the badge.
      const langClass = Array.from(block.classList).find((c) => c.startsWith('language-'));
      if (langClass) block.dataset.language = langClass.replace('language-', '');
    });
  }); // ← intentionally no dependency array: re-checks after every render so that
      //   if React ever resets dangerouslySetInnerHTML (e.g. on a theme/font change
      //   re-render cycle), the next paint immediately re-applies highlighting.

  return (
    <article className="mt-14 animate-fade-in">
      <header className="mb-10 pb-10" style={{ borderBottom: '1px solid var(--article-border)' }}>
        {article.siteName && (
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--site-badge)' }}
          >
            {article.siteName}
          </p>
        )}

        <h1
          className="text-3xl font-extrabold leading-tight tracking-tight md:text-[2.4rem]"
          style={{ color: 'var(--prose-heading)' }}
        >
          {article.title}
        </h1>

        <div
          className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
          style={{ color: 'var(--byline-color)' }}
        >
          {article.byline && <span>{article.byline}</span>}
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--prose-link)' }}
            className="hover:underline"
          >
            View original →
          </a>
        </div>

        {article.excerpt && (
          <p
            className="mt-5 text-lg leading-relaxed pl-4"
            style={{ color: 'var(--excerpt-color)', borderLeft: '2px solid var(--excerpt-border)' }}
          >
            {article.excerpt}
          </p>
        )}
      </header>

      <div
        ref={proseRef}
        className="article-prose"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
