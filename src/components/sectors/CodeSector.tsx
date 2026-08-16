'use client';

import { useMemo, useState } from 'react';
import { Section } from '@/components/Section';
import { stack, stackEdges, type StackNode } from '@/content/stack';
import type { Sector } from '@/content/site';

/**
 * A constellation rather than a grid. The point is not "here are twelve logos"
 * — it is that these things are connected, and touching one shows you where it
 * sits in the rest.
 */
export function CodeSector({ sector }: { sector: Sector }) {
  const [active, setActive] = useState<string | null>(null);

  const byId = useMemo(() => new Map(stack.map((n) => [n.id, n])), []);
  const current: StackNode | null = active ? (byId.get(active) ?? null) : null;

  const isLit = (id: string) => active === id;
  const edgeLit = (a: string, b: string) => active === a || active === b;

  // Inset the normalised field so no node is clipped by the frame.
  const px = (n: StackNode) => 7 + n.x * 86;
  const py = (n: StackNode) => 6 + n.y * 88;

  return (
    <Section sector={sector} wide>
      <div
        className="bracket relative aspect-[5/6] w-full select-none overflow-hidden sm:aspect-[4/3] lg:aspect-[16/10]"
        style={{
          border: '1px solid var(--hud-line)',
          background:
            'radial-gradient(90% 70% at 50% 45%, color-mix(in oklab, var(--color-smoke) 60%, transparent), rgba(4,6,10,0.35))',
          ['--bracket-color' as string]: 'var(--accent)',
        }}
        onPointerLeave={() => setActive(null)}
      >
        <span className="hud-sm absolute left-3 top-3 z-10" aria-hidden>
          Field map
        </span>

        {/* Faint field grid — gives the nodes something to sit on. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--hud-line) 1px, transparent 1px), linear-gradient(90deg, var(--hud-line) 1px, transparent 1px)',
            backgroundSize: '14.28% 12.5%',
            opacity: 0.16,
            maskImage: 'radial-gradient(80% 70% at 50% 50%, #000 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(80% 70% at 50% 50%, #000 30%, transparent 100%)',
          }}
        />

        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {stackEdges.map(([a, b]) => {
            const na = byId.get(a);
            const nb = byId.get(b);
            if (!na || !nb) return null;
            const lit = edgeLit(a, b);
            return (
              <line
                key={`${a}-${b}`}
                x1={px(na)}
                y1={py(na)}
                x2={px(nb)}
                y2={py(nb)}
                stroke={lit ? 'var(--accent)' : 'var(--color-steel-700)'}
                strokeWidth={lit ? 0.35 : 0.18}
                opacity={lit ? 0.9 : 0.4}
                vectorEffect="non-scaling-stroke"
                style={{ transition: 'stroke 260ms ease, opacity 260ms ease' }}
              />
            );
          })}
        </svg>

        {stack.map((n, i) => {
          const lit = isLit(n.id);
          const dim = active !== null && !lit;
          return (
            <button
              key={n.id}
              type="button"
              aria-pressed={lit}
              onPointerEnter={() => setActive(n.id)}
              onFocus={() => setActive(n.id)}
              onClick={() => setActive((c) => (c === n.id ? null : n.id))}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1.5 transition-all duration-300"
              style={{
                left: `${px(n)}%`,
                top: `${py(n)}%`,
                border: `1px solid ${lit ? 'var(--accent)' : 'var(--hud-line)'}`,
                background: lit
                  ? 'color-mix(in oklab, var(--accent) 14%, var(--color-void))'
                  : 'color-mix(in oklab, var(--color-void) 78%, transparent)',
                color: lit ? 'var(--accent)' : dim ? 'var(--color-steel-500)' : 'var(--color-bone)',
                opacity: dim ? 0.45 : 1,
                boxShadow: lit
                  ? '0 0 26px color-mix(in oklab, var(--accent) 30%, transparent)'
                  : 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: n.weight === 3 ? '0.72rem' : '0.62rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                animation: 'drift 9s ease-in-out infinite',
                animationDelay: `${i * 0.45}s`,
                ['--dx' as string]: `${(i % 3) - 1}px`,
                ['--dy' as string]: `${((i % 4) - 2) * 2}px`,
              }}
            >
              {n.label}
              {lit && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    border: '1px solid var(--accent)',
                    animation: 'pulse-ring 1.4s var(--ease-out-expo) infinite',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Fixed-height readout so nothing below jumps as you move around. */}
      <div
        className="bracket mt-6 flex min-h-[5.5rem] flex-col justify-center px-5 py-4"
        style={{
          border: '1px solid var(--hud-line)',
          background: 'color-mix(in oklab, var(--color-smoke) 55%, transparent)',
          ['--bracket-color' as string]: 'var(--accent)',
        }}
      >
        {current ? (
          <>
            <span className="hud-sm" style={{ color: 'var(--accent)' }}>
              {current.group}
            </span>
            <p className="prose-body mt-1.5" style={{ color: 'var(--color-bone)' }}>
              <span className="font-semibold">{current.label}</span>
              <span style={{ color: 'var(--color-muted)' }}> — {current.use}</span>
            </p>
          </>
        ) : (
          <p className="hud">Select a node</p>
        )}
      </div>
    </Section>
  );
}
