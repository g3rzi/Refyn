import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface ArticleData {
  title: string;
  byline: string | null;
  siteName: string | null;
  excerpt: string | null;
  content: string;
  originalUrl: string;
}

export async function extractArticle(url: string): Promise<ArticleData> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url });

  // Must run BEFORE Readability — Readability strips class attributes, so
  // <span class="cyb-inline-code-labs"> becomes a bare <span> after parsing.
  normalizeCodeSpans(dom.window.document);

  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error('Could not extract article content. The page may not contain a readable article.');
  }

  const content = rewriteImageUrls(article.content, url);

  return {
    title: article.title,
    byline: article.byline ?? null,
    siteName: article.siteName ?? null,
    excerpt: article.excerpt ?? null,
    content,
    originalUrl: url,
  };
}

function rewriteImageUrls(html: string, baseUrl: string): string {
  return html.replace(/(<img[^>]*?\s)src=(["'])([^"']*)\2/gi, (_match, prefix, quote, src) => {
    try {
      const absoluteUrl = new URL(src, baseUrl).href;
      return `${prefix}src=${quote}/api/proxy?url=${encodeURIComponent(absoluteUrl)}${quote}`;
    } catch {
      return _match;
    }
  });
}

const CODE_CLASS_RE =
  /\b(inline[\-_]?code|code[\-_]?inline|code[\-_]?snippet|code[\-_]?block|code[\-_]?sample|mono[\-_]?space|monospace|codespan|codeinline|code\b|kbd|shell[\-_]?cmd|terminal[\-_]?cmd|command[\-_]?line|cli[\-_]?arg|cli[\-_]?flag)\b/i;

const MONO_FONT_RE =
  /font-family\s*:[^;]*(monospace|courier|consolas|fira\s*code|jetbrains\s*mono|roboto\s*mono|source\s*code\s*pro|inconsolata|cascadia|droid\s*sans\s*mono|hack\b|ibm\s*plex\s*mono|space\s*mono|ubuntu\s*mono|lucida\s*console|andale\s*mono)/i;

function normalizeCodeSpans(document: Document): void {
  document.querySelectorAll('span').forEach((span) => {
    if (span.closest('pre, code')) return;
    const cls = (span.className || '').replace(/_/g, '-');
    const style = span.getAttribute('style') ?? '';
    if (CODE_CLASS_RE.test(cls) || MONO_FONT_RE.test(style)) {
      const code = document.createElement('code');
      while (span.firstChild) code.appendChild(span.firstChild);
      span.replaceWith(code);
    }
  });
}
