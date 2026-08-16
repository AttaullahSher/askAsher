'use client';

import { lazy, Suspense } from 'react';
import { Access } from './Access';
import { Atmosphere } from './Atmosphere';
import { EasterEggs } from './EasterEggs';
import { Gate } from './Gate';
import { Hero } from './Hero';
import { Hud } from './Hud';
import { Manifest } from './Manifest';
import { AiSector } from './sectors/AiSector';
import { AutomationSector } from './sectors/AutomationSector';
import { CodeSector } from './sectors/CodeSector';
import { PlayerSector } from './sectors/PlayerSector';
import { SecuritySector } from './sectors/SecuritySector';
import { useExperience } from '@/lib/experience';
import { sectors } from '@/content/site';

const Terminal = lazy(() => import('./Terminal').then((m) => ({ default: m.Terminal })));

const byId = Object.fromEntries(sectors.map((s) => [s.id, s]));

export function Experience() {
  const { terminalOpen, entered } = useExperience();

  return (
    <>
      <Atmosphere />

      {/*
        Held back until the gate is dismissed. The gate is deliberately
        translucent so the drop zone stays visible behind it — which also means
        anything else on the page would show through it.
      */}
      <main
        data-main
        className="relative z-10 transition-opacity duration-700"
        style={{ opacity: entered ? 1 : 0 }}
      >
        <Hero />
        <Manifest />
        {byId.code && <CodeSector sector={byId.code} />}
        {byId.automation && <AutomationSector sector={byId.automation} />}
        {byId.ai && <AiSector sector={byId.ai} />}
        {byId.security && <SecuritySector sector={byId.security} />}
        {byId.player && <PlayerSector sector={byId.player} />}
        <Access />
      </main>

      <Hud />
      <Gate />
      <EasterEggs />

      {terminalOpen && (
        <Suspense fallback={null}>
          <Terminal />
        </Suspense>
      )}
    </>
  );
}
