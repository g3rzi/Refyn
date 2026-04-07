import { NextRequest, NextResponse } from 'next/server';
import { extractArticle } from '@/lib/extractor';
import { sanitizeHtml } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  let url: string;
  try {
    const body = await request.json();
    url = body?.url;
  } catch {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Request body must be valid JSON with a "url" field.' } }, { status: 400 });
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: { code: 'INVALID_URL', message: 'A "url" string field is required.' } }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: { code: 'INVALID_URL', message: 'Only http and https URLs are supported.' } }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: { code: 'INVALID_URL', message: 'The provided URL is not valid.' } }, { status: 400 });
  }

  try {
    const article = await extractArticle(url);
    return NextResponse.json({ ...article, content: sanitizeHtml(article.content) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to extract article.';
    return NextResponse.json({ error: { code: 'EXTRACTION_FAILED', message } }, { status: 500 });
  }
}
