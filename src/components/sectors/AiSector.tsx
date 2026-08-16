'use client';

import { useEffect, useState } from 'react';
import { Section } from '@/components/Section';
import { useExperience } from '@/lib/experience';
import { aiBootLog, aiDisclaimer, aiModules } from '@/content/ai';
import type { Sector } from '@/content/site';

/**
 * The core comes online when the visitor asks it to. Everything here is
 * presentation — the disclaimer says so plainly, because pretending a canvas
 * animation is inference would be the cheapest thing on the site.
 */
export function AiSector({ sector }: { sector: Sector }) {
  const { motion, markFound } = useExperience();
  const [state, setState] = useState<'idle' | 'booting' | 'online'>('idle');
  const [lines, setLines] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const boot = () => {
    if (state !== 'idle') return;
    markFound('core');
    if (motion === 'reduced') {
      setLines(aiBootLog);
      setState('online');
      return;
    }
    setState('booting');
  };

  useEffect(() => {
    if (state !== 'booting') return;
    let i = 0;
    const id = window.setInterval(() => {
      const line = aiBootLog[i];
      if (line) setLines((l) => [...l, line]);
      i += 1;
      if (i >= aiBootLog.length) {
        window.clearInterval(id);
        window.setTimeout(() => setState('online'), 420);
      }
    }, 260);
    return () => window.clearInterval(id);
  }, [state]);

  const online = state === 'online';
  const live = state !== 'idle';

  return (
    <Section sector={sector} wide>
      <div className="flex flex-col items-center">
        <Core state={state} onActivate={boot} selectedAngle={
          selected ? (aiModules.find((m) => m.id === selected)?.angle ?? null) : null
        } />

        {/* boot readout */}
        <div
          className="mt-7 w-full max-w-md px-4 py-3"
          style={{
            border: '1px solid var(--hud-line)',
            background: 'color-mix(in oklab, #000 45%, transparent)',
            minHeight: '6.5rem',
          }}
        >
          {lines.length === 0 ? (
            <p className="hud-sm">Core dormant</p>
          ) : (
            <ul className="space-y-0.5">
              {lines.map((l, i) => (
                <li
                  key={l}
                  className="text-[11px]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color:
                      i === lines.length - 1 && online
                        ? 'var(--accent)'
                        : 'var(--color-steel-500)',
                  }}
                >
                  <span style={{ opacity: 0.45 }}>[ok] </span>
                  {l}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* modules */}
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {aiModules.map((m, i) => {
          const isSel = selected === m.id;
          return (
            <li key={m.id}>
              <button
                type="button"
                disabled={!live}
                aria-pressed={isSel}
                onPointerEnter={() => live && setSelected(m.id)}
                onFocus={() => live && setSelected(m.id)}
                onClick={() => setSelected((s) => (s === m.id ? null : m.id))}
                className="bracket h-full w-full px-4 py-4 text-left transition-all duration-500 disabled:cursor-default"
                style={{
                  border: `1px solid ${isSel ? 'var(--accent)' : 'var(--hud-line)'}`,
                  background: isSel
                    ? 'color-mix(in oklab, var(--accent) 8%, transparent)'
                    : 'color-mix(in oklab, var(--color-smoke) 45%, transparent)',
                  opacity: live ? 1 : 0.22,
                  transform: live ? 'none' : 'translateY(10px)',
                  transitionDelay: live ? `${i * 70}ms` : '0ms',
                  ['--bracket-color' as string]: isSel
                    ? 'var(--accent)'
                    : 'var(--color-steel-700)',
                }}
              >
                <span
                  className="font-display block text-xs font-bold uppercase"
                  style={{
                    letterSpacing: '0.2em',
                    color: isSel ? 'var(--accent)' : 'var(--color-bone)',
                  }}
                >
                  {m.label}
                </span>
                <span
                  className="mt-2 block text-xs leading-relaxed"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {m.body}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="hud-sm mt-8 leading-relaxed" style={{ color: 'var(--color-steel-500)' }}>
        {aiDisclaimer}
      </p>
    </Section>
  );
}

function Core({
  state,
  onActivate,
  selectedAngle,
}: {
  state: 'idle' | 'booting' | 'online';
  onActivate: () => void;
  selectedAngle: number | null;
}) {
  const live = state !== 'idle';
  const online = state === 'online';

  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={live}
      aria-label={live ? 'AI core online' : 'Activate AI core'}
      className="relative grid h-56 w-56 place-items-center disabled:cursor-default sm:h-72 sm:w-72"
    >
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full">
        {/* outer ring */}
        <circle
          r="88"
          fill="none"
          stroke="var(--hud-line)"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
        {/* rotating dashed ring */}
        <circle
          r="72"
          fill="none"
          stroke={live ? 'var(--accent)' : 'var(--color-steel-700)'}
          strokeWidth="1"
          strokeDasharray="14 9"
          vectorEffect="non-scaling-stroke"
          opacity={live ? 0.85 : 0.4}
          style={{
            transformOrigin: 'center',
            animation: live ? 'spin 26s linear infinite' : undefined,
            transition: 'stroke 600ms ease, opacity 600ms ease',
          }}
        />
        <circle
          r="56"
          fill="none"
          stroke={live ? 'var(--accent)' : 'var(--color-steel-700)'}
          strokeWidth="0.6"
          strokeDasharray="3 7"
          vectorEffect="non-scaling-stroke"
          opacity={0.5}
          style={{
            transformOrigin: 'center',
            animation: live ? 'spin-r 40s linear infinite' : undefined,
          }}
        />

        {/* module markers */}
        {aiModules.map((m) => {
          const rad = ((m.angle - 90) * Math.PI) / 180;
          const x = Math.cos(rad) * 88;
          const y = Math.sin(rad) * 88;
          const sel = selectedAngle === m.angle;
          return (
            <g key={m.id}>
              {sel && (
                <line
                  x1={0}
                  y1={0}
                  x2={x}
                  y2={y}
                  stroke="var(--accent)"
                  strokeWidth="0.5"
                  opacity="0.5"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={sel ? 4 : 2.4}
                fill={live ? 'var(--accent)' : 'var(--color-steel-700)'}
                opacity={live ? (sel ? 1 : 0.6) : 0.35}
                style={{ transition: 'all 320ms var(--ease-out-expo)' }}
              />
            </g>
          );
        })}

        {/* core */}
        <circle
          r="30"
          fill={
            online
              ? 'color-mix(in oklab, var(--accent) 20%, transparent)'
              : 'color-mix(in oklab, var(--color-steel-900) 70%, transparent)'
          }
          stroke={live ? 'var(--accent)' : 'var(--color-steel-500)'}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'fill 800ms ease, stroke 800ms ease' }}
        />
        {online && (
          <circle
            r="30"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            style={{ transformOrigin: 'center', animation: 'pulse-ring 3s ease-out infinite' }}
          />
        )}
      </svg>

      <span
        className="hud-sm relative z-10 text-center leading-tight transition-colors duration-700"
        style={{ color: live ? 'var(--accent)' : 'var(--color-bone)', maxWidth: '5.5rem' }}
      >
        {online ? 'Online' : state === 'booting' ? 'Booting' : 'Initialise core'}
      </span>
    </button>
  );
}
