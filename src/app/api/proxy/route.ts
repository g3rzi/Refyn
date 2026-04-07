import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const imageUrl = new URL(request.url).searchParams.get('url');
  if (!imageUrl) return new Response('Missing url parameter.', { status: 400 });

  try {
    const parsed = new URL(imageUrl);
    if (!['http:', 'https:'].includes(parsed.protocol))
      return new Response('Invalid URL protocol.', { status: 400 });
  } catch {
    return new Response('Invalid URL.', { status: 400 });
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Refyn/1.0)',
        Accept: 'image/*,*/*;q=0.8',
      },
      next: { revalidate: 86400 },
    });
    if (!upstream.ok) return new Response('Failed to fetch image.', { status: upstream.status });

    const contentType = (upstream.headers.get('content-type') ?? 'image/jpeg').split(';')[0].trim();
    if (!contentType.startsWith('image/')) return new Response('Not an image.', { status: 400 });

    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return new Response('Failed to proxy image.', { status: 502 });
  }
}
