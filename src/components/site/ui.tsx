'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '@/lib/hooks';

/**
 * The three primitives every section is built from. One frame, one heading,
 * one reveal — so the page reads as a single system rather than seven designs.
 */

/** A full-width band. `accent` sets `--accent` for everything inside it. */
export function Band({
  id,
  accent,
  children,
  className = '',
  tone = 'clear',
}: {
  id: string;
  accent: string;
  children: ReactNode;
  className?: string;
  /** `deep` darkens the backdrop so a section reads as a different room. */
  tone?: 'clear' | 'deep';
}) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-16 ${className}`}
      style={
        {
          '--accent': accent,
          background:
            tone === 'deep'
              ? 'linear-gradient(180deg, transparent, rgba(4,6,10,0.88) 9%, rgba(4,6,10,0.92) 91%, transparent)'
              : undefined,
        } as CSSProperties
      }
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32">{children}</div>
    </section>
  );
}

/** Fades and lifts its children once they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'p' | 'article';
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      data-in={inView}
      className={`reveal ${className}`}
      style={{ '--d': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Index, eyebrow, a two-line title whose second line takes the accent, and a lead. */
export function Heading({
  index,
  eyebrow,
  title,
  lead,
  children,
}: {
  index: string;
  eyebrow: string;
  title: readonly string[];
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <Reveal className="max-w-3xl">
      <p className="hud flex items-center gap-3">
        <span style={{ color: 'var(--accent)' }}>{index}</span>
        <span className="h-px w-8" style={{ background: 'var(--accent)' }} />
        <span>{eyebrow}</span>
      </p>
      <h2 className="display-lg mt-5">
        {title.map((line, i) => (
          <span
            key={line}
            className="block"
            style={{ color: i === title.length - 1 && title.length > 1 ? 'var(--accent)' : undefined }}
          >
            {line}
          </span>
        ))}
      </h2>
      {lead && <p className="prose-body mt-6 max-w-2xl">{lead}</p>}
      {children}
    </Reveal>
  );
}

/** Small mono tag. */
export function Tag({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'accent' }) {
  return (
    <span
      className="hud-sm inline-flex items-center px-2 py-1"
      style={{
        border: `1px solid ${tone === 'accent' ? 'color-mix(in oklab, var(--accent) 45%, transparent)' : 'var(--hud-line)'}`,
        color: tone === 'accent' ? 'var(--accent)' : 'var(--color-muted)',
        letterSpacing: '0.18em',
      }}
    >
      {children}
    </span>
  );
}

/** LIVE / PRIVATE / CLOSED, with a pulse only on LIVE. */
export function Status({ status }: { status: 'LIVE' | 'PRIVATE' | 'CLOSED' }) {
  const colour =
    status === 'LIVE' ? 'var(--color-signal)' : status === 'PRIVATE' ? 'var(--color-ice)' : 'var(--color-steel-500)';
  return (
    <span className="hud-sm inline-flex items-center gap-2" style={{ color: colour, letterSpacing: '0.22em' }}>
      <span className="relative inline-flex h-1.5 w-1.5">
        {status === 'LIVE' && (
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: colour, animation: 'pulse-ring 1.8s var(--ease-out-expo) infinite' }}
          />
        )}
        <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: colour }} />
      </span>
      {status}
    </span>
  );
}
