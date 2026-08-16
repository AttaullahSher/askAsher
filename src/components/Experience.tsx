'use client';

import { lazy, Suspense } from 'react';
import { Atmosphere } from './Atmosphere';
import { EasterEggs } from './EasterEggs';
import { Gate } from './Gate';
import { Hero } from './Hero';
import { Hud } from './Hud';
import { Manifest } from './Manifest';
import { Outro } from './Outro';
import { AiSector } from './sectors/AiSector';
import { AutomationSector } from './sectors/AutomationSector';
import { BuildsSector } from './sectors/BuildsSector';
import { CodeSector } from './sectors/CodeSector';
import { PlayerSector } from './sectors/PlayerSector';
import { SecuritySector } from './sectors/SecuritySector';
import { useExperience } from '@/lib/experience';
import { sectors } from '@/content/site';

const Terminal = lazy(() => import('./Terminal').then((m) => ({ default: m.Terminal })));

const byId = Object.fromEntries(sectors.map((s) => [s.id, s]));

export function Experience() {
  const { terminalOpen } = useExperience();

  return (
    <>
      <Atmosphere />

      <main className="relative z-10">
        <Hero />
        <Manifest />
        {byId.code && <CodeSector sector={byId.code} />}
        {byId.automation && <AutomationSector sector={byId.automation} />}
        {byId.ai && <AiSector sector={byId.ai} />}
        {byId.security && <SecuritySector sector={byId.security} />}
        {byId.builds && <BuildsSector sector={byId.builds} />}
        {byId.player && <PlayerSector sector={byId.player} />}
        <Outro />
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
