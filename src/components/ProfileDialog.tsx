'use client';

import { Appreciation } from './Appreciation';
import { CurveMark, CurveRule } from './Curve';
import { Block, Overlay } from './Overlay';
import { bio, bioClose, contact, facts, roles } from '@/content/profile';
import { site } from '@/content/site';

/** The personal file. The one thing on this site that is not about software. */
export function ProfileDialog({ onClose }: { onClose: () => void }) {
  return (
    <Overlay
      label="About Asher"
      eyebrow="● Subject file"
      title={site.name}
      onClose={onClose}
    >
      <div className="relative space-y-8">
        {/* the motif, sitting behind the file rather than on it */}
        <CurveMark
          className="pointer-events-none absolute -right-6 top-10 h-[26rem] w-32"
          opacity={0.1}
        />

        <Block label="Standing">
          <ul className="grid gap-px" style={{ background: 'var(--hud-line)' }}>
            {roles.map((r) => (
              <li key={r.org} className="px-4 py-3.5" style={{ background: 'var(--color-void)' }}>
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span
                    className="font-display text-sm font-bold uppercase"
                    style={{ letterSpacing: '0.12em', color: 'var(--color-hot)' }}
                  >
                    {r.title}
                  </span>
                  <span className="hud-sm" style={{ color: 'var(--color-signal)' }}>
                    {r.org}
                  </span>
                </div>
                <p className="mt-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                  {r.note}
                </p>
              </li>
            ))}
          </ul>
        </Block>

        <Block label="The long version">
          <div className="space-y-4">
            {bio.map((p) => (
              <p key={p.slice(0, 24)} className="prose-body">
                {p}
              </p>
            ))}
          </div>
        </Block>

        <CurveRule className="w-full" />

        <div
          className="bracket relative px-5 py-5"
          style={{
            border: '1px solid color-mix(in oklab, var(--color-signal) 34%, transparent)',
            background: 'color-mix(in oklab, var(--color-signal) 6%, transparent)',
            ['--bracket-color' as string]: 'var(--color-signal)',
          }}
        >
          <p
            className="font-display text-[clamp(1rem,4vw,1.35rem)] font-semibold uppercase leading-snug"
            style={{ letterSpacing: '0.06em' }}
          >
            {bioClose}
          </p>
        </div>

        <Block label="Detail">
          <ul className="grid grid-cols-2 gap-px" style={{ background: 'var(--hud-line)' }}>
            {facts.map((f) => (
              <li key={f.k} className="px-4 py-3" style={{ background: 'var(--color-void)' }}>
                <span className="hud-sm block">{f.k}</span>
                <span
                  className="mt-1 block text-sm"
                  style={{ color: 'var(--color-bone)', fontFamily: 'var(--font-mono)' }}
                >
                  {f.v}
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <Block label="Reach me">
          <ul className="grid gap-2 sm:grid-cols-2">
            {contact.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="group flex h-full flex-col items-start px-4 py-3 text-left transition-colors duration-300"
                  style={{ border: '1px solid var(--hud-line)' }}
                >
                  <span
                    className="font-display text-xs font-bold uppercase transition-colors duration-300 group-hover:text-[var(--color-signal)]"
                    style={{ letterSpacing: '0.24em' }}
                  >
                    {c.label}
                  </span>
                  <span className="hud-sm mt-1" style={{ letterSpacing: '0.14em' }}>
                    {c.note}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Block>

        <Appreciation />
      </div>
    </Overlay>
  );
}
