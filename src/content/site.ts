/**
 * Everything a human would want to change lives here.
 * No component hard-codes a name, a link or a sentence.
 */

export const site = {
  name: 'ASHER',
  tagline: 'Code. Create. Automate. Play.',
  description:
    'A digital playground for the things I build, break, automate and experiment with.',
  /** Used for canonical URLs and Open Graph. Change this if you move the site. */
  url: 'https://attaullahsher.github.io/askAsher/',
  locale: 'en',
} as const;

/**
 * Outbound links. Leave a value as an empty string and its chip simply will not
 * render — no dead links, no placeholder URLs pointing nowhere.
 */
export const links: { label: string; href: string; note: string }[] = [
  { label: 'GitHub', href: 'https://github.com/attaullahsher', note: 'source, experiments' },
  { label: 'ASK', href: 'ask/', note: 'live assistant — built here' },
  // { label: 'Instagram', href: 'https://instagram.com/YOUR_HANDLE', note: '' },
  // { label: 'Email',     href: 'mailto:you@example.com',            note: '' },
].filter((l) => l.href.length > 0);

/** The three lines of the opening. Kept short on purpose. */
export const intro = ['HELLO.', "I'M ASHER.", 'I BUILD THINGS.'] as const;

export type SectorId = 'code' | 'automation' | 'ai' | 'security' | 'builds' | 'player';

export interface Sector {
  id: SectorId;
  index: string;
  title: string;
  subtitle: string;
  /** CSS custom-property name from the theme — keeps colour out of components. */
  accent: string;
}

export const sectors: Sector[] = [
  {
    id: 'code',
    index: '01',
    title: 'CODE',
    subtitle: 'The raw material. Languages, runtimes and the glue between them.',
    accent: 'var(--accent-code)',
  },
  {
    id: 'automation',
    index: '02',
    title: 'AUTOMATION',
    subtitle: 'If a person does it twice, it should not need a person the third time.',
    accent: 'var(--accent-automation)',
  },
  {
    id: 'ai',
    index: '03',
    title: 'AI',
    subtitle: 'Models as components, not magic. Wired into things that already run.',
    accent: 'var(--accent-ai)',
  },
  {
    id: 'security',
    index: '04',
    title: 'SECURITY',
    subtitle: 'Ethical security. Curiosity with boundaries.',
    accent: 'var(--accent-security)',
  },
  {
    id: 'builds',
    index: '05',
    title: 'BUILDS',
    subtitle: 'Things that exist and are being used.',
    accent: 'var(--accent-builds)',
  },
  {
    id: 'player',
    index: '06',
    title: 'PLAYER',
    subtitle: 'Where the reflexes come from.',
    accent: 'var(--accent-player)',
  },
];
