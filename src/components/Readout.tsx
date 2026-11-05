'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import { dwellLine, readBattery, readVisitor, type ReadoutLine } from '@/lib/readout';
import { readout } from '@/content/security';

/** How fast the listing scans in, one line per tick. */
const SCAN_MS = 170;

/*
 * Reads with `var(--accent)` — the wrapper that mounts it decides the colour.
 */

/**
 * The demonstration.
 *
 * Values are read after mount, never during render: this is a static export,
 * so anything device-specific written during the first pass would disagree
 * with the prerendered HTML and hydration would tear.
 */
export function Readout() {
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
