/**
 * Everything a human would want to change lives here.
 * No component hard-codes a name, a link or a sentence.
 */

export const site = {
  name: 'ASHER',
  tagline: 'Code. Create. Automate. Play.',
  description:
    'A dark room, several screens, and whatever refused to stay solved. This is the part I let people see.',
  /** Used for canonical URLs and Open Graph. Change this if you move the site. */
  url: 'https://attaullahsher.github.io/askAsher/',
  locale: 'en',
} as const;

/**
 * Ambient sound.
 *
 * `track: null` — the browser synthesises an original cinematic drone with the
 * Web Audio API. Nothing to ship, nothing to licence. This is the default.
 *
 * `track: 'audio/ambient.mp3'` — drop a file at `public/audio/ambient.mp3`, set
 * this to its path, and it is used instead. Use something you own or something
 * licensed for the purpose. If it fails to load, the drone takes over.
 */
export const audio: { track: string | null } = {
  track: null,
};

/**
 * Outbound links shown on the page itself. Empty by design: contact lives
 * inside the personal file (`profile.ts`), so you get it after you have read
 * something rather than before.
 */
export const links: { label: string; href: string; note: string }[] = [];

/** The three lines of the opening. Kept short on purpose. */
export const intro = ['HELLO.', "I'M ASHER.", 'I BUILD THINGS.'] as const;

/**
 * The standing hero, under the name. Longer than the opening line on purpose —
 * this is the sentence somebody actually reads before deciding to scroll.
 */
export const heroLines = {
  lead: 'I build the things you never notice working',
  sub: 'Shops, documents, data, and a few that exist only because somebody said it could not be done at three in the morning.',
  cue: 'Scroll down to see what I do',
} as const;

export type SectorId = 'code' | 'automation' | 'ai' | 'security' | 'player';

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
    subtitle: 'The raw material. Nothing here was learned from a course.',
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
    subtitle: 'Everything is more open than its owner thinks. That is a reason to be careful, not clever.',
    accent: 'var(--accent-security)',
  },
  {
    id: 'player',
    index: '05',
    title: 'PLAYER',
    subtitle: 'Where the reflexes were trained. They never left.',
    accent: 'var(--accent-player)',
  },
];
