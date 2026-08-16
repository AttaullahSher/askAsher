'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * The modal shell both end-of-page panels sit in.
 *
 * Portalled to <body> because <main> establishes its own stacking context — a
 * dialog rendered inside it can never sit above the fixed HUD. Escape and the
 * backdrop both close; focus is trapped and restored.
 */
export function Overlay({
  label,
  eyebrow,
  title,
  onClose,
  children,
  onBack,
}: {
  label: string;
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  onBack?: () => void;
}) {
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
      // Inputs belong in here too — the personal file has a form in it, and
      // leaving them out lets Tab walk straight out of a modal dialog.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
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

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 h-full w-full cursor-default"
        style={{
          background: 'rgba(2,4,7,0.88)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'fade-in 300ms ease both',
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
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
            background: 'linear-gradient(180deg, #0c1119 72%, transparent)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="min-w-0">
            <p className="hud-sm" style={{ color: 'var(--color-signal)' }}>
              {eyebrow}
            </p>
            <h3
              className="font-display mt-1 truncate text-xl font-extrabold uppercase sm:text-2xl"
              style={{ letterSpacing: '0.02em' }}
            >
              {title}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="hud-sm px-3 py-2 transition-colors hover:text-[var(--color-bone)]"
                style={{ border: '1px solid var(--hud-line)' }}
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="hud-sm px-3 py-2 transition-colors hover:text-[var(--color-bone)]"
              style={{ border: '1px solid var(--hud-line)' }}
            >
              Close
            </button>
          </div>
        </header>

        <div className="px-5 py-6 sm:px-7 sm:py-8">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Labelled block used inside both panels. */
export function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="hud-sm mb-2.5" style={{ color: 'var(--color-signal)' }}>
        {label}
      </h4>
      {children}
    </section>
  );
}
