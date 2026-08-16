'use client';

import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import { asset } from '@/lib/paths';
import { links, site } from '@/content/site';

/**
 * The close. One line, the links, and a nudge toward the things still hidden.
 */
export function Outro() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 });
  const { setTerminalOpen } = useExperience();

  return (
    <footer
      ref={ref}
      id="outro"
      className="relative flex min-h-[85svh] flex-col items-center justify-center px-5 py-24 text-center sm:px-8"
    >
      <p className="hud-sm reveal mb-8" data-in={inView}>
        End of transmission
      </p>

      <h2
        className="display-lg reveal"
        data-in={inView}
        style={{ ['--d' as string]: '80ms' }}
      >
        Still
        <br />
        building
      </h2>

      <div
        className="reveal-wipe rule mt-9 w-full max-w-sm"
        data-in={inView}
        style={{ ['--d' as string]: '200ms' }}
      />

      <p
        className="prose-body reveal mt-8 max-w-md text-balance"
        data-in={inView}
        style={{ ['--d' as string]: '280ms' }}
      >
        Everything here was made because it was more interesting to build it than
        to explain why it could not be built.
      </p>

      {links.length > 0 && (
        <ul
          className="reveal mt-12 flex flex-wrap items-center justify-center gap-2"
          data-in={inView}
          style={{ ['--d' as string]: '380ms' }}
        >
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={asset(l.href)}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="group flex flex-col items-start px-5 py-3 text-left transition-colors duration-300"
                style={{ border: '1px solid var(--hud-line)' }}
              >
                <span
                  className="font-display text-xs font-bold uppercase transition-colors duration-300 group-hover:text-[var(--color-signal)]"
                  style={{ letterSpacing: '0.24em' }}
                >
                  {l.label}
                </span>
                {l.note && (
                  <span className="hud-sm mt-1" style={{ letterSpacing: '0.14em' }}>
                    {l.note}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setTerminalOpen(true)}
        className="hud-sm reveal mt-14 px-3 py-2 transition-colors hover:text-[var(--color-signal)]"
        data-in={inView}
        style={{ ['--d' as string]: '460ms', color: 'var(--color-steel-500)' }}
      >
        You have not found everything yet →
      </button>

      <p
        className="hud-sm reveal mt-10"
        data-in={inView}
        style={{ ['--d' as string]: '520ms', color: 'var(--color-steel-700)' }}
      >
        {site.name} · built by hand
      </p>
    </footer>
  );
}
