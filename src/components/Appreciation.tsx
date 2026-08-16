'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/hooks';
import { appreciation, contact } from '@/content/profile';

type Stage = 'idle' | 'form' | 'sending' | 'done' | 'failed';

/**
 * The heart at the bottom of the personal file, and the note under it.
 *
 * The note posts straight to FormSubmit and resolves in place — no page
 * navigation, no mail app. `mailto:` was the first attempt and it is simply
 * unreliable: Instagram's in-app browser, which is where most of this site's
 * traffic comes from, frequently swallows it and nothing happens at all.
 *
 * The tally is honest about its own limits: a static export has no server, so
 * the count lives in this visitor's browser and the seed is a starting number
 * rather than a measurement.
 */
export function Appreciation() {
  const [appreciated, setAppreciated] = usePersistentState<boolean>(
    'asher.appreciated',
    false,
  );
  const [stage, setStage] = useState<Stage>('idle');
  const [name, setName] = useState('');
  const [line, setLine] = useState('');
  /** Honeypot. A human never sees it; a bot fills it and gets dropped. */
  const [trap, setTrap] = useState('');

  const count = appreciation.seed + (appreciated ? 1 : 0);
  const instagram = contact.find((c) => c.href.includes('instagram'))?.href;

  const send = async () => {
    if (!line.trim() || stage === 'sending') return;
    if (trap) {
      // Silently accept and discard — a bot gets no signal either way.
      setStage('done');
      return;
    }

    setStage('sending');
    const who = name.trim() || 'someone';

    try {
      const res = await fetch(appreciation.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: who,
          message: line.trim(),
          _subject: `ASHER — a line from ${who}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setAppreciated(true);
      setStage('done');
    } catch {
      setStage('failed');
    }
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
        onClick={() => setAppreciated(true)}
        disabled={appreciated}
        aria-label={appreciated ? 'Already appreciated' : 'Appreciate this'}
        aria-pressed={appreciated}
        className="group relative mx-auto grid h-14 w-14 place-items-center transition-transform duration-300 hover:scale-110 disabled:cursor-default disabled:hover:scale-100"
      >
        {!appreciated && (
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
            fill={appreciated ? 'var(--color-signal)' : 'none'}
            stroke="var(--color-signal)"
            strokeWidth="1.6"
            style={{ transition: 'fill 400ms var(--ease-out-expo)' }}
          />
        </svg>
      </button>

      <p className="hud-sm mt-4" aria-live="polite">
        <span
          className="tabular-nums"
          style={{ color: 'var(--color-signal)', fontSize: '1.05rem', letterSpacing: '0.12em' }}
        >
          {count}
        </span>
        <span className="ml-2">
          {appreciated ? 'including you' : 'people appreciated this'}
        </span>
      </p>

      {/* Everything below resolves in this one slot. */}
      <div className="mt-5">
        {stage === 'idle' && (
          <button
            type="button"
            onClick={() => setStage('form')}
            className="hud-sm px-4 py-2.5 transition-colors hover:text-[var(--color-signal)]"
            style={{ border: '1px solid var(--hud-line)' }}
          >
            {appreciation.prompt} →
          </button>
        )}

        {(stage === 'form' || stage === 'sending') && (
          <form
            className="space-y-2.5 text-left"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <Field label="Name" value={name} onChange={setName} placeholder="Optional" autoFocus />
            <Field
              label="One line"
              value={line}
              onChange={setLine}
              placeholder="Say something short."
            />

            {/* honeypot */}
            <input
              type="text"
              name="_honey"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="sr-only"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={!line.trim() || stage === 'sending'}
                className="hud-sm px-4 py-2.5 transition-all disabled:opacity-35"
                style={{
                  border: '1px solid color-mix(in oklab, var(--color-signal) 50%, transparent)',
                  color: 'var(--color-signal)',
                  background: 'color-mix(in oklab, var(--color-signal) 8%, transparent)',
                }}
              >
                {stage === 'sending' ? 'Sending…' : 'Send →'}
              </button>
              {stage === 'form' && (
                <button
                  type="button"
                  onClick={() => setStage('idle')}
                  className="hud-sm px-3 py-2.5 transition-colors hover:text-[var(--color-bone)]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {stage === 'done' && (
          <div style={{ animation: 'fade-in 500ms var(--ease-out-expo) both' }}>
            <p
              className="font-display text-lg font-extrabold uppercase"
              style={{ letterSpacing: '0.08em', color: 'var(--color-signal)' }}
            >
              {appreciation.thanksTitle}
            </p>
            <p className="prose-body mt-2">{appreciation.thanksBody}</p>
          </div>
        )}

        {stage === 'failed' && (
          <div style={{ animation: 'fade-in 400ms var(--ease-out-expo) both' }}>
            <p className="prose-body">{appreciation.failBody}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hud-sm px-4 py-2.5 transition-colors hover:text-[var(--color-signal)]"
                  style={{ border: '1px solid var(--hud-line)' }}
                >
                  Instagram →
                </a>
              )}
              <button
                type="button"
                onClick={() => setStage('form')}
                className="hud-sm px-3 py-2.5 transition-colors hover:text-[var(--color-bone)]"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
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
