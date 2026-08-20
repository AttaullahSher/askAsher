'use client';

import { useEffect, useState } from 'react';
import { Section } from '@/components/Section';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import {
  securityClose,
  securityCreed,
  securityPrinciples,
  securityScope,
} from '@/content/security';
import type { Sector } from '@/content/site';

const LINE_MS = 900;

/**
 * The darkest sector, and the most careful one.
 *
 * There is no posture run and no list of steps: the method is nobody's
 * business, and showing it would turn the one section that is about a person
 * into a process document. Four lines land in order, and the last one does
 * the work.
 */
export function SecuritySector({ sector }: { sector: Sector }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3, once: false });
  const { motion } = useExperience();

  const [shown, setShown] = useState(0);
  const running = inView && motion === 'full';

  useEffect(() => {
    if (!running) return;

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= securityCreed.length) window.clearInterval(id);
    }, LINE_MS);

    // Rewind on the way out so re-entering the section lands them again.
    return () => {
      window.clearInterval(id);
      setShown(0);
    };
  }, [running]);

  // Off screen or reduced motion: the lines are simply there.
  const count = running ? shown : securityCreed.length;

  return (
    <Section sector={sector}>
      <div
        ref={ref}
        className="scanlines relative overflow-hidden px-5 py-9 sm:px-8 sm:py-12"
        style={{
          border: '1px solid var(--hud-line)',
          background: 'linear-gradient(180deg, rgba(12,6,6,0.82), rgba(0,0,0,0.6))',
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-px"
          style={{ background: 'var(--accent)', opacity: 0.55 }}
        />

        <ul className="space-y-4">
          {securityCreed.map((line, i) => {
            const on = count > i;
            const last = i === securityCreed.length - 1;
            return (
              <li
                key={line}
                className="font-display text-[clamp(1.15rem,5.2vw,2.1rem)] font-extrabold uppercase leading-[1.08] transition-all duration-700"
                style={{
                  letterSpacing: '-0.01em',
                  opacity: on ? 1 : 0,
                  transform: on ? 'none' : 'translateY(12px)',
                  transitionTimingFunction: 'var(--ease-out-expo)',
                  color: last ? 'var(--accent)' : 'var(--color-bone)',
                }}
              >
                {line}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="prose-body mt-6 max-w-2xl">{securityScope}</p>

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
