'use client';

import { useEffect, useRef, useState } from 'react';
import { Section } from '@/components/Section';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import { automationNote, pipeline } from '@/content/automation';
import type { Sector } from '@/content/site';

const STEP_MS = 950;
const HOLD_MS = 2400;

/**
 * One pipeline, running end to end on a loop. Vertical at every breakpoint —
 * seven stages laid horizontally would be unreadable on the phone this is
 * mostly opened on, and the vertical spine reads as descent, which fits.
 */
export function AutomationSector({ sector }: { sector: Sector }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: false });
  const { motion } = useExperience();
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [packetY, setPacketY] = useState(0);

  const running = inView && motion === 'full';

  const [frame, setFrame] = useState<{ step: number; log: string[] }>({ step: -1, log: [] });

  useEffect(() => {
    if (!running) return;

    let i = -1;
    let timer = 0;

    const advance = () => {
      i += 1;
      if (i >= pipeline.length) {
        timer = window.setTimeout(() => {
          i = -1;
          setFrame({ step: -1, log: [] });
          advance();
        }, HOLD_MS);
        return;
      }
      const stage = pipeline[i];
      setFrame((f) => ({ step: i, log: stage ? [...f.log, stage.log] : f.log }));
      timer = window.setTimeout(advance, STEP_MS);
    };

    timer = window.setTimeout(advance, 320);

    // Rewinding on the way out means the next pass always starts from zero.
    return () => {
      window.clearTimeout(timer);
      setFrame({ step: -1, log: [] });
    };
  }, [running]);

  // Paused (off screen, or reduced motion): show the finished pipeline, never
  // an empty diagram.
  const step = running ? frame.step : pipeline.length - 1;
  const log = running ? frame.log : pipeline.map((s) => s.log);

  // Park the travelling packet on the active node.
  useEffect(() => {
    const el = rowRefs.current[Math.max(step, 0)];
    if (!el) return;
    setPacketY(el.offsetTop + el.offsetHeight / 2);
  }, [step]);

  return (
    <Section sector={sector}>
      <div ref={ref} className="relative">
        {/* spine */}
        <span
          aria-hidden
          className="absolute left-[13px] top-3 bottom-3 w-px sm:left-[15px]"
          style={{ background: 'var(--hud-line)' }}
        />
        {/* travelling packet */}
        {motion === 'full' && step >= 0 && (
          <span
            aria-hidden
            className="absolute left-[13px] z-10 -ml-[3px] h-1.5 w-1.5 rounded-full sm:left-[15px]"
            style={{
              top: packetY,
              background: 'var(--accent)',
              boxShadow: '0 0 14px 3px color-mix(in oklab, var(--accent) 65%, transparent)',
              transition: 'top 520ms var(--ease-in-out-quint)',
            }}
          />
        )}

        <ol className="relative space-y-0">
          {pipeline.map((stage, i) => {
            const done = step > i;
            const on = step === i;
            return (
              <li
                key={stage.id}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className="flex items-start gap-4 py-3.5 sm:gap-5 sm:py-4"
              >
                <span
                  aria-hidden
                  className="mt-1 flex h-[27px] w-[27px] shrink-0 items-center justify-center transition-all duration-500 sm:h-[31px] sm:w-[31px]"
                  style={{
                    border: `1px solid ${on || done ? 'var(--accent)' : 'var(--hud-line)'}`,
                    background: on
                      ? 'color-mix(in oklab, var(--accent) 22%, var(--color-void))'
                      : 'var(--color-void)',
                    transform: on ? 'scale(1.12)' : 'scale(1)',
                    boxShadow: on
                      ? '0 0 22px color-mix(in oklab, var(--accent) 45%, transparent)'
                      : 'none',
                  }}
                >
                  <span
                    className="block h-1.5 w-1.5 transition-colors duration-500"
                    style={{
                      background: on || done ? 'var(--accent)' : 'var(--color-steel-700)',
                    }}
                  />
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className="font-display text-sm font-bold uppercase transition-colors duration-500 sm:text-base"
                    style={{
                      letterSpacing: '0.16em',
                      color: on
                        ? 'var(--accent)'
                        : done
                          ? 'var(--color-bone)'
                          : 'var(--color-steel-500)',
                    }}
                  >
                    {stage.label}
                  </p>
                  <p
                    className="mt-0.5 text-xs transition-colors duration-500"
                    style={{ color: on || done ? 'var(--color-muted)' : 'var(--color-steel-700)' }}
                  >
                    {stage.caption}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* log */}
      <div
        className="scanlines relative mt-8 overflow-hidden px-4 py-3.5"
        style={{
          border: '1px solid var(--hud-line)',
          background: 'color-mix(in oklab, #000 55%, transparent)',
          minHeight: '7.5rem',
        }}
      >
        <div className="mb-2 flex items-center gap-2">
          <span
            className="block h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--accent)' }}
            aria-hidden
          />
          <span className="hud-sm">Run log</span>
        </div>
        <ul className="space-y-1" aria-live="off">
          {log.slice(-4).map((line, i, arr) => (
            <li
              key={`${line}-${i}`}
              className="truncate text-[11px] leading-relaxed"
              style={{
                color: i === arr.length - 1 ? 'var(--accent)' : 'var(--color-steel-500)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span style={{ opacity: 0.5 }}>› </span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      <p className="prose-body mt-8 max-w-2xl">{automationNote}</p>
    </Section>
  );
}
