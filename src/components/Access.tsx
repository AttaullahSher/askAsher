'use client';

import { lazy, Suspense, useState } from 'react';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import { asset } from '@/lib/paths';
import { links, site } from '@/content/site';

const ProfileDialog = lazy(() =>
  import('./ProfileDialog').then((m) => ({ default: m.ProfileDialog })),
);
const WorkDialog = lazy(() => import('./WorkDialog').then((m) => ({ default: m.WorkDialog })));

type Panel = 'profile' | 'work' | null;

/**
 * The end of the descent, and the only place on the page that asks for a tap.
 * Everything above this runs on its own; everything you can open is here.
 */
export function Access() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.15 });
  const { setTerminalOpen } = useExperience();
  const [panel, setPanel] = useState<Panel>(null);

  return (
    <footer
      ref={ref}
      id="outro"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 py-20 text-center sm:px-8 sm:py-24"
    >
      <p className="hud-sm reveal mb-8" data-in={inView}>
        End of transmission
      </p>

      <h2 className="display-lg reveal" data-in={inView} style={{ ['--d' as string]: '60ms' }}>
        Still
        <br />
        building
      </h2>

      <p
        className="prose-body reveal mt-6 max-w-md text-balance"
        data-in={inView}
        style={{ ['--d' as string]: '180ms' }}
      >
        That was the surface. Two doors from here — one for the person, one for
        the work.
      </p>

      <div
        className="reveal mt-9 grid w-full max-w-2xl gap-2.5 sm:grid-cols-2"
        data-in={inView}
        style={{ ['--d' as string]: '280ms' }}
      >
        <Door
          index="01"
          title="Who I am"
          line="The parts that are not code."
          onClick={() => setPanel('profile')}
        />
        <Door
          index="02"
          title="The work"
          line="Six systems. One you can open."
          onClick={() => setPanel('work')}
        />
      </div>

      {links.length > 0 && (
        <ul
          className="reveal mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2"
          data-in={inView}
          style={{ ['--d' as string]: '380ms' }}
        >
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={asset(l.href)}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="group flex h-full flex-col items-start px-4 py-3 text-left transition-colors duration-300 sm:px-5 sm:py-3.5"
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
        className="hud-sm reveal mt-9 px-3 py-2 transition-colors hover:text-[var(--color-signal)]"
        data-in={inView}
        style={{ ['--d' as string]: '460ms' }}
      >
        Some of this page is hidden →
      </button>

      <p
        className="hud-sm reveal mt-8"
        data-in={inView}
        style={{ ['--d' as string]: '520ms', color: 'var(--color-steel-700)' }}
      >
        {site.name} · built by hand
      </p>

      {panel === 'profile' && (
        <Suspense fallback={null}>
          <ProfileDialog onClose={() => setPanel(null)} />
        </Suspense>
      )}
      {panel === 'work' && (
        <Suspense fallback={null}>
          <WorkDialog onClose={() => setPanel(null)} />
        </Suspense>
      )}
    </footer>
  );
}

function Door({
  index,
  title,
  line,
  onClick,
}: {
  index: string;
  title: string;
  line: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bracket group relative overflow-hidden px-5 py-6 text-left transition-all duration-500 sm:px-6 sm:py-8"
      style={{
        border: '1px solid color-mix(in oklab, var(--color-signal) 32%, transparent)',
        background: 'color-mix(in oklab, var(--color-signal) 5%, rgba(8,11,17,0.6))',
        ['--bracket-color' as string]: 'var(--color-signal)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background:
            'radial-gradient(120% 100% at 0% 0%, color-mix(in oklab, var(--color-signal) 16%, transparent), transparent 65%)',
        }}
      />

      <span className="hud-sm relative block" style={{ color: 'var(--color-signal)' }}>
        {index}
      </span>

      <span
        className="font-display relative mt-2.5 block text-[clamp(1.5rem,6vw,2.2rem)] font-extrabold uppercase leading-none"
        style={{ letterSpacing: '-0.01em' }}
      >
        {title}
      </span>

      <span
        className="relative mt-2 block text-xs sm:text-sm"
        style={{ color: 'var(--color-muted)' }}
      >
        {line}
      </span>

      <span className="hud-sm relative mt-4 flex items-center gap-2 transition-colors duration-300 group-hover:text-[var(--color-signal)]">
        Open
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </button>
  );
}
