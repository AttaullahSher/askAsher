'use client';

import { useState } from 'react';
import { Section } from '@/components/Section';
import { loadout, playerNote, playerTitles } from '@/content/player';
import type { Sector } from '@/content/site';

/**
 * A loadout screen, not a scoreboard. No ranks, no K/D, no invented stats —
 * each slot is a habit the games trained that the building work uses.
 */
export function PlayerSector({ sector }: { sector: Sector }) {
  const [active, setActive] = useState(loadout[0]?.id ?? '');

  return (
    <Section sector={sector} wide>
      <div
        className="relative overflow-hidden"
        style={{
          border: '1px solid var(--hud-line)',
          background:
            'linear-gradient(160deg, color-mix(in oklab, var(--color-smoke) 62%, transparent), rgba(4,6,10,0.7))',
        }}
      >
        {/* HUD header strip */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
          style={{ borderBottom: '1px solid var(--hud-line)' }}
        >
          <div className="flex items-center gap-2.5">
            <Crosshair />
            <span className="hud-sm" style={{ color: 'var(--accent)' }}>
              Player mode
            </span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {playerTitles.map((t) => (
              <li
                key={t}
                className="hud-sm px-2 py-0.5"
                style={{ border: '1px solid var(--hud-line)' }}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid sm:grid-cols-[minmax(0,15rem)_1fr]">
          {/* slots */}
          <ul>
            {loadout.map((s, i) => {
              const on = active === s.id;
              return (
                <li
                  key={s.id}
                  style={i > 0 ? { borderTop: '1px solid var(--hud-line)' } : undefined}
                >
                  <button
                    type="button"
                    aria-pressed={on}
                    onPointerEnter={() => setActive(s.id)}
                    onFocus={() => setActive(s.id)}
                    onClick={() => setActive(s.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all duration-300 sm:px-5"
                    style={{
                      background: on
                        ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
                        : 'transparent',
                      borderLeft: `2px solid ${on ? 'var(--accent)' : 'transparent'}`,
                    }}
                  >
                    <span
                      className="hud-sm w-[4.5rem] shrink-0"
                      style={{ color: on ? 'var(--accent)' : 'var(--color-steel-500)' }}
                    >
                      {s.slot}
                    </span>
                    <span
                      className="font-display text-xs font-bold uppercase"
                      style={{
                        letterSpacing: '0.14em',
                        color: on ? 'var(--color-hot)' : 'var(--color-muted)',
                      }}
                    >
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* readout */}
          <div
            className="relative flex min-h-[13rem] flex-col justify-center border-t px-5 py-8 sm:border-l sm:border-t-0 sm:px-8"
            style={{ borderColor: 'var(--hud-line)' }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, var(--accent) 0 1px, transparent 1px 34px)',
              }}
            />
            {loadout.map((s) => (
              <div
                key={s.id}
                className="absolute inset-0 flex flex-col justify-center px-5 transition-all duration-500 sm:px-8"
                style={{
                  opacity: active === s.id ? 1 : 0,
                  transform: active === s.id ? 'none' : 'translateY(10px)',
                  pointerEvents: 'none',
                }}
              >
                <p className="hud-sm mb-3" style={{ color: 'var(--accent)' }}>
                  {s.slot} · equipped
                </p>
                <p
                  className="font-display text-[clamp(1.4rem,5vw,2.4rem)] font-extrabold uppercase leading-none"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {s.label}
                </p>
                <p className="prose-body mt-4 max-w-md">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="prose-body mt-8 max-w-2xl">{playerNote}</p>
    </Section>
  );
}

function Crosshair() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <circle cx="7" cy="7" r="5.4" fill="none" stroke="var(--accent)" strokeWidth="1" />
      <path d="M7 0v3M7 11v3M0 7h3M11 7h3" stroke="var(--accent)" strokeWidth="1" />
      <circle cx="7" cy="7" r="1" fill="var(--accent)" />
    </svg>
  );
}
