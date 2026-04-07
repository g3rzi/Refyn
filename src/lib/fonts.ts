export interface Font {
  id: string;
  name: string;
  /** CSS font-family value applied to the article */
  stack: string;
  /** Google Fonts stylesheet URL — undefined for system fonts */
  googleFontsUrl?: string;
  category: 'sans' | 'serif' | 'mono';
  /** Short text shown in the picker to preview the typeface */
  preview: string;
}

export const FONTS: Font[] = [
  // ── Sans-serif ──────────────────────────────────────────
  {
    id: 'system',
    name: 'System UI',
    stack: 'ui-sans-serif, system-ui, sans-serif, "Segoe UI", "Apple Color Emoji"',
    category: 'sans',
    preview: 'Clean & neutral',
  },
  {
    id: 'inter',
    name: 'Inter',
    stack: "'Inter', ui-sans-serif, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    category: 'sans',
    preview: 'Modern & readable',
  },
  {
    id: 'source-sans',
    name: 'Source Sans 3',
    stack: "'Source Sans 3', ui-sans-serif, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap',
    category: 'sans',
    preview: 'Open & airy',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    stack: "'Roboto', ui-sans-serif, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap',
    category: 'sans',
    preview: 'Familiar & solid',
  },
  {
    id: 'nunito',
    name: 'Nunito',
    stack: "'Nunito', ui-sans-serif, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap',
    category: 'sans',
    preview: 'Rounded & friendly',
  },
  {
    id: 'ibm-plex',
    name: 'IBM Plex Sans',
    stack: "'IBM Plex Sans', ui-sans-serif, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap',
    category: 'sans',
    preview: 'Technical & precise',
  },
  // ── Serif ─────────────────────────────────────────────────
  {
    id: 'georgia',
    name: 'Georgia',
    stack: 'Georgia, serif',
    category: 'serif',
    preview: 'Classic & trustworthy',
  },
  {
    id: 'lora',
    name: 'Lora',
    stack: "'Lora', Georgia, serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap',
    category: 'serif',
    preview: 'Elegant long-form',
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    stack: "'Merriweather', Georgia, serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap',
    category: 'serif',
    preview: 'Deep & comfortable',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    stack: "'Playfair Display', Georgia, serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap',
    category: 'serif',
    preview: 'Editorial & dramatic',
  },
  {
    id: 'crimson',
    name: 'Crimson Pro',
    stack: "'Crimson Pro', Georgia, serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap',
    category: 'serif',
    preview: 'Literary & warm',
  },
  // ── Monospace ─────────────────────────────────────────────
  {
    id: 'mono',
    name: 'Monospace',
    stack: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', ui-monospace, monospace",
    category: 'mono',
    preview: 'Raw & technical',
  },
];

export type FontId = (typeof FONTS)[number]['id'];
export const DEFAULT_FONT: FontId = 'system';
