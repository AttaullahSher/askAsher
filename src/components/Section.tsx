'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '@/lib/hooks';
import type { Sector } from '@/content/site';

/**
 * The frame every sector shares: index, rule, title, subtitle, then content.
 * Consistency here is what stops six very different visualisations from
 * looking like six different websites.
 */
export function Section({
  sector,
  children,
  wide = false,
}: {
  sector: Sector;
  children: ReactNode;
  wide?: boolean;
}) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.08 });

  return (
    <section
      ref={ref}
      id={sector.id}
      data-sector={sector.id}
      className="relative scroll-mt-4 px-5 py-24 sm:px-8 sm:py-32"
      style={{ ['--accent' as string]: sector.accent }}
    >
      <div className={wide ? 'mx-auto max-w-6xl' : 'mx-auto max-w-4xl'}>
        <header className="mb-12 sm:mb-16">
          <div className="flex items-baseline gap-4" data-in={inView} >
            <span
              className="font-display reveal text-[clamp(2.5rem,9vw,5rem)] font-extrabold leading-none"
              data-in={inView}
              style={{
                color: 'transparent',
                WebkitTextStroke: '1px color-mix(in oklab, var(--accent) 55%, transparent)',
              }}
            >
              {sector.index}
            </span>
            <div className="flex-1">
              <h2
                className="display-lg reveal"
                data-in={inView}
                style={{ ['--d' as string]: '80ms' }}
              >
                {sector.title}
              </h2>
            </div>
          </div>

          <div
            className="reveal-wipe rule mt-5"
            data-in={inView}
            style={{ ['--d' as string]: '160ms' }}
          />

          <p
            className="prose-body reveal mt-5 max-w-2xl"
            data-in={inView}
            style={{ ['--d' as string]: '240ms' }}
          >
            {sector.subtitle}
          </p>
        </header>

        <div className="reveal" data-in={inView} style={{ ['--d' as string]: '320ms' }}>
          {children}
        </div>
      </div>
    </section>
  );
}

/** Small monospaced tag used inside sectors. */
export function Tag({
  children,
  style,
  active = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  active?: boolean;
}) {
  return (
    <span
      className="hud-sm inline-block px-2 py-1 transition-colors duration-300"
      style={{
        border: `1px solid ${active ? 'var(--accent)' : 'var(--hud-line)'}`,
        color: active ? 'var(--accent)' : 'var(--color-muted)',
        background: active
          ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
          : 'transparent',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
