'use client';

import { useExperience } from '@/lib/experience';
import { hero, site } from '@/content/site';
import { Reveal } from './site/ui';

/**
 * The first screen. Name, what he does, proof, two doors.
 *
 * There used to be an entry gate and a three-line cinematic in front of this.
 * Both are gone: a recruiter gives a page about four seconds, and none of them
 * should be spent waiting for an animation.
 */
export function Hero() {
  const { setAskOpen } = useExperience();
  const [first, last] = site.fullName.toUpperCase().split(' ');

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center"
      style={{ '--accent': 'var(--color-signal)' } as React.CSSProperties}
    >
      <div className="mx-auto w-full max-w-6xl px-5 pt-24 pb-16 sm:px-8">
        <Reveal>
          <p className="hud flex items-center gap-3">
            <span className="h-px w-10" style={{ background: 'var(--color-signal)' }} />
            {hero.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="display-name mt-6" style={{ textShadow: '0 0 80px rgba(4,6,10,0.9)' }}>
            <span className="block">{first}</span>
            <span className="block" style={{ color: 'transparent', WebkitTextStroke: '1.5px var(--color-bone)' }}>
              {last}
            </span>
          </h1>
          <p className="hud mt-4" style={{ letterSpacing: '0.4em' }}>
            Known as <span style={{ color: 'var(--color-signal)' }}>{site.name}</span>
          </p>
        </Reveal>

        <Reveal delay={260} className="mt-10 max-w-3xl">
          <p className="display-md" style={{ textTransform: 'none', letterSpacing: '-0.02em', lineHeight: 1.08 }}>
            {hero.lead}
          </p>
          <p className="prose-body mt-5 max-w-2xl">{hero.sub}</p>
        </Reveal>

        <Reveal delay={380} className="mt-9 flex flex-wrap gap-3">
          <a
            href="#work"
            className="font-display inline-flex items-center gap-3 px-6 py-3.5 text-xs font-bold uppercase transition-transform duration-300 hover:-translate-y-0.5"
            style={{ letterSpacing: '0.24em', background: 'var(--color-signal)', color: 'var(--color-void)' }}
          >
            {hero.primary}
            <span aria-hidden>↓</span>
          </a>
          <button
            type="button"
            onClick={() => setAskOpen(true)}
            className="font-display inline-flex items-center gap-3 px-6 py-3.5 text-xs font-bold uppercase transition-colors duration-300 hover:text-[var(--color-signal)]"
            style={{ letterSpacing: '0.24em', border: '1px solid var(--hud-line)', color: 'var(--color-hot)' }}
          >
            {hero.ask}
            <span className="caret" aria-hidden />
          </button>
        </Reveal>

        <Reveal delay={500} className="mt-16">
          <dl className="grid grid-cols-2 gap-px lg:grid-cols-4" style={{ background: 'var(--hud-line)' }}>
            {hero.stats.map((s) => (
              <div key={s.label} className="px-4 py-5 sm:px-5" style={{ background: 'rgba(4,6,10,0.78)' }}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="font-display text-[clamp(1.9rem,6vw,2.75rem)] font-extrabold leading-none text-[var(--color-hot)]">
                    {s.value}
                  </span>
                  {s.unit && (
                    <span className="hud ml-1.5" style={{ color: 'var(--color-signal)' }}>
                      {s.unit}
                    </span>
                  )}
                  <span className="hud-sm mt-2.5 block leading-relaxed" style={{ letterSpacing: '0.16em' }} aria-hidden>
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
