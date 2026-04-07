'use client';

import { useEffect, useRef, useState } from 'react';
import { THEMES, type ThemeId } from '@/lib/themes';

interface ThemePickerProps {
  active: ThemeId;
  onChange: (id: ThemeId) => void;
}

export default function ThemePicker({ active, onChange }: ThemePickerProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node) || buttonRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const activeTheme = THEMES.find((t) => t.id === active)!;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Select reading style"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--prose-text)' }}
      >
        <span className="flex items-center gap-0.5">
          {activeTheme.swatches.map((c, i) => (
            <span key={i} className="inline-block h-3 w-3 rounded-full border border-white/10" style={{ background: c }} />
          ))}
        </span>
        <span className="hidden sm:inline">{activeTheme.name}</span>
        <svg className={`h-3 w-3 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="listbox"
          aria-label="Reading styles"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl overflow-hidden"
          style={{ background: 'var(--page-bg2)', border: '1px solid var(--page-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--page-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--prose-muted)' }}>
              Select Reading Style
            </p>
          </div>
          <ul className="py-1.5">
            {THEMES.map((theme) => {
              const isActive = theme.id === active;
              return (
                <li key={theme.id} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => { onChange(theme.id as ThemeId); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{ color: isActive ? 'var(--prose-accent)' : 'var(--prose-text)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--prose-selection)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="flex shrink-0 items-center gap-1">
                      {theme.swatches.map((color, i) => (
                        <span key={i} className="inline-block rounded-sm border border-white/10"
                          style={{ background: color, width: i === 0 ? '22px' : '12px', height: '22px' }} />
                      ))}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-sm font-medium leading-tight">{theme.name}</span>
                      <span className="text-xs leading-tight mt-0.5" style={{ color: 'var(--prose-muted)' }}>{theme.description}</span>
                    </span>
                    {isActive && (
                      <svg className="ml-auto shrink-0 h-4 w-4" style={{ color: 'var(--prose-accent)' }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8l4 4 6-7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
