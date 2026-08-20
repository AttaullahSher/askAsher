'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * The frame both consoles sit in.
 *
 * There are two of these on the site now — the hidden shell you have to find,
 * and the ask console on the front door — and they were within a few pixels of
 * being the same component twice. Everything genuinely shared lives here: the
 * backdrop, the panel, the scrollback with its autoscroll, the Escape handler,
 * the scroll lock, and the input with arrow-key recall.
 *
 * What each console does with a submitted line is the only part that differs,
 * and that is exactly what `onSubmit` is for.
 */
export function ConsoleShell({
  label,
  title,
  status,
  placeholder,
  inputLabel = 'Message',
  onClose,
  onSubmit,
  scrollKey,
  below,
  children,
}: {
  /** Accessible name for the dialog. */
  label: string;
  /** Header text, left. */
  title: string;
  /** Optional header node, right of the title. */
  status?: ReactNode;
  placeholder: string;
  inputLabel?: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
  /** Changes whenever the scrollback grows, so the body can follow it down. */
  scrollKey: unknown;
  /** Sits between the scrollback and the input — chips, a relay form. */
  below?: ReactNode;
  children: ReactNode;
}) {
  const [value, setValue] = useState('');
  const [recall, setRecall] = useState<string[]>([]);
  const [recallAt, setRecallAt] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 120);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [scrollKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = () => {
    const text = value.trim();
    setValue('');
    if (!text) return;
    setRecall((r) => [text, ...r].slice(0, 30));
    setRecallAt(-1);
    onSubmit(text);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center sm:justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: 'rgba(2,4,7,0.82)', backdropFilter: 'blur(4px)' }}
        tabIndex={-1}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="scanlines relative flex h-[76svh] w-full flex-col overflow-hidden sm:h-[34rem] sm:max-w-2xl"
        style={{
          border: '1px solid color-mix(in oklab, var(--color-signal) 30%, transparent)',
          background: 'linear-gradient(180deg, rgba(7,10,15,0.97), rgba(3,5,8,0.97))',
          animation: 'dialog-in 340ms var(--ease-out-expo) both',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div
          className="flex items-center justify-between gap-3 px-3 py-2"
          style={{ borderBottom: '1px solid var(--hud-line)' }}
        >
          <span className="hud-sm" style={{ color: 'var(--color-signal)' }}>
            {title}
          </span>
          <div className="flex items-center gap-2">
            {status}
            <button
              type="button"
              onClick={onClose}
              className="hud-sm px-2 py-1 transition-colors hover:text-[var(--color-bone)]"
            >
              esc
            </button>
          </div>
        </div>

        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto px-3 py-3"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.65 }}
          onClick={() => inputRef.current?.focus()}
        >
          {children}
        </div>

        {below}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-2 px-3 py-2.5 focus-within:bg-[rgba(255,138,31,0.04)]"
          style={{
            borderTop: '1px solid color-mix(in oklab, var(--color-signal) 26%, transparent)',
          }}
        >
          <span style={{ color: 'var(--color-signal)', fontFamily: 'var(--font-mono)' }}>›</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                const at = Math.min(recallAt + 1, recall.length - 1);
                if (at >= 0) {
                  setRecallAt(at);
                  setValue(recall[at] ?? '');
                }
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const at = recallAt - 1;
                setRecallAt(at);
                setValue(at >= 0 ? (recall[at] ?? '') : '');
              }
            }}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            aria-label={inputLabel}
            placeholder={placeholder}
            maxLength={400}
            // The caret is the focus indicator here; a ring around the only
            // control in a shell reads as an error state.
            className="w-full bg-transparent outline-none focus-visible:outline-none"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px', // 16px stops iOS zooming the whole page on focus
              color: 'var(--color-hot)',
            }}
          />
        </form>
      </div>
    </div>
  );
}
