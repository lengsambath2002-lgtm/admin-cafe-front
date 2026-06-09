/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { LANGUAGES, useT } from '../lib/i18n';

// Compact EN / ខ្មែរ toggle. Persists the choice (handled in the provider).
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useT();
  return (
    <div className={`flex items-center bg-surface-container p-0.5 rounded-full border border-outline-variant/40 ${className}`}>
      {LANGUAGES.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => setLang(l.id)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
            lang === l.id ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
