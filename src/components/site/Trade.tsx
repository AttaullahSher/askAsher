'use client';

import { career, careerIntro, trade } from '@/content/work';
import { Band, Heading, Reveal } from './ui';

/** The procurement and commercial half. Ice-blue: calm, institutional. */
export function Trade() {
  return (
    <Band id="trade" accent="var(--color-ice)" tone="deep">
      <Heading index="02" eyebrow={trade.eyebrow} title={trade.title} lead={trade.lead} />

      <div className="mt-14 grid gap-px md:grid-cols-3" style={{ background: 'var(--hud-line)' }}>
        {trade.pillars.map((p, i) => (
          <Reveal key={p.k} delay={i * 100}>
            <div className="h-full px-6 py-7" style={{ background: 'var(--color-void)' }}>
              <span className="hud-sm" style={{ color: 'var(--accent)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display mt-4 text-lg font-extrabold uppercase tracking-[0.08em] text-[var(--color-hot)]">
                {p.k}
              </h3>
              <p className="mt-3 text-[0.85rem] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                {p.v}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <p className="hud">{trade.engagementsLabel}</p>
        <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-3">
          {trade.engagements.map((e) => (
            <li
              key={e}
              className="font-display px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.08em]"
              style={{ border: '1px solid color-mix(in oklab, var(--accent) 28%, transparent)', color: 'var(--color-bone)' }}
            >
              {e}
            </li>
          ))}
        </ul>
      </Reveal>
    </Band>
  );
}

/** The career, newest first, on one vertical line. */
export function Record() {
  return (
    <Band id="record" accent="var(--color-signal)">
      <Heading index="03" eyebrow={careerIntro.eyebrow} title={careerIntro.title} />

      <ol className="relative mt-14 ml-1.5 sm:ml-0">
        <span
          aria-hidden
          className="absolute top-2 bottom-2 left-0 w-px sm:left-[7.5rem]"
          style={{ background: 'linear-gradient(180deg, var(--color-signal), var(--hud-line) 70%, transparent)' }}
        />
        {career.map((c, i) => (
          <Reveal as="li" key={`${c.year}-${c.role}`} delay={i * 70} className="relative pb-10 pl-7 sm:grid sm:grid-cols-[7.5rem_1fr] sm:pl-0">
            <span
              aria-hidden
              className="absolute top-2 left-0 h-2.5 w-2.5 -translate-x-1/2 rotate-45 sm:left-[7.5rem]"
              style={{ background: i === 0 ? 'var(--color-signal)' : 'var(--color-void)', border: '1px solid var(--color-signal)' }}
            />
            <span className="font-display block text-sm font-extrabold tracking-[0.2em] sm:pt-0.5" style={{ color: 'var(--color-signal)' }}>
              {c.year}
            </span>
            <div className="mt-1 sm:mt-0 sm:pl-10">
              <h3 className="font-display text-lg font-extrabold uppercase tracking-[0.05em] text-[var(--color-hot)]">
                {c.role}
              </h3>
              <p className="hud mt-1.5" style={{ letterSpacing: '0.18em' }}>
                {c.org}
              </p>
              <p className="mt-2.5 max-w-xl text-[0.85rem] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                {c.note}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Band>
  );
}
