'use client';

import { useInView } from '@/lib/hooks';
import { method, methodNote } from '@/content/method';
import { site } from '@/content/site';

const WORDS = ['DESIGN.', 'AUTOMATE.', 'DECIDE.', 'PLAY.'];

/**
 * The character reveal, straight after the hero — and then the method.
 *
 * This section used to end on three one-line axioms ("I read the room before
 * the docs.") which are the sort of thing anybody can write about themselves in
 * an afternoon. The site said what he does in five sectors and who he is behind
 * a door, and nowhere at all did it say *how* — which is the half a sharp
 * reader is actually weighing. `method.ts` is that half, and it goes here,
 * early, before anybody has decided whether to keep scrolling.
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

        <p
          className="prose-body reveal mt-4 max-w-xl text-balance"
          data-in={inView}
          style={{ ['--d' as string]: '650ms', color: 'var(--color-muted)' }}
        >
          {site.descriptionSub}
        </p>

        {/*
          The method. A vertical sequence rather than the three-column grid the
          axioms used, because these are steps in an order and a grid reads as
          a menu of unrelated virtues.
        */}
        <p
          className="hud-sm reveal mt-16"
          data-in={inView}
          style={{ ['--d' as string]: '720ms', color: 'var(--color-signal)' }}
        >
          How it actually happens
        </p>

        <ol className="mt-5 grid gap-px" style={{ background: 'var(--hud-line)' }}>
          {method.map((s, i) => (
            <li
              key={s.index}
              className="reveal px-5 py-6 sm:px-6"
              data-in={inView}
              style={{
                ['--d' as string]: `${780 + i * 80}ms`,
                background: 'var(--color-void)',
              }}
            >
              <div className="flex items-baseline gap-4">
                <span
                  className="hud-sm shrink-0 tabular-nums"
                  style={{ color: 'var(--color-signal)' }}
                >
                  {s.index}
                </span>
                <div className="min-w-0">
                  <h3
                    className="font-display text-sm font-extrabold uppercase leading-snug sm:text-base"
                    style={{ letterSpacing: '0.1em', color: 'var(--color-hot)' }}
                  >
                    {s.label}
                  </h3>
                  <p className="prose-body mt-2">{s.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p
          className="prose-body reveal mt-6 max-w-xl"
          data-in={inView}
          style={{ ['--d' as string]: '1200ms', color: 'var(--color-muted)' }}
        >
          {methodNote}
        </p>
      </div>
    </section>
  );
}
