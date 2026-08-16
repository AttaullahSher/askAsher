'use client';

import { useInView } from '@/lib/hooks';
import { site } from '@/content/site';

const WORDS = ['CODE.', 'CREATE.', 'AUTOMATE.', 'PLAY.'];

const AXIOMS = [
  { k: '01', v: 'Build, do not narrate.' },
  { k: '02', v: 'If it repeats, it gets automated.' },
  { k: '03', v: 'Every system has a seam.' },
];

/**
 * The character reveal, straight after the hero. One idea per line, nothing
 * explained twice.
 */
export function Manifest() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="relative px-5 py-24 sm:px-8 sm:py-36"
      aria-label="Introduction"
    >
      <div className="mx-auto max-w-4xl">
        <p className="hud-sm reveal mb-10" data-in={inView}>
          Manifest
        </p>

        <h2 className="display-lg">
          {WORDS.map((w, i) => (
            <span
              key={w}
              className="reveal block"
              data-in={inView}
              style={{
                ['--d' as string]: `${i * 110}ms`,
                color:
                  i === WORDS.length - 1
                    ? 'color-mix(in oklab, var(--color-bone) 42%, transparent)'
                    : undefined,
              }}
            >
              {w}
            </span>
          ))}
        </h2>

        <div
          className="reveal-wipe rule mt-10"
          data-in={inView}
          style={{ ['--d' as string]: '520ms' }}
        />

        <p
          className="prose-body reveal mt-8 max-w-xl text-balance"
          data-in={inView}
          style={{ ['--d' as string]: '600ms' }}
        >
          {site.description}
        </p>

        <ul className="mt-14 grid gap-px sm:grid-cols-3" style={{ background: 'var(--hud-line)' }}>
          {AXIOMS.map((a, i) => (
            <li
              key={a.k}
              className="reveal px-5 py-6"
              data-in={inView}
              style={{
                ['--d' as string]: `${700 + i * 90}ms`,
                background: 'var(--color-void)',
              }}
            >
              <span className="hud-sm block" style={{ color: 'var(--color-signal)' }}>
                {a.k}
              </span>
              <span
                className="font-display mt-3 block text-sm font-semibold uppercase leading-snug"
                style={{ letterSpacing: '0.08em' }}
              >
                {a.v}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
