# Refyn

Refyn is a web app that takes any article URL, extracts its content, and re-renders it with a clean, modern reading experience. It strips away cluttered layouts, ads, and distracting page furniture — giving you the article as it should read.

## Features

- **Article extraction** — paste any URL and Refyn fetches + parses the content server-side using Mozilla Readability
- **6 reading themes** — Midnight, Clean Light, Sepia, Nord, Terminal, and Rosé Pine, all switchable live
- **12 font choices** — system fonts, Inter, Merriweather, JetBrains Mono, and more, with Google Fonts loaded on demand
- **Syntax highlighting** — code blocks are highlighted with tokyo-night-dark via highlight.js; inline code is styled with an accent-tinted background
- **Image proxying** — images are fetched server-side to avoid CORS and hotlinking restrictions
- **Inline code detection** — span elements styled as monospace (e.g. from Wiz or CyberArk blogs) are normalised to `<code>` tags before parsing

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Extraction | @mozilla/readability + jsdom |
| Sanitisation | DOMPurify |
| Highlighting | highlight.js |

## Getting started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker

```bash
# Build the image
docker build -t refyn .

# Run the container
docker run -p 3000:3000 refyn
```

Then open [http://localhost:3000](http://localhost:3000).

## Usage

1. Paste an article URL into the input field and press **Refyn**
2. Use the palette button (top-right) to switch themes
3. Use the **Aa** button to change the reading font
4. The chosen theme and font are saved in `localStorage` and restored on your next visit

## Project structure

```
Refyn/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── extract/route.ts   # POST /api/extract — fetches and parses an article URL
│   │   │   └── proxy/route.ts     # GET  /api/proxy   — proxies remote images
│   │   ├── globals.css            # Tailwind base + theme variables + prose styles
│   │   ├── layout.tsx             # Root layout (highlight.js CSS import)
│   │   └── page.tsx               # Main page — state, theme/font wiring
│   ├── components/
│   │   ├── ArticleView.tsx        # Renders sanitised article HTML; runs hljs
│   │   ├── FontPicker.tsx         # Font selection dropdown
│   │   ├── ThemePicker.tsx        # Theme selection dropdown
│   │   └── UrlInput.tsx           # URL input form
│   └── lib/
│       ├── extractor.ts           # Fetch + Readability parse + image URL rewriting
│       ├── fonts.ts               # Font definitions (id, name, stack, Google Fonts URL)
│       ├── sanitize.ts            # DOMPurify wrapper (server-side, jsdom window)
│       └── themes.ts              # Theme definitions (id, name, swatches, CSS vars)
├── next.config.js
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```
