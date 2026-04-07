'use client';

import { useEffect, useState } from 'react';
import UrlInput from '@/components/UrlInput';
import ArticleView from '@/components/ArticleView';
import ThemePicker from '@/components/ThemePicker';
import FontPicker from '@/components/FontPicker';
import type { ArticleData } from '@/lib/extractor';
import { DEFAULT_THEME, type ThemeId } from '@/lib/themes';
import { FONTS, DEFAULT_FONT, type FontId } from '@/lib/fonts';

const THEME_KEY = 'refyn-theme';
const FONT_KEY  = 'refyn-font';

/** Dynamically inject a Google Fonts <link> only once per URL. */
function loadGoogleFont(url: string) {
  const id = `gfont-${btoa(url)}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id   = id;
  link.rel  = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

export default function Home() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [font,  setFont]  = useState<FontId>(DEFAULT_FONT);

  // Hydrate from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeId | null;
    const savedFont  = localStorage.getItem(FONT_KEY)  as FontId  | null;
    if (savedTheme) setTheme(savedTheme);
    if (savedFont)  {
      setFont(savedFont);
      const def = FONTS.find((f) => f.id === savedFont);
      if (def?.googleFontsUrl) loadGoogleFont(def.googleFontsUrl);
    }
  }, []);

  function handleThemeChange(id: ThemeId) {
    setTheme(id);
    localStorage.setItem(THEME_KEY, id);
  }

  function handleFontChange(id: FontId) {
    setFont(id);
    localStorage.setItem(FONT_KEY, id);
    const def = FONTS.find((f) => f.id === id);
    if (def?.googleFontsUrl) loadGoogleFont(def.googleFontsUrl);
  }

  async function handleSubmit(url: string) {
    setLoading(true);
    setError(null);
    setArticle(null);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? 'Failed to extract article.');
      setArticle(data as ArticleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const activeFont = FONTS.find((f) => f.id === font)!;

  return (
    <div
      data-theme={theme}
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: 'var(--page-bg)',
        color: 'var(--prose-text)',
        // Override --prose-font so the article inherits the user-selected typeface
        '--prose-font': activeFont.stack,
      } as React.CSSProperties}
    >

      <div className="pointer-events-none fixed inset-0 bg-noise opacity-[0.025]" aria-hidden />

      <div className="relative mx-auto max-w-[760px] px-6 py-14">
        <header className="mb-12">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{
                    background: 'color-mix(in srgb, var(--prose-accent) 15%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--prose-accent) 30%, transparent)',
                  }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="var(--prose-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--header-text)' }}>
                  Refyn
                </h1>
              </div>
              <p className="text-sm" style={{ color: 'var(--header-sub)' }}>
                Paste any article URL. Read it beautifully.
              </p>
            </div>
            <div className="shrink-0 mt-1 flex items-center gap-2">
              <FontPicker  active={font}  onChange={handleFontChange}  />
              <ThemePicker active={theme} onChange={handleThemeChange} />
            </div>
          </div>
        </header>

        <UrlInput onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="mt-6 rounded-xl px-5 py-4 text-sm"
            style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}>
            <strong className="font-semibold">Error: </strong>{error}
          </div>
        )}

        {loading && (
          <div className="mt-14 space-y-4 animate-pulse">
            <div className="h-8 w-3/4 rounded-lg" style={{ background: 'var(--skeleton-1)' }} />
            <div className="h-4 w-1/3 rounded-lg" style={{ background: 'var(--skeleton-2)' }} />
            <div className="mt-6 space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-4 rounded" style={{ background: 'var(--skeleton-2)', width: i % 3 === 2 ? '80%' : '100%' }} />
              ))}
            </div>
          </div>
        )}

        {article && <ArticleView article={article} />}

        {!article && !loading && !error && (
          <div className="mt-20 text-center text-sm" style={{ color: 'var(--prose-muted)' }}>
            Enter any article URL above to get started.
          </div>
        )}
      </div>
    </div>
  );
}
