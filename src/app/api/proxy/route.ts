import { NextRequest } from 'next/server';
import { safeFetch, SsrfError, MAX_RESPONSE_BYTES } from '@/lib/ssrf';

export async function GET(request: NextRequest) {
  const imageUrl = new URL(request.url).searchParams.get('url');
  if (!imageUrl) return new Response('Missing url parameter.', { status: 400 });

  let upstream: Response;
  try {
    upstream = await safeFetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Refyn/1.0)',
        Accept: 'image/*,*/*;q=0.8',
      },
      next: { revalidate: 86400 },
    });
  } catch (err) {
    if (err instanceof SsrfError) {
      return new Response(err.message, { status: 400 });
    }
    return new Response('Failed to proxy image.', { status: 502 });
  }

  if (!upstream.ok) return new Response('Failed to fetch image.', { status: upstream.status });

  const contentType = (upstream.headers.get('content-type') ?? 'image/jpeg').split(';')[0].trim();
  if (!contentType.startsWith('image/')) return new Response('Not an image.', { status: 400 });

  // Stream-read and enforce size cap even when Content-Length header is absent
  const reader = upstream.body?.getReader();
  if (!reader) return new Response('Empty image response.', { status: 502 });

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        return new Response('Image exceeds the maximum allowed size.', { status: 400 });
      }
      chunks.push(value);
    }
  } catch {
    return new Response('Failed to proxy image.', { status: 502 });
  }

  const buffer = chunks.reduce((acc, chunk) => {
    const merged = new Uint8Array(acc.byteLength + chunk.byteLength);
    merged.set(acc);
    merged.set(chunk, acc.byteLength);
    return merged;
  }, new Uint8Array(0));

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
