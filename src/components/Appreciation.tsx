'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/hooks';
import { appreciation, contact } from '@/content/profile';

/**
 * The heart at the bottom of the personal file.
 *
 * Honest about what it is: this page is a static export with no server behind
 * it, so the tally lives in the visitor's own browser and the seed is a
 * starting number rather than a measurement. A note is not silently swallowed
 * either — it is handed to the visitor's mail app so it actually arrives.
 * Swap both for a real endpoint and this component barely changes.
 */
export function Appreciation() {
  const [tapped, setTapped] = usePersistentState<boolean>('asher.appreciated', false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [line, setLine] = useState('');

  const count = appreciation.seed + (tapped ? 1 : 0);
  const mailto = contact.find((c) => c.href.startsWith('mailto:'))?.href ?? '';

  const send = () => {
    if (!mailto || !line.trim()) return;
    const who = name.trim() || 'someone';
    const url =
      mailto +
      '?subject=' +
      encodeURIComponent(`A line from ${who}`) +
      '&body=' +
      encodeURIComponent(`${line.trim()}\n\n— ${who}`);
    window.location.href = url;
  };

  return (
    <section
      className="mt-2 px-5 py-6 text-center"
      style={{
        border: '1px solid color-mix(in oklab, var(--color-signal) 26%, transparent)',
        background: 'color-mix(in oklab, var(--color-signal) 4%, transparent)',
      }}
    >
      <button
        type="button"
        onClick={() => setTapped(true)}
        disabled={tapped}
        aria-label={tapped ? 'Already appreciated' : 'Appreciate this'}
        aria-pressed={tapped}
        className="group relative mx-auto grid h-14 w-14 place-items-center transition-transform duration-300 hover:scale-110 disabled:cursor-default disabled:hover:scale-100"
      >
        {!tapped && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid color-mix(in oklab, var(--color-signal) 45%, transparent)',
              animation: 'pulse-ring 2.6s var(--ease-out-expo) infinite',
            }}
          />
        )}
        <svg width="30" height="27" viewBox="0 0 30 27" aria-hidden>
          <path
            d="M15 25.5 3.6 14.3a6.6 6.6 0 1 1 9.3-9.4L15 7l2.1-2.1a6.6 6.6 0 1 1 9.3 9.4L15 25.5Z"
            fill={tapped ? 'var(--color-signal)' : 'none'}
            stroke="var(--color-signal)"
            strokeWidth="1.6"
            style={{ transition: 'fill 400ms var(--ease-out-expo)' }}
          />
        </svg>
      </button>

      <p className="hud-sm mt-4">
        <span
          className="tabular-nums"
          style={{ color: 'var(--color-signal)', fontSize: '1.05rem', letterSpacing: '0.12em' }}
        >
          {count}
        </span>
        <span className="ml-2">{tapped ? 'including you' : 'people appreciated this'}</span>
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hud-sm mt-5 px-4 py-2.5 transition-colors hover:text-[var(--color-signal)]"
          style={{ border: '1px solid var(--hud-line)' }}
        >
          {appreciation.prompt} →
        </button>
      ) : (
        <div className="mt-5 space-y-2.5 text-left">
          <Field
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Optional"
            autoFocus
          />
          <Field
            label="One line"
            value={line}
            onChange={setLine}
            placeholder="Say something short."
          />
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={send}
              disabled={!line.trim()}
              className="hud-sm px-4 py-2.5 transition-all disabled:opacity-35"
              style={{
                border: '1px solid color-mix(in oklab, var(--color-signal) 50%, transparent)',
                color: 'var(--color-signal)',
                background: 'color-mix(in oklab, var(--color-signal) 8%, transparent)',
              }}
            >
              Send →
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="hud-sm px-3 py-2.5 transition-colors hover:text-[var(--color-bone)]"
            >
              Cancel
            </button>
          </div>
          <p className="hud-sm pt-1" style={{ color: 'var(--color-steel-500)' }}>
            {appreciation.hint}
          </p>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="hud-sm mb-1.5 block">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={label === 'Name' ? 40 : 140}
        className="w-full bg-transparent px-3 py-2.5 outline-none transition-colors focus:border-[color-mix(in_oklab,var(--color-signal)_55%,transparent)]"
        style={{
          border: '1px solid var(--hud-line)',
          fontFamily: 'var(--font-mono)',
          // 16px stops iOS zooming the whole page on focus.
          fontSize: '16px',
          color: 'var(--color-hot)',
        }}
      />
    </label>
  );
}
