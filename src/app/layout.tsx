import type { Metadata, Viewport } from 'next';
import './globals.css';
import 'highlight.js/styles/tokyo-night-dark.css';

export const metadata: Metadata = {
  title: 'Refyn — Read Any Article Beautifully',
  description: 'Paste any article URL and read it in a clean, distraction-free style.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
