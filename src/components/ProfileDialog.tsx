'use client';

import { Block, Overlay } from './Overlay';
import { bio, bioClose, facts, roles } from '@/content/profile';
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
      <div className="space-y-8">
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

        <div
          className="bracket px-5 py-5"
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
      </div>
    </Overlay>
  );
}
