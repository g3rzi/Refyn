'use client';

import { useEffect, useRef, useState } from 'react';
import { FONTS, type FontId } from '@/lib/fonts';

interface FontPickerProps {
  active: FontId;
  onChange: (id: FontId) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  sans:  'Sans-serif',
  serif: 'Serif',
  mono:  'Monospace',
};

export default function FontPicker({ active, onChange }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const panelRef  = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const activeFont = FONTS.find((f) => f.id === active)!;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node) || buttonRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Group fonts by category preserving definition order
  const categories = ['sans', 'serif', 'mono'] as const;
  const grouped = categories.map((cat) => ({
    cat,
    fonts: FONTS.filter((f) => f.category === cat),
  }));

  return (
    <div className="relative">
      {/* Trigger button — "Aa" rendered in the active font */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Select reading font"
        aria-expanded={open}
        title="Select reading font"
        className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
        style={{
          background: 'var(--input-bg)',
          border: '1px solid var(--input-border)',
          color: 'var(--prose-text)',
          fontFamily: activeFont.stack,
        }}
      >
        <span className="text-base font-semibold leading-none" style={{ fontFamily: activeFont.stack }}>
          Aa
        </span>
        <span className="hidden sm:inline text-xs" style={{ fontFamily: 'var(--prose-font)' }}>
          {activeFont.name}
        </span>
        <svg
          className={`h-3 w-3 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          role="listbox"
          aria-label="Reading fonts"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl overflow-hidden"
          style={{
            background: 'var(--page-bg2)',
            border: '1px solid var(--page-border)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}
        >
          {/* Panel header */}
          <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--page-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--prose-muted)' }}>
              Select Reading Font
            </p>
          </div>

          {/* Grouped font list */}
          <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
            {grouped.map(({ cat, fonts }) => (
              <div key={cat}>
                {/* Category divider */}
                <div
                  className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--prose-muted)' }}
                >
                  {CATEGORY_LABELS[cat]}
                </div>

                <ul>
                  {fonts.map((font) => {
                    const isActive = font.id === active;
                    return (
                      <li key={font.id} role="option" aria-selected={isActive}>
                        <button
                          onClick={() => { onChange(font.id); setOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                          style={{ color: isActive ? 'var(--prose-accent)' : 'var(--prose-text)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--prose-selection)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* "Aa" preview in the font itself */}
                          <span
                            className="shrink-0 w-10 text-xl font-semibold leading-none"
                            style={{
                              fontFamily: font.stack,
                              color: isActive ? 'var(--prose-accent)' : 'var(--prose-heading)',
                            }}
                          >
                            Aa
                          </span>

                          {/* Name + description */}
                          <span className="flex flex-col min-w-0">
                            <span
                              className="text-sm font-medium leading-tight"
                              style={{ fontFamily: font.stack }}
                            >
                              {font.name}
                            </span>
                            <span className="text-xs leading-tight mt-0.5" style={{ color: 'var(--prose-muted)' }}>
                              {font.preview}
                            </span>
                          </span>

                          {/* Active checkmark */}
                          {isActive && (
                            <svg
                              className="ml-auto shrink-0 h-4 w-4"
                              style={{ color: 'var(--prose-accent)' }}
                              viewBox="0 0 16 16" fill="none" stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                              <path d="M3 8l4 4 6-7" />
                            </svg>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
