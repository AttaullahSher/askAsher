'use client';

import { useEffect, useState } from 'react';

export interface ToastMessage {
  id: number;
  title: string;
  body?: string;
}

export function ToastStack({ items }: { items: ToastMessage[] }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-5 sm:bottom-8"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-live="polite"
    >
      {items.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}

function Toast({ toast }: { toast: ToastMessage }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="bracket w-full max-w-sm px-4 py-3 transition-all duration-500"
      style={{
        border: '1px solid color-mix(in oklab, var(--color-signal) 42%, transparent)',
        background: 'rgba(6,9,14,0.92)',
        backdropFilter: 'blur(8px)',
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(12px)',
        transitionTimingFunction: 'var(--ease-out-expo)',
        ['--bracket-color' as string]: 'var(--color-signal)',
      }}
    >
      <p className="hud-sm" style={{ color: 'var(--color-signal)' }}>
        {toast.title}
      </p>
      {toast.body && (
        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          {toast.body}
        </p>
      )}
    </div>
  );
}
