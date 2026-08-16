'use client';

import { useEffect, useState } from 'react';
import { useExperience } from '@/lib/experience';
import { site } from '@/content/site';

/**
 * The entry gate. Nothing plays and nothing makes a sound until this is
 * dismissed — that is the whole point of it. The scene is already alive
 * underneath, so the gate reads as a held frame rather than a loading screen.
 */
export function Gate() {
  const { enter, toggleSound, motion } = useExperience();
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 260);
    return () => window.clearTimeout(id);
  }, []);

  const go = (withSound: boolean) => {
    if (leaving) return;
    setLeaving(true);
    if (withSound) toggleSound();
    // Let the gate finish fading before the camera starts to move.
    window.setTimeout(enter, 420);
    window.setTimeout(() => setGone(true), 1000);
  };

  if (gone) return null;

  return (
    <div
      data-noscript-hide
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 transition-opacity duration-500"
      style={{
        opacity: leaving ? 0 : 1,
        pointerEvents: leaving ? 'none' : 'auto',
        background:
          'radial-gradient(90% 70% at 50% 55%, rgba(4,6,10,0.35) 0%, rgba(4,6,10,0.86) 70%, rgba(4,6,10,0.96) 100%)',
      }}
    >
      <div
        className="flex flex-col items-center text-center transition-all duration-1000"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? 'none' : 'translateY(14px)',
          transitionTimingFunction: 'var(--ease-out-expo)',
        }}
      >
        <p className="hud-sm mb-8" style={{ color: 'var(--color-steel-500)' }}>
          Drop zone · 0400 hrs
        </p>

        <h1
          className="font-display mb-1 text-[clamp(2.6rem,13vw,5.5rem)] font-extrabold uppercase leading-none"
          style={{ letterSpacing: '0.32em', textIndent: '0.32em' }}
        >
          {site.name}
        </h1>

        <p className="hud mt-7 max-w-xs leading-relaxed sm:max-w-sm">
          An interactive introduction. Roughly ninety seconds.
        </p>

        <button
          type="button"
          onClick={() => go(true)}
          className="bracket group relative mt-10 px-9 py-4 transition-colors duration-300"
          style={{
            border: '1px solid color-mix(in oklab, var(--color-signal) 45%, transparent)',
            background: 'color-mix(in oklab, var(--color-signal) 7%, transparent)',
            ['--bracket-color' as string]: 'var(--color-signal)',
          }}
        >
          <span
            className="hud font-semibold transition-colors duration-300"
            style={{ color: 'var(--color-signal)', letterSpacing: '0.3em' }}
          >
            Enter experience
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-signal) 16%, transparent), transparent)',
            }}
          />
        </button>

        <button
          type="button"
          onClick={() => go(false)}
          className="hud-sm mt-5 underline-offset-4 transition-colors duration-200 hover:text-[var(--color-bone)]"
        >
          Enter without sound
        </button>

        {motion === 'reduced' && (
          <p className="hud-sm mt-8 max-w-xs" style={{ color: 'var(--color-steel-500)' }}>
            Reduced motion detected · animation minimised
          </p>
        )}
      </div>

      <p
        className="hud-sm absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-700"
        style={{
          color: 'var(--color-steel-700)',
          opacity: ready ? 1 : 0,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        Some things here are hidden
      </p>
    </div>
  );
}
