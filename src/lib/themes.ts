export interface Theme {
  id: string;
  name: string;
  description: string;
  swatches: [string, string, string];
  dark: boolean;
}

export const THEMES: Theme[] = [
  { id: 'midnight', name: 'Midnight',    description: 'Dark, high-contrast editorial', swatches: ['#0a0a0f', '#e8e8ed', '#3b82f6'], dark: true  },
  { id: 'clean',    name: 'Clean Light', description: 'Minimal white canvas',          swatches: ['#ffffff', '#374151', '#2563eb'], dark: false },
  { id: 'sepia',    name: 'Sepia',       description: 'Warm paper reading mode',        swatches: ['#f8f1e3', '#4a3728', '#8b5523'], dark: false },
  { id: 'nord',     name: 'Nord',        description: 'Arctic blue calm',               swatches: ['#2e3440', '#d8dee9', '#88c0d0'], dark: true  },
  { id: 'terminal', name: 'Terminal',    description: 'Green on black, raw signal',     swatches: ['#0d0d0d', '#00ff41', '#00ff41'], dark: true  },
  { id: 'rose-pine',name: 'Rosé Pine',  description: 'Warm purple twilight',           swatches: ['#191724', '#e0def4', '#eb6f92'], dark: true  },
];

export type ThemeId = (typeof THEMES)[number]['id'];
export const DEFAULT_THEME: ThemeId = 'midnight';
