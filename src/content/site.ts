/**
 * Everything a human would want to change lives here.
 * No component hard-codes a name, a link or a sentence.
 */

export const site = {
  name: 'ASHER',
  fullName: 'Attaullah Sher',
  tagline: 'Operations. Systems. AI.',
  /**
   * The plain-language version, used for search results and link previews.
   * Somebody who has never written a line of code has to understand it in one
   * pass — that is the only job this sentence has.
   */
  summary:
    'Attaullah Sher (Asher) takes businesses off manual. Fifteen years of procurement and operations in Abu Dhabi, and six live business systems built through AI-assisted software development.',
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
 * The page, top to bottom. The nav, the hidden terminal's `sections` command
 * and the anchors all read this list, so a section renamed here is renamed
 * everywhere.
 */
export const sections = [
  { id: 'work', label: 'Work' },
  { id: 'trade', label: 'Trade' },
  { id: 'record', label: 'Record' },
  { id: 'lab', label: 'Lab' },
  { id: 'person', label: 'Person' },
  { id: 'contact', label: 'Contact' },
] as const;

export type SectionId = (typeof sections)[number]['id'];

/**
 * The hero. Visible the moment the page opens — no gate, no cinematic to sit
 * through. A recruiter on a laptop and somebody arriving from Instagram on a
 * phone get the same thing in the first second: the name, what he does, and
 * proof that it is real.
 */
export const hero = {
  eyebrow: 'Abu Dhabi · Operations · AI',
  lead: 'I take a business off manual and leave it running.',
  sub: 'Fifteen years running procurement and operations in Abu Dhabi. Then I built the software the business runs on, myself.',
  primary: 'See the work',
  ask: 'Ask me anything',
  /** Four numbers, every one of them checkable. */
  stats: [
    { value: '15', unit: 'yrs', label: 'UAE procurement & operations' },
    { value: '6', unit: 'live', label: 'business systems built' },
    { value: '24/7', unit: '', label: 'AI on WhatsApp, Instagram, Facebook' },
    { value: '0.2', unit: 's', label: 'till load, down from 20' },
  ],
} as const;

/** The end of the page. */
export const outro = {
  eyebrow: 'Contact',
  title: ['Say', 'something'],
  lead: 'Work, a question, or just curiosity. The console answers what it can and sends the rest to my phone.',
  signature: 'Designed and built by hand. No template.',
  hidden: 'Some of this page is hidden.',
} as const;
