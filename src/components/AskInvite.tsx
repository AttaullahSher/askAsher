'use client';

import { useExperience } from '@/lib/experience';
import { answers, askInvite } from '@/content/answers';

/**
 * The end of the personal file.
 *
 * This replaces `Appreciation` — a heart button whose counter started at 257
 * and then only ever incremented inside the visitor's own browser, sitting
 * above a 140-character note that nothing came back from. Invented social
 * proof is the one thing on a page a sharp reader checks twice, and a number
 * that never moves fails that check immediately.
 *
 * What is here instead is a door. The relay it opens is the same FormSubmit
 * endpoint the note used, so nothing was lost except the fiction.
 */
export function AskInvite({ onClose }: { onClose: () => void }) {
  const { setAskOpen } = useExperience();

  return (
    <section
      className="mt-2 px-5 py-6 text-center"
      style={{
        border: '1px solid color-mix(in oklab, var(--color-signal) 26%, transparent)',
        background: 'color-mix(in oklab, var(--color-signal) 4%, transparent)',
      }}
    >
      <h4
        className="font-display text-lg font-extrabold uppercase"
        style={{ letterSpacing: '0.08em', color: 'var(--color-signal)' }}
      >
        {askInvite.title}
      </h4>

      <p className="prose-body mx-auto mt-2 max-w-sm text-balance">{askInvite.body}</p>

      <button
        type="button"
        // The console is a higher layer than this dialog; stacking one modal on
        // another traps focus in the wrong place and leaves two Escape targets.
        onClick={() => {
          onClose();
          setAskOpen(true);
        }}
        className="hud-sm mt-5 px-4 py-2.5 transition-colors hover:text-[var(--color-signal)]"
        style={{
          border: '1px solid color-mix(in oklab, var(--color-signal) 50%, transparent)',
          color: 'var(--color-signal)',
          background: 'color-mix(in oklab, var(--color-signal) 8%, transparent)',
        }}
      >
        {askInvite.cta} →
      </button>

      <p className="hud-sm mt-3" style={{ color: 'var(--color-steel-500)' }}>
        {answers.length} answers written by hand
      </p>
    </section>
  );
}
