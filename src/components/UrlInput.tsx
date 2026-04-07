'use client';

import { useState, FormEvent } from 'react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export default function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/article..."
        required
        disabled={loading}
        className="flex-1 rounded-xl px-4 py-3 text-base outline-none transition-colors disabled:opacity-50"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--prose-accent)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--input-border)')}
      />
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="rounded-xl px-6 py-3 font-semibold text-base whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
        style={{ background: 'var(--btn-bg)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--btn-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--btn-bg)')}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />
            Loading…
          </span>
        ) : 'Refyn it'}
      </button>
    </form>
  );
}
