'use client';

import { useEffect, useRef, useState } from 'react';
import { Section } from '@/components/Section';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import { dwellLine, readBattery, readVisitor, type ReadoutLine } from '@/lib/readout';
import {
  readout,
  securityClose,
  securityCreed,
  securityPrinciples,
  securityScope,
} from '@/content/security';
import type { Sector } from '@/content/site';

const LINE_MS = 900;
/** Fast enough to read as a machine listing, slow enough to actually read. */
const SCAN_MS = 170;

/**
 * The darkest sector, and the most careful one.
 *
 * Four lines land in order, and then the page stops talking about itself and
 * does something instead: it reads the visitor's own device in front of them
 * and drops every value on the floor afterwards. See `src/lib/readout.ts` for
 * the rules that govern what may be read — read-only, no permission prompts,
 * nothing stored, nothing invented.
 */
export function SecuritySector({ sector }: { sector: Sector }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3, once: false });
  const { motion } = useExperience();

  const [shown, setShown] = useState(0);
  const running = inView && motion === 'full';

  useEffect(() => {
    if (!running) return;

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= securityCreed.length) window.clearInterval(id);
    }, LINE_MS);

    // Rewind on the way out so re-entering the section lands them again.
    return () => {
      window.clearInterval(id);
      setShown(0);
    };
  }, [running]);

  // Off screen or reduced motion: the lines are simply there.
  const count = running ? shown : securityCreed.length;

  return (
    <Section sector={sector}>
      <div
        ref={ref}
        className="scanlines relative overflow-hidden px-5 py-9 sm:px-8 sm:py-12"
        style={{
          border: '1px solid var(--hud-line)',
          background: 'linear-gradient(180deg, rgba(12,6,6,0.82), rgba(0,0,0,0.6))',
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-px"
          style={{ background: 'var(--accent)', opacity: 0.55 }}
        />

        <ul className="space-y-4">
          {securityCreed.map((line, i) => {
            const on = count > i;
            const last = i === securityCreed.length - 1;
            return (
              <li
                key={line}
                className="font-display text-[clamp(1.15rem,5.2vw,2.1rem)] font-extrabold uppercase leading-[1.08] transition-all duration-700"
                style={{
                  letterSpacing: '-0.01em',
                  opacity: on ? 1 : 0,
                  transform: on ? 'none' : 'translateY(12px)',
                  transitionTimingFunction: 'var(--ease-out-expo)',
                  color: last ? 'var(--accent)' : 'var(--color-bone)',
                }}
              >
                {line}
              </li>
            );
          })}
        </ul>
      </div>

      <Readout />

      <p className="prose-body mt-8 max-w-2xl">{securityScope}</p>

      <ul className="mt-8 grid gap-px sm:grid-cols-2" style={{ background: 'var(--hud-line)' }}>
        {securityPrinciples.map((p) => (
          <li key={p.label} className="px-4 py-4" style={{ background: 'var(--color-void)' }}>
            <span
              className="font-display block text-xs font-bold uppercase"
              style={{ letterSpacing: '0.2em', color: 'var(--color-bone)' }}
            >
              {p.label}
            </span>
            <span className="mt-1.5 block text-xs" style={{ color: 'var(--color-muted)' }}>
              {p.body}
            </span>
          </li>
        ))}
      </ul>

      <p className="prose-body mt-8 max-w-2xl">{securityClose}</p>
    </Section>
  );
}

/**
 * The demonstration.
 *
 * Values are read after mount, never during render: this is a static export,
 * so anything device-specific written during the first pass would disagree
 * with the prerendered HTML and hydration would tear.
 */
function Readout() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const { motion } = useExperience();

  const [lines, setLines] = useState<ReadoutLine[]>([]);
  const [dwell, setDwell] = useState<ReadoutLine | null>(null);
  const [scanned, setScanned] = useState(0);
  /** Epoch ms of page load — exact, and cheaper than tracking it by hand. */
  const pageLoad = useRef(0);

  // Read once, on mount. Deferred through a microtask rather than written
  // straight into the effect body — the same shape `usePersistentState` uses
  // in `src/lib/hooks.ts`, and what the compiler's set-state-in-effect rule
  // asks for.
  useEffect(() => {
    pageLoad.current = Date.now() - performance.now();

    let live = true;
    queueMicrotask(() => {
      if (live) setLines(readVisitor());
    });
    void readBattery().then((b) => {
      // Appended rather than sorted in: it resolves late, and a line that
      // shoulders its way into the middle of a finished list looks like a bug.
      if (live && b) setLines((prev) => (prev.length > 0 ? [...prev, b] : prev));
    });
    return () => {
      live = false;
    };
  }, []);

  // The listing. Runs only while it is on screen and motion is on; the
  // finished state for every other case is derived below rather than stored,
  // which is both fewer renders and one less way for the two to disagree.
  useEffect(() => {
    if (lines.length === 0 || !inView || motion === 'reduced') return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setScanned(i);
      if (i >= lines.length) window.clearInterval(id);
    }, SCAN_MS);
    return () => window.clearInterval(id);
  }, [lines.length, inView, motion]);

  // The one value that keeps moving while you look at it.
  useEffect(() => {
    if (!inView || pageLoad.current === 0) return;
    const tick = () => setDwell(dwellLine(pageLoad.current));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [inView]);

  // Reduced motion has no scan to wait for: the list is simply there.
  const shown = motion === 'reduced' ? lines.length : scanned;
  const complete = lines.length > 0 && shown >= lines.length;
  const all = dwell && complete ? [...lines, dwell] : lines;

  return (
    <div ref={ref} className="mt-10">
      <div
        className="relative overflow-hidden"
        style={{
          border: '1px solid color-mix(in oklab, var(--accent) 34%, transparent)',
          background: 'rgba(6,3,3,0.55)',
        }}
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5"
          style={{ borderBottom: '1px solid color-mix(in oklab, var(--accent) 22%, transparent)' }}
        >
          <span className="hud-sm" style={{ color: 'var(--accent)' }}>
            {readout.eyebrow}
          </span>
          {!complete && lines.length > 0 && (
            <span
              className="hud-sm"
              style={{ color: 'var(--color-steel-500)', animation: 'blink 1s steps(2) infinite' }}
            >
              reading
            </span>
          )}
        </div>

        <div className="px-4 py-4 sm:px-5">
          <p className="prose-body mb-4 max-w-xl">{readout.lead}</p>

          {/*
            Empty means a hardened browser handed over nothing at all — which is
            worth saying out loud rather than rendering an empty box. It is also
            what a bot or a prerender sees, so it must read as a real sentence.
          */}
          {lines.length === 0 ? (
            <p className="prose-body" style={{ color: 'var(--color-muted)' }}>
              {readout.empty}
            </p>
          ) : (
            <dl
              className="grid gap-px"
              style={{ background: 'color-mix(in oklab, var(--accent) 14%, transparent)' }}
              aria-live="polite"
            >
              {all.map((l, i) => {
                // The dwell line always shows once the scan is done.
                const on = i < shown || l === dwell;
                return (
                  <div
                    key={l.k}
                    className="flex items-baseline justify-between gap-4 px-3 py-2 transition-all duration-500"
                    style={{
                      background: 'var(--color-void)',
                      opacity: on ? 1 : 0,
                      transform: on ? 'none' : 'translateX(-6px)',
                      transitionTimingFunction: 'var(--ease-out-expo)',
                    }}
                  >
                    <dt className="hud-sm shrink-0">{l.k}</dt>
                    <dd
                      className="text-right text-xs"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: l.sting ? 'var(--accent)' : 'var(--color-bone)',
                      }}
                    >
                      {l.v}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}

          {/* The turn. Held back until the listing has finished. */}
          <div
            className="mt-5 transition-opacity duration-700"
            style={{ opacity: complete ? 1 : 0 }}
            aria-hidden={!complete}
          >
            {readout.turn.map((t, i) => (
              <p
                key={t}
                className="font-display text-sm font-bold uppercase leading-snug transition-all duration-700 sm:text-base"
                style={{
                  letterSpacing: '0.04em',
                  transitionDelay: `${i * 220}ms`,
                  opacity: complete ? 1 : 0,
                  transform: complete ? 'none' : 'translateY(8px)',
                  color: i === readout.turn.length - 1 ? 'var(--accent)' : 'var(--color-bone)',
                }}
              >
                {t}
              </p>
            ))}
          </div>
        </div>
      </div>

      <p className="prose-body mt-5 max-w-2xl">{readout.release}</p>

      {/*
        The line the sector exists to earn. Display type, directly under the
        proof — it costs nothing to say once the readout has already said it.
      */}
      <p
        className="font-display mt-6 max-w-2xl text-[clamp(1.05rem,4.4vw,1.7rem)] font-extrabold uppercase leading-[1.12]"
        style={{ letterSpacing: '-0.01em', color: 'var(--accent)' }}
      >
        {readout.after}
      </p>
    </div>
  );
}
