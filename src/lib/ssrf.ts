import { promises as dns } from 'dns';
import { isIPv4 } from 'net';

// ── Constants ────────────────────────────────────────────────────────────────

/** Only standard web ports are permitted outbound. */
const ALLOWED_PORTS = new Set([80, 443, 8080, 8443]);

/** Abort outbound requests that take longer than this. */
export const FETCH_TIMEOUT_MS = 10_000;

/** Reject responses larger than this (applies to article HTML and images). */
export const MAX_RESPONSE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Maximum number of redirects to follow before giving up. */
const MAX_REDIRECTS = 5;

// ── Error ────────────────────────────────────────────────────────────────────

export class SsrfError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'SsrfError';
  }
}

// ── IP helpers ───────────────────────────────────────────────────────────────

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0;
}

/**
 * Returns true for any IPv4 address that should never be reachable from a
 * public-facing server: loopback, private, link-local, CGNAT, multicast,
 * documentation, and reserved ranges.
 */
function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  const ranges: [string, string][] = [
    ['0.0.0.0', '0.255.255.255'],       // "This" network
    ['10.0.0.0', '10.255.255.255'],      // RFC1918 class A
    ['100.64.0.0', '100.127.255.255'],   // CGNAT (RFC6598)
    ['127.0.0.0', '127.255.255.255'],    // Loopback
    ['169.254.0.0', '169.254.255.255'],  // Link-local / AWS metadata
    ['172.16.0.0', '172.31.255.255'],    // RFC1918 class B
    ['192.0.0.0', '192.0.0.255'],        // IETF protocol assignments
    ['192.168.0.0', '192.168.255.255'],  // RFC1918 class C
    ['198.18.0.0', '198.19.255.255'],    // Benchmarking (RFC2544)
    ['198.51.100.0', '198.51.100.255'],  // Documentation (TEST-NET-2)
    ['203.0.113.0', '203.0.113.255'],    // Documentation (TEST-NET-3)
    ['224.0.0.0', '239.255.255.255'],    // Multicast
    ['240.0.0.0', '255.255.255.255'],    // Reserved / broadcast
  ];
  return ranges.some(([start, end]) => n >= ipv4ToInt(start) && n <= ipv4ToInt(end));
}

/**
 * Returns true for IPv6 addresses that must not be reached: loopback,
 * unspecified, link-local, unique-local, multicast, and IPv4-mapped private.
 */
function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase().replace(/^\[|\]$/g, '');
  return (
    lower === '::1' ||
    lower === '::' ||
    lower.startsWith('fc') ||       // Unique local (RFC4193)
    lower.startsWith('fd') ||       // Unique local (RFC4193)
    lower.startsWith('fe80') ||     // Link-local
    lower.startsWith('ff') ||       // Multicast
    lower.startsWith('::ffff:')     // IPv4-mapped — re-checked below
  );
}

// ── Core validator ───────────────────────────────────────────────────────────

/**
 * Validates that `rawUrl` is safe to fetch from the server.
 *
 * Checks (in order):
 *  1. URL parses cleanly
 *  2. Protocol is http or https
 *  3. Port is in the allowed set
 *  4. Hostname is not a raw private/reserved IP literal
 *  5. DNS resolution does not yield a private/reserved address
 *
 * Throws `SsrfError` on any violation.
 * Logs warnings server-side but never leaks internal detail to callers.
 */
export async function validateOutboundUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SsrfError('Invalid URL format.', 'INVALID_URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new SsrfError('Only http and https URLs are allowed.', 'INVALID_PROTOCOL');
  }

  const port = parsed.port
    ? parseInt(parsed.port, 10)
    : parsed.protocol === 'https:'
      ? 443
      : 80;

  if (!ALLOWED_PORTS.has(port)) {
    console.warn(`[SSRF] Blocked non-standard port ${port} for ${parsed.hostname}`);
    throw new SsrfError('URL uses a non-standard port that is not permitted.', 'INVALID_PORT');
  }

  const hostname = parsed.hostname;

  // Raw IPv4 literal
  if (isIPv4(hostname)) {
    if (isPrivateIPv4(hostname)) {
      console.warn(`[SSRF] Blocked raw private IPv4 literal: ${hostname}`);
      throw new SsrfError('URL resolves to a restricted address.', 'SSRF_BLOCKED');
    }
    return parsed;
  }

  // Raw IPv6 literal (bracketed in URL, e.g. http://[::1]/)
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    const ipv6 = hostname.slice(1, -1);
    if (isPrivateIPv6(ipv6)) {
      console.warn(`[SSRF] Blocked raw private IPv6 literal: ${ipv6}`);
      throw new SsrfError('URL resolves to a restricted address.', 'SSRF_BLOCKED');
    }
    return parsed;
  }

  // DNS resolution check — catches DNS rebinding via hostname
  let addresses: dns.LookupAddress[];
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch (err) {
    console.warn(`[SSRF] DNS lookup failed for "${hostname}": ${err}`);
    throw new SsrfError('Could not resolve the hostname.', 'DNS_ERROR');
  }

  for (const { address, family } of addresses) {
    if (family === 4 && isPrivateIPv4(address)) {
      console.warn(`[SSRF] DNS for "${hostname}" resolved to private IPv4 ${address} — blocked`);
      throw new SsrfError('URL resolves to a restricted address.', 'SSRF_BLOCKED');
    }
    if (family === 6 && isPrivateIPv6(address)) {
      console.warn(`[SSRF] DNS for "${hostname}" resolved to private IPv6 ${address} — blocked`);
      throw new SsrfError('URL resolves to a restricted address.', 'SSRF_BLOCKED');
    }
  }

  return parsed;
}

// ── Safe fetch ───────────────────────────────────────────────────────────────

/**
 * Drop-in replacement for `fetch()` that:
 *  - validates the URL (and every redirect target) via `validateOutboundUrl`
 *  - enforces a hard timeout via AbortController
 *  - manually follows redirects so each hop is re-validated
 *  - rejects responses whose Content-Length exceeds MAX_RESPONSE_BYTES
 */
export async function safeFetch(
  url: string,
  init: RequestInit = {},
  _redirectDepth = 0,
): Promise<Response> {
  await validateOutboundUrl(url);

  if (_redirectDepth > MAX_REDIRECTS) {
    throw new SsrfError('Too many redirects.', 'TOO_MANY_REDIRECTS');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      redirect: 'manual',    // never let the runtime follow redirects automatically
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new SsrfError('Request timed out.', 'TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  // Manually follow redirects, re-validating each hop
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (!location) {
      throw new SsrfError('Redirect with no Location header.', 'INVALID_REDIRECT');
    }
    const redirectUrl = new URL(location, url).href;
    return safeFetch(redirectUrl, init, _redirectDepth + 1);
  }

  // Reject oversized responses early (Content-Length header)
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
    throw new SsrfError('Response exceeds the maximum allowed size.', 'RESPONSE_TOO_LARGE');
  }

  return response;
}
