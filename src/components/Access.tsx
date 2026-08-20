'use client';

import { lazy, Suspense, useState } from 'react';
import { CurveMark, CurveRule } from './Curve';
import { useInView } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';
import { asset } from '@/lib/paths';
import { answers } from '@/content/answers';
import { projects } from '@/content/projects';
import { links, outro, site } from '@/content/site';

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
  const { setTerminalOpen, setAskOpen } = useExperience();
  const [panel, setPanel] = useState<Panel>(null);

  // Counted, never typed. The old line said "Ten files. Three you can open."
  const openable = projects.filter((p) => p.href).length;

  return (
    <footer
      ref={ref}
      id="outro"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 py-20 text-center sm:px-8 sm:py-24"
    >
      <CurveMark
        className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-40 -translate-x-1/2 -translate-y-1/2"
        opacity={0.07}
      />

      <p className="hud-sm reveal mb-8" data-in={inView}>
        {outro.eyebrow}
      </p>

      <h2 className="display-lg reveal" data-in={inView} style={{ ['--d' as string]: '60ms' }}>
        {outro.title[0]}
        <br />
        {outro.title[1]}
      </h2>

      <CurveRule
        className="reveal mt-5 w-full max-w-sm"
        style={{ ['--d' as string]: '140ms' }}
      />

      <p
        className="prose-body reveal mt-4 max-w-md text-balance"
        data-in={inView}
        style={{ ['--d' as string]: '180ms' }}
      >
        {outro.lead}
      </p>

      <div
        className="reveal mt-9 grid w-full max-w-3xl gap-2.5 sm:grid-cols-3"
        data-in={inView}
        style={{ ['--d' as string]: '280ms' }}
      >
        <Door
          index="01"
          title={outro.doors.profile.title}
          line={outro.doors.profile.line}
          onClick={() => setPanel('profile')}
        />
        <Door
          index="02"
          title={outro.doors.work.title}
          line={`${projects.length} files. ${openable} you can open.`}
          onClick={() => setPanel('work')}
        />
        <Door
          index="03"
          title={outro.doors.ask.title}
          line={`${answers.length} answers written. ${outro.doors.ask.line}`}
          onClick={() => setAskOpen(true)}
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
        {outro.hidden}
      </button>

      <p
        className="hud-sm reveal mt-8"
        data-in={inView}
        style={{ ['--d' as string]: '520ms', color: 'var(--color-steel-700)' }}
      >
        {site.name} · {outro.signature}
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
