'use client';

import { useEffect, useState } from 'react';
import { Section } from '@/components/Section';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import {
  automated,
  automationLead,
  automationNote,
  manual,
} from '@/content/automation';
import type { Sector } from '@/content/site';

const STEP_MS = 620;
const GAP_MS = 900;
const HOLD_MS = 3200;

const TOTAL = manual.reduce((n, s) => n + s.cost, 0);

/**
 * The same job, twice, on one screen.
 *
 * The manual side accumulates in real time and you feel it stack up; the
 * automated side resolves in one pass. The gap between the two numbers is the
 * whole argument, and it makes it without a paragraph.
 */
export function AutomationSector({ sector }: { sector: Sector }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: false });
  const { motion } = useExperience();

  /** -1 before the run, 0..n-1 through the manual steps, n once machine-side. */
  const [cursor, setCursor] = useState(-1);
  const running = inView && motion === 'full';

  useEffect(() => {
    if (!running) return;

    let i = -1;
    let timer = 0;

    const tick = () => {
      i += 1;
      if (i > manual.length) {
        timer = window.setTimeout(() => {
          i = -1;
          setCursor(-1);
          tick();
        }, HOLD_MS);
        return;
      }
      setCursor(i);
      timer = window.setTimeout(tick, i === manual.length - 1 ? GAP_MS : STEP_MS);
    };

    timer = window.setTimeout(tick, 400);
    return () => {
      window.clearTimeout(timer);
      setCursor(-1);
    };
  }, [running]);

  // Paused or reduced motion: show the finished comparison rather than a blank.
  const step = running ? cursor : manual.length;
  const machineOn = step >= manual.length;
  const spent = manual.slice(0, Math.max(0, step + 1)).reduce((n, s) => n + s.cost, 0);

  return (
    <Section sector={sector}>
      <p className="hud-sm mb-6">{automationLead}</p>

      <div ref={ref} className="grid gap-3 lg:grid-cols-2">
        {/* ---------------------------------------------------------- by hand */}
        <div
          className="relative overflow-hidden px-5 py-5"
          style={{
            border: '1px solid var(--hud-line)',
            background: 'color-mix(in oklab, var(--color-smoke) 42%, transparent)',
          }}
        >
          <header className="mb-4 flex items-baseline justify-between gap-3">
            <span className="hud-sm">By hand</span>
            <span
              className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl"
              style={{ color: 'var(--color-steel-500)' }}
            >
              {spent}
              <span className="ml-1 text-sm">min</span>
            </span>
          </header>

          <ol className="space-y-2.5">
            {manual.map((s, i) => {
              const done = step >= i;
              return (
                <li
                  key={s.text}
                  className="flex items-start gap-3 transition-all duration-500"
                  style={{
                    opacity: done ? 1 : 0.22,
                    transform: done ? 'none' : 'translateX(-4px)',
                  }}
                >
                  <span
                    aria-hidden
                    className="mt-1.5 block h-1.5 w-1.5 shrink-0 transition-colors duration-500"
                    style={{
                      background: done ? 'var(--color-steel-500)' : 'var(--color-steel-700)',
                    }}
                  />
                  <span
                    className="min-w-0 flex-1 text-xs leading-relaxed sm:text-sm"
                    style={{ color: done ? 'var(--color-muted)' : 'var(--color-steel-700)' }}
                  >
                    {s.text}
                  </span>
                  <span
                    className="hud-sm shrink-0 tabular-nums"
                    style={{ color: 'var(--color-steel-700)' }}
                  >
                    {s.cost}m
                  </span>
                </li>
              );
            })}
          </ol>

          {/* the bar quietly filling up behind the argument */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-500"
            style={{
              background: 'var(--color-steel-500)',
              transform: `scaleX(${Math.min(1, spent / TOTAL)})`,
            }}
          />
        </div>

        {/* -------------------------------------------------------- automated */}
        <div
          className="relative flex flex-col justify-between overflow-hidden px-5 py-5 transition-all duration-700"
          style={{
            border: `1px solid ${machineOn ? 'var(--accent)' : 'var(--hud-line)'}`,
            background: machineOn
              ? 'color-mix(in oklab, var(--accent) 9%, transparent)'
              : 'color-mix(in oklab, var(--color-smoke) 42%, transparent)',
            boxShadow: machineOn
              ? '0 0 40px color-mix(in oklab, var(--accent) 18%, transparent)'
              : 'none',
          }}
        >
          <header className="mb-4 flex items-baseline justify-between gap-3">
            <span className="hud-sm" style={{ color: machineOn ? 'var(--accent)' : undefined }}>
              Automated
            </span>
            <span
              className="font-display text-2xl font-extrabold tabular-nums transition-colors duration-700 sm:text-3xl"
              style={{ color: machineOn ? 'var(--accent)' : 'var(--color-steel-700)' }}
            >
              {machineOn ? automated.cost : '0.0'}
              <span className="ml-1 text-sm">sec</span>
            </span>
          </header>

          <p
            className="font-display text-[clamp(1.1rem,4.5vw,1.7rem)] font-bold uppercase leading-tight transition-all duration-700"
            style={{
              letterSpacing: '0.02em',
              color: machineOn ? 'var(--color-hot)' : 'var(--color-steel-700)',
              opacity: machineOn ? 1 : 0.5,
            }}
          >
            {automated.line}
          </p>

          <div className="mt-6">
            <span
              aria-hidden
              className="block h-px w-full overflow-hidden"
              style={{ background: 'var(--hud-line)' }}
            >
              <span
                className="block h-px origin-left"
                style={{
                  background: 'var(--accent)',
                  transform: `scaleX(${machineOn ? 1 : 0})`,
                  transition: 'transform 900ms var(--ease-out-expo)',
                }}
              />
            </span>
            <p
              className="hud-sm mt-3 transition-opacity duration-700"
              style={{ opacity: machineOn ? 1 : 0.25 }}
            >
              {machineOn ? 'Nobody opened a spreadsheet' : 'Waiting'}
            </p>
          </div>
        </div>
      </div>

      <p className="prose-body mt-8 max-w-2xl">{automationNote}</p>
    </Section>
  );
}
