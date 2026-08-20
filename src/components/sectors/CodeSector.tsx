'use client';

import { useEffect, useMemo, useState } from 'react';
import { Section } from '@/components/Section';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import { stack, stackEdges, stackLead, type StackNode } from '@/content/stack';
import type { Sector } from '@/content/site';

const DWELL_MS = 2100;

/**
 * A field that scans itself.
 *
 * Nothing here asks to be tapped — the sweep walks the map on its own and the
 * readout follows it. Interaction on this page lives at the end, not in the
 * middle of the descent.
 */
export function CodeSector({ sector }: { sector: Sector }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2, once: false });
  const { motion } = useExperience();
  const [index, setIndex] = useState(0);

  const byId = useMemo(() => new Map(stack.map((n) => [n.id, n])), []);
  const running = inView && motion === 'full';

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % stack.length);
    }, DWELL_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const current: StackNode | null = stack[index] ?? null;
  const activeId = current?.id ?? null;
  const edgeLit = (a: string, b: string) => activeId === a || activeId === b;

  // Inset the normalised field so no node is clipped by the frame.
  const px = (n: StackNode) => 7 + n.x * 86;
  const py = (n: StackNode) => 6 + n.y * 88;

  return (
    <Section sector={sector} wide>
      <p className="prose-body mb-6 max-w-2xl">{stackLead}</p>

      <div
        ref={ref}
        className="bracket relative aspect-[5/6] w-full select-none overflow-hidden sm:aspect-[4/3] lg:aspect-[16/10]"
        style={{
          border: '1px solid var(--hud-line)',
          background:
            'radial-gradient(90% 70% at 50% 45%, color-mix(in oklab, var(--color-smoke) 60%, transparent), rgba(4,6,10,0.35))',
          ['--bracket-color' as string]: 'var(--accent)',
        }}
      >
        <span className="hud-sm absolute left-3 top-3 z-10" aria-hidden>
          Field map
        </span>

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
                strokeWidth={lit ? 0.35 : 0.16}
                opacity={lit ? 0.9 : 0.32}
                vectorEffect="non-scaling-stroke"
                style={{ transition: 'stroke 420ms ease, opacity 420ms ease' }}
              />
            );
          })}
        </svg>

        {stack.map((n, i) => {
          const lit = activeId === n.id;
          return (
            <span
              key={n.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 transition-all duration-500"
              style={{
                left: `${px(n)}%`,
                top: `${py(n)}%`,
                border: `1px solid ${lit ? 'var(--accent)' : 'var(--hud-line)'}`,
                background: lit
                  ? 'color-mix(in oklab, var(--accent) 14%, var(--color-void))'
                  : 'color-mix(in oklab, var(--color-void) 74%, transparent)',
                color: lit ? 'var(--accent)' : 'var(--color-steel-500)',
                boxShadow: lit
                  ? '0 0 26px color-mix(in oklab, var(--accent) 30%, transparent)'
                  : 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: n.weight === 3 ? '0.66rem' : '0.58rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                animation: motion === 'full' ? 'drift 11s ease-in-out infinite' : undefined,
                animationDelay: `${i * 0.37}s`,
                ['--dx' as string]: `${(i % 3) - 1}px`,
                ['--dy' as string]: `${((i % 4) - 2) * 2}px`,
              }}
            >
              {n.label}
            </span>
          );
        })}
      </div>

      {/* Fixed-height readout — follows the scan, never shifts the layout. */}
      <div
        className="bracket mt-6 flex min-h-[5.5rem] flex-col justify-center px-5 py-4"
        style={{
          border: '1px solid var(--hud-line)',
          background: 'color-mix(in oklab, var(--color-smoke) 55%, transparent)',
          ['--bracket-color' as string]: 'var(--accent)',
        }}
        aria-live="off"
      >
        {current && (
          <>
            <span className="hud-sm" style={{ color: 'var(--accent)' }}>
              {current.group}
            </span>
            <p className="prose-body mt-1.5" style={{ color: 'var(--color-bone)' }}>
              <span className="font-semibold">{current.label}</span>
              <span style={{ color: 'var(--color-muted)' }}> — {current.use}</span>
            </p>
          </>
        )}
      </div>

      {/* Everything, for anyone who would rather read than watch. */}
      <p className="sr-only">
        Stack: {stack.map((n) => n.label).join(', ')}.
      </p>
    </Section>
  );
}
