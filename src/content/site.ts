/**
 * Everything a human would want to change lives here.
 * No component hard-codes a name, a link or a sentence.
 */

export const site = {
  name: 'ASHER',
  tagline: 'Design. Automate. Decide. Play.',
  /**
   * The on-page line, under the manifest. Atmosphere first, but it has to
   * leave the reader holding one fact.
   */
  description:
    'A dark room. Several screens. Four businesses running on things I built, three of which have never met me.',
  /**
   * The second on-page line. Used to be hard-coded inside `Manifest.tsx`,
   * which the README has always said was not a thing that happened here.
   */
  descriptionSub:
    'They used to move at the speed of one tired person. They are running right now and nobody in the building is thinking about it. That is the part I am proud of.',
  /**
   * The plain-language version, used for search results and link previews.
   * Somebody who has never written a line of code has to understand it in one
   * pass — that is the only job this sentence has.
   */
  summary:
    'I rebuild how a business runs: the work that waits on people moves to software, and the decisions get easier. Systems for shops, offices, and the people who own them.',
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
 * Outbound links shown on the page itself. Empty by design: the console is the
 * contact surface now, and it is reachable from the HUD at any point on the
 * page. Addresses live inside the personal file (`profile.ts`).
 */
export const links: { label: string; href: string; note: string }[] = [];

/** The three lines of the opening. Kept short on purpose. */
export const intro = ['HELLO.', "I'M ASHER.", 'I FIX HOW THINGS RUN.'] as const;

/**
 * The standing hero, under the name. Longer than the opening line on purpose —
 * this is the sentence somebody actually reads before deciding to scroll.
 *
 * `eyebrow` is the label above the name. It names the person and the work in
 * one breath and then gets out of the way; a category ("business
 * transformation") describes an industry, not a man.
 *
 * `ask` is the early hint. The site is called askAsher — a visitor should know
 * within four seconds that asking is a real option, not a form at the bottom.
 */
export const heroLines = {
  // Two segments, not three. The hairlines either side plus 0.3em tracking
  // make this line far wider than its character count suggests, and a third
  // segment wraps "answers late" onto its own line on a phone — which is where
  // essentially all of this site's traffic is.
  eyebrow: 'Builds systems · Abu Dhabi',
  lead: 'I take a business off manual and leave it running',
  sub: 'One company. Half of another. The software underneath both. Most of what I build ends up free and online, used by people who have no idea who wrote it.',
  cue: 'Scroll down to see what I do',
  /** Kept short so the one button above the fold never wraps. */
  ask: 'Ask me anything',
} as const;

/**
 * The end of the descent. Lived in `Access.tsx` as hard-coded strings, which
 * the README has always claimed was not the case anywhere on this site.
 *
 * The door lines are built from the real counts at render time — the old
 * "Ten files. Three you can open." was typed by hand and went stale the moment
 * a project moved.
 */
export const outro = {
  eyebrow: 'End of transmission',
  title: ['Still', 'building'],
  lead: 'That was the surface. Three doors. One for the person, one for the work, one where you just ask.',
  doors: {
    profile: { title: 'Who I am', line: 'The parts that are not code.' },
    work: { title: 'The work' },
    ask: { title: 'Ask me', line: 'Anything I have not answered goes to my phone.' },
  },
  hidden: 'Some of this page is hidden →',
  signature: 'built by hand',
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
    subtitle: 'Not a chatbot in the corner. Better decisions, earlier, for whoever has to make them.',
    accent: 'var(--accent-ai)',
  },
  {
    id: 'security',
    index: '04',
    title: 'SECURITY',
    subtitle: 'You are already broadcasting. Here is some of it, off your own device, while you sit there.',
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
