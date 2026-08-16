'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Build } from '@/content/builds';
import { asset } from '@/lib/paths';

/**
 * A build opens as a dossier rather than a page: four blocks, no scroll-jacking,
 * escape and backdrop both close it. Focus is trapped for keyboard users.
 */
export function BuildDialog({ build, onClose }: { build: Build; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      restoreTo.current?.focus();
    };
  }, [onClose]);

  // Portalled to <body>: <main> establishes its own stacking context, so a
  // dialog rendered inside it could never sit above the fixed HUD. This only
  // ever renders after a click, so `document` is always there.
  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        style={{
          background: 'rgba(2,4,7,0.86)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'fade-in 300ms ease both',
        }}
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`build-${build.id}-title`}
        tabIndex={-1}
        className="relative max-h-[88svh] w-full overflow-y-auto sm:max-w-2xl"
        style={{
          border: '1px solid var(--hud-line)',
          background: 'linear-gradient(180deg, #0c1119 0%, #070a10 100%)',
          animation: 'dialog-in 420ms var(--ease-out-expo) both',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <header
          className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 py-4 sm:px-7"
          style={{
            borderBottom: '1px solid var(--hud-line)',
            background: 'linear-gradient(180deg, #0c1119 70%, transparent)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="min-w-0">
            <p className="hud-sm" style={{ color: 'var(--color-signal)' }}>
              ● {build.status} · {build.year}
            </p>
            <h3
              id={`build-${build.id}-title`}
              className="font-display mt-1 truncate text-xl font-extrabold uppercase sm:text-2xl"
              style={{ letterSpacing: '0.02em' }}
            >
              {build.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hud-sm shrink-0 px-3 py-2 transition-colors hover:text-[var(--color-bone)]"
            style={{ border: '1px solid var(--hud-line)' }}
          >
            Close
          </button>
        </header>

        <div className="space-y-7 px-5 py-6 sm:px-7 sm:py-8">
          <Block label="What it is">
            <p className="prose-body">{build.what}</p>
          </Block>

          <Block label="Why I built it">
            <p className="prose-body">{build.why}</p>
          </Block>

          <Block label="What it does">
            <ul className="space-y-2">
              {build.does.map((d) => (
                <li key={d} className="prose-body flex gap-3">
                  <span aria-hidden style={{ color: 'var(--color-signal)' }}>
                    ›
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Block>

          <Block label="Tech used">
            <ul className="flex flex-wrap gap-2">
              {build.tech.map((t) => (
                <li
                  key={t}
                  className="hud-sm px-2 py-1"
                  style={{ border: '1px solid var(--hud-line)' }}
                >
                  {t}
                </li>
              ))}
            </ul>
          </Block>

          {build.href && (
            <a
              href={asset(build.href)}
              target={build.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="hud-sm inline-flex items-center gap-2 px-5 py-3 transition-colors"
              style={{
                border: '1px solid color-mix(in oklab, var(--color-signal) 50%, transparent)',
                color: 'var(--color-signal)',
                background: 'color-mix(in oklab, var(--color-signal) 8%, transparent)',
              }}
            >
              {build.hrefLabel ?? 'Open'} <span aria-hidden>→</span>
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="hud-sm mb-2.5" style={{ color: 'var(--color-signal)' }}>
        {label}
      </h4>
      {children}
    </section>
  );
}
