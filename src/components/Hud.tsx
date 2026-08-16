'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useExperience } from '@/lib/experience';
import { sectors, site } from '@/content/site';

/**
 * Persistent chrome: wordmark, sector rail, scroll progress and the three
 * controls that matter (sound, motion, terminal). Everything is pointer-events
 * transparent except the controls themselves.
 */
export function Hud() {
  const { entered, introPlaying, sound, toggleSound, motion, toggleMotion, setTerminalOpen } =
    useExperience();
  const [active, setActive] = useState<string>('top');
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const taps = useRef<{ n: number; t: number }>({ n: 0, t: 0 });

  const visible = entered && !introPlaying;

  // Which sector is on screen.
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-sector], #top');
    if (nodes.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(best.target.id);
      },
      { threshold: [0.15, 0.4, 0.7], rootMargin: '-20% 0px -40% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // Scroll progress, written straight to the DOM to avoid re-rendering.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const k = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${k})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Triple-tap the wordmark opens the terminal — the phone-friendly way in.
  const onMarkTap = useCallback(() => {
    const now = Date.now();
    taps.current = now - taps.current.t < 600 ? { n: taps.current.n + 1, t: now } : { n: 1, t: now };
    if (taps.current.n >= 3) {
      taps.current = { n: 0, t: 0 };
      setTerminalOpen(true);
    }
  }, [setTerminalOpen]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden={!visible}
    >
      {/* progress hairline */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px origin-left"
        style={{ background: 'var(--color-signal)', opacity: 0.7 }}
        ref={progressRef}
      />

      {/* wordmark */}
      <button
        type="button"
        onClick={onMarkTap}
        className="pointer-events-auto absolute left-4 top-4 px-1 py-1 sm:left-6 sm:top-6"
        style={{ paddingLeft: 'max(0px, env(safe-area-inset-left))' }}
        aria-label={`${site.name} — home`}
        onDoubleClick={(e) => e.preventDefault()}
      >
        <span
          className="font-display text-sm font-extrabold uppercase"
          style={{ letterSpacing: '0.34em', textIndent: '0.34em' }}
        >
          {site.name}
        </span>
      </button>

      {/* status */}
      <span
        className="hud-sm absolute right-4 top-5 sm:right-6 sm:top-7"
        style={{ paddingRight: 'max(0px, env(safe-area-inset-right))' }}
      >
        <span style={{ color: 'var(--color-signal)' }}>●</span>{' '}
        {active === 'top' ? '00' : (sectors.find((s) => s.id === active)?.index ?? '00')}
        <span style={{ opacity: 0.4 }}> / 06</span>
      </span>

      {/* sector rail — desktop only; on a phone the progress line does this job */}
      <nav
        className="pointer-events-auto absolute right-5 top-1/2 hidden -translate-y-1/2 lg:block"
        aria-label="Sectors"
      >
        <ul className="space-y-1">
          {sectors.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="group flex items-center justify-end gap-2.5 py-1.5"
                  aria-current={on ? 'true' : undefined}
                >
                  <span
                    className="hud-sm whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ color: on ? 'var(--color-bone)' : undefined }}
                  >
                    {s.title}
                  </span>
                  <span
                    className="hud-sm tabular-nums transition-colors duration-300"
                    style={{ color: on ? 'var(--color-signal)' : 'var(--color-steel-500)' }}
                  >
                    {s.index}
                  </span>
                  <span
                    aria-hidden
                    className="block h-px transition-all duration-500"
                    style={{
                      width: on ? 22 : 10,
                      background: on ? 'var(--color-signal)' : 'var(--color-steel-700)',
                    }}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* controls */}
      <div
        className="pointer-events-auto absolute bottom-4 left-4 flex items-center gap-1.5 sm:bottom-6 sm:left-6"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'max(0px, env(safe-area-inset-left))',
        }}
      >
        <Control
          label={sound ? 'Sound on' : 'Sound off'}
          active={sound}
          onClick={toggleSound}
        >
          <SoundIcon on={sound} />
        </Control>

        <Control
          label={motion === 'full' ? 'Full motion' : 'Reduced motion'}
          active={motion === 'full'}
          onClick={toggleMotion}
        >
          <MotionIcon on={motion === 'full'} />
        </Control>

        <Control label="Terminal" active={false} onClick={() => setTerminalOpen(true)}>
          <span
            className="text-[11px] font-bold"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.05em' }}
          >
            &gt;_
          </span>
        </Control>
      </div>
    </div>
  );
}

function Control({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center transition-all duration-300"
      style={{
        border: `1px solid ${active ? 'color-mix(in oklab, var(--color-signal) 55%, transparent)' : 'var(--hud-line)'}`,
        background: active
          ? 'color-mix(in oklab, var(--color-signal) 12%, rgba(4,6,10,0.6))'
          : 'rgba(4,6,10,0.55)',
        color: active ? 'var(--color-signal)' : 'var(--color-muted)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {children}
    </button>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M2 5.5h2.5L7.5 3v9L4.5 9.5H2z" fill="currentColor" />
      {on ? (
        <>
          <path d="M9.8 5.4a3 3 0 010 4.2" stroke="currentColor" strokeWidth="1.1" />
          <path d="M11.6 3.6a5.6 5.6 0 010 7.8" stroke="currentColor" strokeWidth="1.1" />
        </>
      ) : (
        <path d="M10 6l3.5 3.5M13.5 6L10 9.5" stroke="currentColor" strokeWidth="1.1" />
      )}
    </svg>
  );
}

function MotionIcon({ on }: { on: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="2" fill="currentColor" />
      {on && (
        <>
          <circle cx="7.5" cy="7.5" r="4.6" stroke="currentColor" strokeWidth="1" opacity="0.65" />
          <circle cx="7.5" cy="7.5" r="6.8" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </>
      )}
      {!on && <path d="M1.5 13.5l12-12" stroke="currentColor" strokeWidth="1.1" />}
    </svg>
  );
}
