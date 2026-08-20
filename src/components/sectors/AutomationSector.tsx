'use client';

import { useEffect, useState } from 'react';
import { Section } from '@/components/Section';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import {
  automationLead,
  automationNote,
  relay,
  relayFooter,
} from '@/content/automation';
import type { Sector } from '@/content/site';

const HOP_MS = 900;
const HOLD_MS = 3400;

/**
 * A relay, not a pipeline diagram.
 *
 * One request enters at the top and is handed from app to app, and what it is
 * carrying changes on the way down. The argument is made by the hand-offs
 * themselves: none of these programs were written to speak to each other, and
 * nobody is opening any of them.
 */
export function AutomationSector({ sector }: { sector: Sector }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: false });
  const { motion } = useExperience();

  /** -1 before the run, 0..n-1 as the token sits on a hop, n once through. */
  const [at, setAt] = useState(-1);
  const running = inView && motion === 'full';

  useEffect(() => {
    if (!running) return;

    let i = -1;
    let timer = 0;

    const tick = () => {
      i += 1;
      if (i > relay.length) {
        timer = window.setTimeout(() => {
          i = -1;
          setAt(-1);
          tick();
        }, HOLD_MS);
        return;
      }
      setAt(i);
      timer = window.setTimeout(tick, HOP_MS);
    };

    timer = window.setTimeout(tick, 500);
    return () => {
      window.clearTimeout(timer);
      setAt(-1);
    };
  }, [running]);

  // Paused or reduced motion: show the finished chain rather than a blank one.
  const step = running ? at : relay.length;
  const done = step >= relay.length;

  return (
    <Section sector={sector}>
      <p className="hud-sm mb-6">{automationLead}</p>

      <div ref={ref} className="max-w-2xl">
        <ol className="relative">
          {/* the spine everything is threaded on */}
          <span
            aria-hidden
            className="absolute bottom-8 left-[13px] top-8 w-px"
            style={{ background: 'var(--hud-line)' }}
          />
          {relay.map((h, i) => {
            const lit = step >= i;
            const here = step === i;
            const handed = step > i;
            return (
              <li key={h.id}>
                <div className="flex items-start gap-4 py-2">
                  <span
                    aria-hidden
                    className="relative z-10 mt-0.5 grid h-[27px] w-[27px] shrink-0 place-items-center transition-all duration-500"
                    style={{
                      border: `1px solid ${lit ? 'var(--accent)' : 'var(--hud-line)'}`,
                      background: 'var(--color-void)',
                      boxShadow: here
                        ? '0 0 22px color-mix(in oklab, var(--accent) 40%, transparent)'
                        : 'none',
                    }}
                  >
                    <span
                      className="block transition-all duration-500"
                      style={{
                        width: here ? '9px' : '6px',
                        height: here ? '9px' : '6px',
                        background: lit ? 'var(--accent)' : 'var(--color-steel-700)',
                      }}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className="font-display block text-sm font-bold uppercase transition-colors duration-500 sm:text-base"
                      style={{
                        letterSpacing: '0.12em',
                        color: lit ? 'var(--color-hot)' : 'var(--color-steel-700)',
                      }}
                    >
                      {h.app}
                    </span>
                    <span
                      className="mt-0.5 block text-xs transition-colors duration-500"
                      style={{ color: lit ? 'var(--color-muted)' : 'var(--color-steel-700)' }}
                    >
                      {h.role}
                    </span>
                  </span>
                </div>

                {/* what it hands to the next one */}
                {i < relay.length - 1 && (
                  <div className="flex items-center gap-4 pb-2 pl-[3px]">
                    <span
                      aria-hidden
                      className="grid h-[21px] w-[21px] shrink-0 place-items-center"
                    >
                      <span
                        className="block h-1 w-1 transition-all duration-500"
                        style={{
                          background: handed ? 'var(--accent)' : 'transparent',
                        }}
                      />
                    </span>
                    <span
                      className="hud-sm min-w-0 flex-1 transition-all duration-500"
                      style={{
                        opacity: handed ? 1 : 0.2,
                        color: handed ? 'var(--accent)' : 'var(--color-steel-700)',
                        transform: handed ? 'none' : 'translateX(-4px)',
                      }}
                    >
                      {h.carries}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* the receipt at the bottom of the chain */}
        <div
          className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3.5 transition-all duration-700"
          style={{
            border: `1px solid ${done ? 'var(--accent)' : 'var(--hud-line)'}`,
            background: done
              ? 'color-mix(in oklab, var(--accent) 9%, transparent)'
              : 'transparent',
          }}
        >
          <span
            className="hud-sm transition-colors duration-700"
            style={{ color: done ? 'var(--accent)' : 'var(--color-steel-700)' }}
          >
            {done ? relay[relay.length - 1]?.carries : relayFooter.label}
          </span>
          <span
            className="font-display text-xl font-extrabold tabular-nums transition-colors duration-700 sm:text-2xl"
            style={{ color: done ? 'var(--accent)' : 'var(--color-steel-700)' }}
          >
            {done ? relayFooter.value : '0.0'}
            <span className="ml-1 text-sm">{relayFooter.unit}</span>
          </span>
        </div>
      </div>

      <p className="prose-body mt-8 max-w-2xl">{automationNote}</p>
    </Section>
  );
}
