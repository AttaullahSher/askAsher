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
  { id: 'tactics', slot: 'PRIMARY', label: 'TACTICAL THINKING', body: 'Position before engagement. Most fights are decided before anyone fires — same with architecture.' },
  { id: 'reaction', slot: 'SECONDARY', label: 'REACTION', body: 'Information arrives incomplete and late. Decide anyway, then correct fast.' },
  { id: 'adapt', slot: 'UTILITY', label: 'ADAPTATION', body: 'The plan survives contact for about nine seconds. Rebuild it without stopping.' },
  { id: 'systems', slot: 'OPTIC', label: 'SYSTEMS', body: 'Every map is a system with rules, edges and exploits. So is every codebase.' },
  { id: 'compete', slot: 'STANCE', label: 'COMPETITION', body: 'Losing is a diff. Read it, patch it, queue again.' },
];

export const playerTitles = ['PUBG', 'Extraction', 'Strategy', 'Sim', 'Competitive'];

export const playerNote =
  'Gaming is not the identity. It is where the reflexes were trained — read the map, hold the angle, adapt or die.';
