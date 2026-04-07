import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const window = new JSDOM('').window as any;
const purify = DOMPurify(window);

const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'sup', 'sub',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code', 'kbd', 'samp',
  'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'main',
  'details', 'summary',
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id',
  'target', 'rel', 'width', 'height', 'loading',
  'colspan', 'rowspan', 'scope', 'open',
];

export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR, FORCE_BODY: true });
}
