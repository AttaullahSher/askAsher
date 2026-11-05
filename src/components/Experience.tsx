'use client';

import { lazy, Suspense } from 'react';
import { Atmosphere } from './Atmosphere';
import { EasterEggs } from './EasterEggs';
import { Hero } from './Hero';
import { Lab } from './site/Lab';
import { Nav } from './site/Nav';
import { Contact, Person } from './site/Person';
import { Record, Trade } from './site/Trade';
import { Work } from './site/Work';
import { useExperience } from '@/lib/experience';

const Terminal = lazy(() => import('./Terminal').then((m) => ({ default: m.Terminal })));
const AskConsole = lazy(() =>
  import('./AskConsole').then((m) => ({ default: m.AskConsole })),
);

/**
 * The page, top to bottom. Professional first — the work, the trade, the
 * record — then the lab, then the person. A recruiter can stop after the
 * third section with everything they came for; anyone who keeps going finds
 * out who he is.
 */
export function Experience() {
  const { terminalOpen, askOpen, setAskOpen } = useExperience();

  return (
    <>
      <Atmosphere />
      <Nav />

      <main data-main className="relative z-10">
        <Hero />
        <Work />
        <Trade />
        <Record />
        <Lab />
        <Person />
        <Contact />
      </main>

      <EasterEggs />

      {terminalOpen && (
        <Suspense fallback={null}>
          <Terminal />
        </Suspense>
      )}

      {askOpen && (
        <Suspense fallback={null}>
          <AskConsole onClose={() => setAskOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
