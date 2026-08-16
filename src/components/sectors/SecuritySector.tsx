'use client';

import { useEffect, useMemo, useState } from 'react';
import { Section } from '@/components/Section';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import {
  securityClose,
  securityPrinciples,
  securityRun,
  securityScope,
} from '@/content/security';
import type { Sector } from '@/content/site';

const LINE_MS = 340;

/**
 * The darkest sector, and the most careful one. The terminal runs a *defensive*
 * posture check against something the operator owns — headers, dependencies,
 * secrets, error handling. There is nothing offensive here to copy.
 */
export function SecuritySector({ sector }: { sector: Sector }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3, once: false });
  const { motion } = useExperience();

  const flat = useMemo(
    () =>
      securityRun.flatMap((step) =>
        step.lines.map((text, i) => ({ phase: step.phase, text, head: i === 0 })),
      ),
    [],
  );

  const running = inView && motion === 'full';

  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (!running) return;

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= flat.length) window.clearInterval(id);
    }, LINE_MS);

    // Rewind on the way out so re-entering the section replays the run.
    return () => {
      window.clearInterval(id);
      setTyped(0);
    };
  }, [running, flat.length]);

  // Off screen or reduced motion: show the completed report.
  const count = running ? typed : flat.length;

  const phaseIndex = securityRun.findIndex((s) => {
    const start = flat.findIndex((f) => f.phase === s.phase);
    const end = start + s.lines.length;
    return count > start && count <= end;
  });
  const activePhase = count >= flat.length ? securityRun.length - 1 : phaseIndex;

  return (
    <Section sector={sector}>
      <p className="prose-body mb-8 max-w-2xl">{securityScope}</p>

      {/* phase bar */}
      <ol className="mb-4 flex flex-wrap gap-x-1 gap-y-2">
        {securityRun.map((s, i) => {
          const done = i < activePhase || count >= flat.length;
          const on = i === activePhase && count < flat.length;
          return (
            <li key={s.id} className="flex items-center gap-1">
              <span
                className="hud-sm px-2 py-1 transition-all duration-300"
                style={{
                  border: `1px solid ${on || done ? 'var(--accent)' : 'var(--hud-line)'}`,
                  color: on ? 'var(--accent)' : done ? 'var(--color-bone)' : 'var(--color-steel-700)',
                  background: on
                    ? 'color-mix(in oklab, var(--accent) 14%, transparent)'
                    : 'transparent',
                }}
              >
                {s.phase}
              </span>
              {i < securityRun.length - 1 && (
                <span
                  aria-hidden
                  className="h-px w-3 transition-colors duration-300"
                  style={{ background: done ? 'var(--accent)' : 'var(--hud-line)' }}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* terminal */}
      <div
        ref={ref}
        className="scanlines relative overflow-hidden px-4 py-4 sm:px-5"
        style={{
          border: '1px solid var(--hud-line)',
          background: 'linear-gradient(180deg, rgba(12,6,6,0.8), rgba(0,0,0,0.6))',
          minHeight: '19rem',
        }}
      >
        <div
          className="mb-3 flex items-center gap-2 pb-2"
          style={{ borderBottom: '1px solid var(--hud-line)' }}
        >
          <span
            className="block h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--accent)', animation: 'flicker 4s infinite' }}
            aria-hidden
          />
          <span className="hud-sm">posture — own asset</span>
        </div>

        <ul className="space-y-1">
          {flat.slice(0, count).map((l, i) => (
            <li
              key={`${l.phase}-${i}`}
              // Flex, not inline — otherwise a wrapped line loses the gutter
              // and the whole log goes ragged on a phone.
              className="flex gap-2 text-[11px] leading-relaxed sm:text-xs"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span
                className="w-[4.25rem] shrink-0"
                style={{
                  color: l.head ? 'var(--accent)' : 'transparent',
                  letterSpacing: '0.1em',
                }}
                aria-hidden={!l.head}
              >
                {l.phase}
              </span>
              <span className="min-w-0 flex-1" style={{ color: 'var(--color-muted)' }}>
                {l.text}
              </span>
            </li>
          ))}
          {count < flat.length && (
            <li
              className="caret flex gap-2 text-[11px] sm:text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-steel-500)' }}
              aria-hidden
            >
              <span className="w-[4.25rem] shrink-0" />
            </li>
          )}
        </ul>

        {count >= flat.length && (
          <p
            className="mt-4 pt-3 text-[11px] sm:text-xs"
            style={{
              borderTop: '1px solid var(--hud-line)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            2 findings · 2 closed · report filed
          </p>
        )}
      </div>

      <ul className="mt-8 grid gap-px sm:grid-cols-2" style={{ background: 'var(--hud-line)' }}>
        {securityPrinciples.map((p) => (
          <li key={p.label} className="px-4 py-4" style={{ background: 'var(--color-void)' }}>
            <span
              className="font-display block text-xs font-bold uppercase"
              style={{ letterSpacing: '0.2em', color: 'var(--color-bone)' }}
            >
              {p.label}
            </span>
            <span className="mt-1.5 block text-xs" style={{ color: 'var(--color-muted)' }}>
              {p.body}
            </span>
          </li>
        ))}
      </ul>

      <p className="prose-body mt-8 max-w-2xl">{securityClose}</p>
    </Section>
  );
}
