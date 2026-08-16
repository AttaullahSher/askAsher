'use client';

import { useEffect, useState } from 'react';
import { Section } from '@/components/Section';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import { aiBootLog, aiDisclaimer, aiModules } from '@/content/ai';
import type { Sector } from '@/content/site';

/**
 * The core brings itself online as you reach it. Everything here is
 * presentation — the disclaimer says so plainly, because pretending a canvas
 * animation is inference would be the cheapest thing on the site.
 */
export function AiSector({ sector }: { sector: Sector }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const { motion } = useExperience();
  const [state, setState] = useState<'idle' | 'booting' | 'online'>('idle');
  const [lines, setLines] = useState<string[]>([]);
  const [cycle, setCycle] = useState(0);

  // Boots on arrival rather than on a tap — nothing in the descent asks to be
  // clicked.
  useEffect(() => {
    if (!inView) return;
    if (motion === 'reduced') {
      const id = window.setTimeout(() => {
        setLines(aiBootLog);
        setState('online');
      }, 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setState((s) => (s === 'idle' ? 'booting' : s)), 500);
    return () => window.clearTimeout(id);
  }, [inView, motion]);

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

  // Once online, the ring walks its own modules.
  useEffect(() => {
    if (!online || motion === 'reduced' || !inView) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), 2400);
    return () => window.clearInterval(id);
  }, [online, motion, inView]);

  const highlighted = online ? aiModules[cycle % aiModules.length] : null;

  return (
    <Section sector={sector} wide>
      <div ref={ref} className="flex flex-col items-center">
        <Core state={state} selectedAngle={highlighted?.angle ?? null} />

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

      {/*
        One readout that follows the ring, rather than six cards stacked into a
        wall of text. The ring already says there are six of them.
      */}
      <div
        className="bracket mt-8 flex min-h-[8.5rem] flex-col justify-center px-5 py-5"
        style={{
          border: `1px solid ${live ? 'var(--accent)' : 'var(--hud-line)'}`,
          background: 'color-mix(in oklab, var(--color-smoke) 50%, transparent)',
          ['--bracket-color' as string]: 'var(--accent)',
          opacity: live ? 1 : 0.4,
          transition: 'opacity 700ms ease, border-color 700ms ease',
        }}
        aria-live="off"
      >
        {highlighted ? (
          <>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="block h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
              <span
                className="font-display text-sm font-bold uppercase"
                style={{ letterSpacing: '0.2em', color: 'var(--accent)' }}
              >
                {highlighted.label}
              </span>
              <span className="hud-sm ml-auto tabular-nums">
                {String(aiModules.indexOf(highlighted) + 1).padStart(2, '0')}
                <span style={{ opacity: 0.4 }}> / {String(aiModules.length).padStart(2, '0')}</span>
              </span>
            </div>
            <p className="prose-body mt-3">{highlighted.body}</p>
          </>
        ) : (
          <p className="hud-sm">Modules offline</p>
        )}
      </div>

      {/* Everything, for anyone who would rather read than watch. */}
      <ul className="sr-only">
        {aiModules.map((m) => (
          <li key={m.id}>
            {m.label}: {m.body}
          </li>
        ))}
      </ul>

      <p className="hud-sm mt-8 leading-relaxed" style={{ color: 'var(--color-steel-500)' }}>
        {aiDisclaimer}
      </p>
    </Section>
  );
}

function Core({
  state,
  selectedAngle,
}: {
  state: 'idle' | 'booting' | 'online';
  selectedAngle: number | null;
}) {
  const live = state !== 'idle';
  const online = state === 'online';

  return (
    <div
      role="img"
      aria-label={online ? 'AI core, online' : 'AI core, starting'}
      className="relative grid h-56 w-56 place-items-center sm:h-72 sm:w-72"
    >
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full">
        {/* outer ring */}
        <circle
          r="88"
          fill="none"
          stroke="var(--hud-line)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* rotating dashed ring */}
        <circle
          r="72"
          fill="none"
          stroke={live ? 'var(--accent)' : 'var(--color-steel-700)'}
          strokeWidth="1.5"
          strokeDasharray="14 9"
          vectorEffect="non-scaling-stroke"
          opacity={live ? 1 : 0.45}
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
          strokeWidth="1"
          strokeDasharray="3 7"
          vectorEffect="non-scaling-stroke"
          opacity={live ? 0.7 : 0.35}
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
                r={sel ? 5 : 3.2}
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
              ? 'color-mix(in oklab, var(--accent) 26%, #05070c)'
              : 'color-mix(in oklab, var(--color-steel-900) 70%, transparent)'
          }
          stroke={live ? 'var(--accent)' : 'var(--color-steel-500)'}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          style={{
            transition: 'fill 800ms ease, stroke 800ms ease',
            filter: online
              ? 'drop-shadow(0 0 14px color-mix(in oklab, var(--accent) 55%, transparent))'
              : undefined,
          }}
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
        style={{
          color: live ? 'var(--color-hot)' : 'var(--color-bone)',
          maxWidth: '5.5rem',
          textShadow: live ? '0 0 12px color-mix(in oklab, var(--accent) 70%, transparent)' : undefined,
        }}
      >
        {online ? 'Online' : 'Booting'}
      </span>
    </div>
  );
}
