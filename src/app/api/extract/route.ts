import { NextRequest, NextResponse } from 'next/server';
import { extractArticle } from '@/lib/extractor';
import { sanitizeHtml } from '@/lib/sanitize';
import { validateOutboundUrl, SsrfError } from '@/lib/ssrf';

export async function POST(request: NextRequest) {
  let url: string;
  try {
    const body = await request.json();
    url = body?.url;
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Request body must be valid JSON with a "url" field.' } },
      { status: 400 },
    );
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json(
      { error: { code: 'INVALID_URL', message: 'A "url" string field is required.' } },
      { status: 400 },
    );
  }

  try {
    await validateOutboundUrl(url);
  } catch (err) {
    if (err instanceof SsrfError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: { code: 'INVALID_URL', message: 'The provided URL is not valid.' } },
      { status: 400 },
    );
  }

  try {
    const article = await extractArticle(url);
    return NextResponse.json({ ...article, content: sanitizeHtml(article.content) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to extract article.';
    return NextResponse.json({ error: { code: 'EXTRACTION_FAILED', message } }, { status: 500 });
  }
}
