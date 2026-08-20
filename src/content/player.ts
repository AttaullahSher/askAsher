/**
 * The PLAYER sector. A loadout, not a scoreboard — no invented ranks or stats.
 * Each slot connects a habit from playing to a habit from building.
 */
export interface LoadoutSlot {
  id: string;
  slot: string;
  label: string;
  body: string;
}

export const loadout: LoadoutSlot[] = [
  { id: 'rotation', slot: 'PRIMARY', label: 'ROTATION', body: 'Move before the zone makes you. Everyone caught in the open left it too late.' },
  { id: 'callouts', slot: 'SECONDARY', label: 'CALLOUTS', body: 'Four words, not four sentences. Squads die waiting for somebody to finish explaining.' },
  { id: 'clutch', slot: 'UTILITY', label: 'CLUTCH', body: 'Two down, plan gone, nine seconds left. Rebuild it without stopping.' },
  { id: 'mapsense', slot: 'OPTIC', label: 'MAP SENSE', body: 'Every map is a system with rules, edges and exploits. So is every business.' },
  { id: 'rematch', slot: 'STANCE', label: 'REMATCH', body: 'Losing is information you already paid for. Read it, patch it, queue again.' },
];

/** The name on the scoreboard. Old, and still answered to. */
export const playerTag = 'ASHER GLOGS';
export const playerTagLabel = 'IGN';

export const playerTitles = ['PUBG', 'Shooters', 'Strategy', 'Racing', 'Anything ranked'];

export const playerNote =
  'The tag is old. The reflexes are not. Read the map, hold the angle, adapt or die — the version played in meeting rooms is just slower.';
