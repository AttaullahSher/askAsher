'use client';

import { useEffect, useState } from 'react';
import { useExperience } from '@/lib/experience';
import { sections, site } from '@/content/site';

/**
 * Fixed top bar. Transparent over the hero, a solid smoked strip once the page
 * moves. The Ask button is always one tap away — the site is called askAsher.
 */
export function Nav() {
  const { setAskOpen, sound, toggleSound, motion, toggleMotion } = useExperience();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 transition-colors duration-500"
      style={{
        background: solid ? 'rgba(4,6,10,0.82)' : 'transparent',
        backdropFilter: solid ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: solid ? 'blur(12px)' : undefined,
        borderBottom: `1px solid ${solid ? 'var(--hud-line)' : 'transparent'}`,
      }}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-5 sm:px-8" aria-label="Main">
        <a href="#top" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span
            className="h-2 w-2 rotate-45"
            style={{ background: 'var(--color-signal)', boxShadow: '0 0 12px var(--color-signal)' }}
          />
          <span className="font-display text-sm font-extrabold tracking-[0.32em] text-[var(--color-hot)]">
            {site.name}
          </span>
        </a>

        <ul className="ml-6 hidden items-center gap-6 md:flex">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="hud transition-colors duration-300 hover:text-[var(--color-hot)]"
                style={{ letterSpacing: '0.24em' }}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className="hud hidden px-2 py-2 transition-colors hover:text-[var(--color-hot)] sm:inline-flex"
            aria-pressed={sound}
            title="Ambient sound"
          >
            Sound {sound ? 'on' : 'off'}
          </button>
          <button
            type="button"
            onClick={() => setAskOpen(true)}
            className="font-display px-3.5 py-2 text-[0.7rem] font-bold uppercase transition-all duration-300 hover:bg-[var(--color-signal)] hover:text-[var(--color-void)]"
            style={{
              letterSpacing: '0.22em',
              color: 'var(--color-signal)',
              border: '1px solid color-mix(in oklab, var(--color-signal) 60%, transparent)',
            }}
          >
            Ask me
          </button>
          <button
            type="button"
            className="hud px-2 py-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-sheet"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </nav>

      {open && (
        <div id="nav-sheet" className="md:hidden" style={{ borderTop: '1px solid var(--hud-line)' }}>
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 py-4">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-3 py-3"
                >
                  <span className="hud-sm" style={{ color: 'var(--color-signal)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-base font-bold uppercase tracking-[0.12em]">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mx-auto flex max-w-6xl gap-5 px-5 pb-4">
            <button type="button" className="hud" onClick={toggleSound} aria-pressed={sound}>
              Sound {sound ? 'on' : 'off'}
            </button>
            <button type="button" className="hud" onClick={toggleMotion} aria-pressed={motion === 'reduced'}>
              Motion {motion === 'full' ? 'on' : 'off'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
