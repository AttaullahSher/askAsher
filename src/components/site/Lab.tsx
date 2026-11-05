'use client';

import { lab, labIntro, type LabProject } from '@/content/lab';
import { securityCreed, securityScope } from '@/content/security';
import { asset } from '@/lib/paths';
import { Readout } from '../Readout';
import { Band, Heading, Reveal, Status } from './ui';

/**
 * After hours. A different room on purpose: alert red, scanlines, and
 * nothing a client is asked to read. The live readout is the proof — the page
 * reads the visitor's own device and throws it away, which says more than any
 * sentence about security could.
 */
export function Lab() {
  return (
    <Band id="lab" accent="var(--color-alert)" tone="deep">
      <div className="relative">
        <Heading index="04" eyebrow={labIntro.eyebrow} title={labIntro.title} lead={labIntro.lead} />

        <Reveal className="mt-12 max-w-3xl">
          <div className="grid gap-1.5">
            {securityCreed.map((line, i) => (
              <p
                key={line}
                className="font-display text-[clamp(1.05rem,3.6vw,1.6rem)] font-extrabold uppercase leading-tight"
                style={{
                  letterSpacing: '-0.005em',
                  color: i === securityCreed.length - 1 ? 'var(--accent)' : 'var(--color-hot)',
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </Reveal>

        <ul className="mt-14 grid gap-3 md:grid-cols-2">
          {lab.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 2) * 80}>
              <LabCard p={p} />
            </Reveal>
          ))}
        </ul>

        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <Reveal>
            <p className="hud" style={{ color: 'var(--accent)' }}>
              Proof, not a claim
            </p>
            <p className="display-md mt-4">Your device, right now.</p>
            <p className="prose-body mt-5 max-w-md">{securityScope}</p>
          </Reveal>
          <Readout />
        </div>
      </div>
    </Band>
  );
}

function LabCard({ p }: { p: LabProject }) {
  const href = p.href ? asset(p.href) : undefined;
  return (
    <details
      className="group scanlines relative h-full overflow-hidden"
      style={{ border: '1px solid color-mix(in oklab, var(--accent) 22%, transparent)', background: 'rgba(8,4,4,0.6)' }}
    >
      <summary className="flex cursor-pointer list-none flex-col gap-3 px-5 py-5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="hud-sm" style={{ color: 'var(--accent)' }}>
            {p.code}
          </span>
          <Status status={p.status} />
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-extrabold tracking-[0.12em] text-[var(--color-hot)]">{p.title}</h3>
            <p className="mt-1.5 text-[0.85rem] leading-relaxed" style={{ color: 'var(--color-bone)' }}>
              {p.blurb}
            </p>
          </div>
          <span
            aria-hidden
            className="hud shrink-0 transition-transform duration-300 group-open:rotate-45"
            style={{ color: 'var(--accent)', fontSize: '1rem' }}
          >
            +
          </span>
        </div>
      </summary>

      <div className="grid gap-4 px-5 pb-6" style={{ borderTop: '1px solid color-mix(in oklab, var(--accent) 16%, transparent)' }}>
        <p className="mt-4 text-[0.85rem] leading-relaxed" style={{ color: 'var(--color-bone)' }}>
          {p.what}
        </p>
        <p className="text-[0.85rem] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          <span className="hud-sm mr-2" style={{ color: 'var(--accent)' }}>
            Why
          </span>
          {p.why}
        </p>
        {p.does && (
          <ul className="grid gap-2">
            {p.does.map((d) => (
              <li key={d} className="flex gap-3 text-[0.8rem] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                <span aria-hidden style={{ color: 'var(--accent)' }}>
                  ▸
                </span>
                {d}
              </li>
            ))}
          </ul>
        )}
        {(p.made || href) && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {p.made && <span className="hud-sm">{p.made}</span>}
            {href && (
              <a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="hud inline-flex items-center gap-2 transition-colors hover:text-[var(--color-hot)]"
                style={{ color: 'var(--accent)' }}
              >
                {p.hrefLabel ?? 'Open'} <span aria-hidden>↗</span>
              </a>
            )}
          </div>
        )}
      </div>
    </details>
  );
}
