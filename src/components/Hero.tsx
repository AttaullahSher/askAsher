'use client';

import { useEffect, useState } from 'react';
import { useExperience } from '@/lib/experience';
import { heroLines, intro, site } from '@/content/site';

/**
 * Opening cinematic and resting hero.
 *
 * Three lines land one at a time, then the last one resolves into the standing
 * title. Skippable from the first beat — never trap someone in an animation.
 */

const BEATS = [
  { in: 300, out: 1500 },
  { in: 1700, out: 2900 },
  { in: 3100, out: 4400 },
];
const SETTLE = 4550;

export function Hero() {
  const { entered, introPlaying, endIntro, motion, setAskOpen } = useExperience();
  const [beat, setBeat] = useState(-1);
  const [settled, setSettled] = useState(false);

  // With motion reduced there is no cinematic to run: the hero is simply there.
  const showRest = settled || (entered && motion === 'reduced');
  const activeBeat = motion === 'reduced' ? -1 : beat;

  useEffect(() => {
    if (!entered || motion === 'reduced') return;

    const timers: number[] = [];
    BEATS.forEach((b, i) => {
      timers.push(window.setTimeout(() => setBeat(i), b.in));
      timers.push(window.setTimeout(() => setBeat((cur) => (cur === i ? -1 : cur)), b.out));
    });
    timers.push(
      window.setTimeout(() => {
        setSettled(true);
        endIntro();
      }, SETTLE),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [entered, motion, endIntro]);

  const skip = () => {
    setBeat(-1);
    setSettled(true);
    endIntro();
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6"
    >
      {/* --- cinematic lines --- */}
      {introPlaying && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6">
          {intro.map((line, i) => (
            <h2
              key={line}
              aria-hidden={activeBeat !== i}
              className="display-xl absolute text-center transition-all"
              style={{
                opacity: activeBeat === i ? 1 : 0,
                transform: activeBeat === i ? 'scale(1)' : 'scale(1.06)',
                filter: activeBeat === i ? 'blur(0px)' : 'blur(8px)',
                transitionDuration: '650ms',
                transitionTimingFunction: 'var(--ease-out-expo)',
                letterSpacing: '-0.02em',
                textShadow: '0 0 70px rgba(4,6,10,0.9)',
              }}
            >
              {line}
            </h2>
          ))}
        </div>
      )}

      {introPlaying && (
        <button
          type="button"
          onClick={skip}
          className="hud-sm absolute bottom-8 right-6 z-30 px-3 py-2 transition-colors hover:text-[var(--color-bone)]"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
        >
          Skip →
        </button>
      )}

      {/*
        Title scrim. The scene drifts, so the type cannot rely on whatever
        happens to be behind it at a given second — this guarantees separation
        without darkening the whole frame.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-[70vmin] -translate-y-1/2 transition-opacity duration-1000"
        style={{
          opacity: showRest ? 1 : 0,
          background:
            'radial-gradient(58% 46% at 50% 50%, rgba(4,6,10,0.86) 0%, rgba(4,6,10,0.6) 45%, rgba(4,6,10,0) 100%)',
        }}
      />

      {/* --- resting hero --- */}
      <div
        data-hero-rest
        className="relative z-10 flex flex-col items-center text-center transition-all duration-1000"
        style={{
          opacity: showRest ? 1 : 0,
          transform: showRest ? 'none' : 'translateY(24px) scale(0.985)',
          transitionTimingFunction: 'var(--ease-out-expo)',
        }}
      >
        <div className="mb-7 flex items-center gap-3">
          <span
            className="block h-px w-8"
            style={{ background: 'var(--hud-line)' }}
            aria-hidden
          />
          <span className="hud-sm">{heroLines.eyebrow}</span>
          <span
            className="block h-px w-8"
            style={{ background: 'var(--hud-line)' }}
            aria-hidden
          />
        </div>

        <h1
          className="font-display text-[clamp(4rem,22vw,15rem)] font-extrabold uppercase leading-[0.82]"
          style={{
            letterSpacing: '0.02em',
            textShadow: '0 0 90px rgba(255,138,31,0.08)',
          }}
        >
          {site.name}
        </h1>

        <p
          className="font-display mt-5 max-w-2xl text-[clamp(0.95rem,3.6vw,1.6rem)] font-semibold uppercase leading-snug"
          style={{ letterSpacing: '0.1em', color: 'var(--color-bone)' }}
        >
          {heroLines.lead}
        </p>

        <p
          className="prose-body mt-4 max-w-md text-balance"
          style={{ color: 'var(--color-muted)' }}
        >
          {heroLines.sub}
        </p>

        {/*
          The site is called askAsher. Until now the only way to reach him was
          seven sections down, behind a door, at the bottom of a modal — so most
          visitors never learned that asking was on offer at all. This says so
          within four seconds, and it is the one button above the fold.
        */}
        <button
          type="button"
          onClick={() => setAskOpen(true)}
          className="hud-sm mt-7 whitespace-nowrap px-4 py-2.5 transition-colors hover:text-[var(--color-signal)]"
          style={{
            border: '1px solid color-mix(in oklab, var(--color-signal) 38%, transparent)',
            background: 'color-mix(in oklab, var(--color-signal) 6%, transparent)',
          }}
        >
          {heroLines.ask} →
        </button>
      </div>

      <ScrollCue visible={showRest} />
    </section>
  );
}

function ScrollCue({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden
      // Decoration, and it sits over the bottom of the hero. Without this it
      // quietly eats clicks aimed at anything down there — which is exactly
      // what happened the moment a real button was added above it.
      className="pointer-events-none absolute bottom-10 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-1000 delay-500"
      style={{ opacity: visible ? 1 : 0, paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex flex-col items-center gap-2.5">
        <span
          className="hud-sm whitespace-nowrap"
          style={{ color: 'var(--color-bone)' }}
        >
          {heroLines.cue}
        </span>
        <span
          className="relative block h-9 w-px overflow-hidden"
          style={{ background: 'var(--hud-line)' }}
        >
          <span
            className="absolute inset-x-0 h-4"
            style={{
              background:
                'linear-gradient(180deg, transparent, var(--color-signal), transparent)',
              animation: 'sweep 2.4s var(--ease-in-out-quint) infinite',
            }}
          />
        </span>
        <svg
          width="16"
          height="10"
          viewBox="0 0 16 10"
          fill="none"
          style={{ animation: 'nudge 2.4s var(--ease-in-out-quint) infinite' }}
        >
          <path
            d="M1 1l7 7 7-7"
            stroke="var(--color-signal)"
            strokeWidth="1.6"
            strokeLinecap="square"
          />
        </svg>
      </div>
    </div>
  );
}
