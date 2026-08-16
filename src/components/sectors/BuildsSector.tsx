'use client';

import { lazy, Suspense, useState } from 'react';
import { Section } from '@/components/Section';
import { builds, type Build } from '@/content/builds';
import type { Sector } from '@/content/site';

// The case-study overlay is only ever needed after a deliberate tap.
const BuildDialog = lazy(() =>
  import('@/components/BuildDialog').then((m) => ({ default: m.BuildDialog })),
);

const STATUS_COLOR: Record<Build['status'], string> = {
  LIVE: 'var(--color-signal)',
  INTERNAL: 'var(--color-ice)',
  EXPERIMENT: 'var(--color-violet)',
};

export function BuildsSector({ sector }: { sector: Sector }) {
  const [open, setOpen] = useState<Build | null>(null);

  return (
    <Section sector={sector} wide>
      <ul className="grid gap-3 sm:grid-cols-2">
        {builds.map((b, i) => (
          <li key={b.id} className={i === 0 ? 'sm:col-span-2' : undefined}>
            <button
              type="button"
              onClick={() => setOpen(b)}
              className="bracket group relative block h-full w-full overflow-hidden px-5 py-6 text-left transition-all duration-500 sm:px-6 sm:py-7"
              style={{
                border: '1px solid var(--hud-line)',
                background: 'color-mix(in oklab, var(--color-smoke) 52%, transparent)',
                ['--bracket-color' as string]: 'var(--color-steel-500)',
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{
                  background:
                    'radial-gradient(120% 100% at 0% 0%, color-mix(in oklab, var(--color-signal) 9%, transparent), transparent 60%)',
                }}
              />

              <span className="relative flex items-center justify-between gap-3">
                <span
                  className="hud-sm"
                  style={{ color: STATUS_COLOR[b.status] }}
                >
                  ● {b.status}
                </span>
                <span className="hud-sm">{b.year}</span>
              </span>

              <span
                className="font-display relative mt-4 block font-extrabold uppercase leading-none"
                style={{
                  fontSize: i === 0 ? 'clamp(1.9rem,7vw,3.2rem)' : 'clamp(1.35rem,5vw,2rem)',
                  letterSpacing: '-0.01em',
                }}
              >
                {b.title}
              </span>

              <span
                className="relative mt-3 block max-w-md text-sm leading-relaxed"
                style={{ color: 'var(--color-muted)' }}
              >
                {b.blurb}
              </span>

              <span
                className="hud-sm relative mt-5 flex items-center gap-2 transition-colors duration-300 group-hover:text-[var(--color-signal)]"
              >
                Open file
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <Suspense fallback={null}>
          <BuildDialog build={open} onClose={() => setOpen(null)} />
        </Suspense>
      )}
    </Section>
  );
}
