/**
 * The BUILDS sector — real things only.
 *
 * Rule for this file: no invented metrics, no awards, no client logos, no
 * superlatives. If a build cannot be described honestly in four short blocks,
 * it does not belong here yet.
 */
export interface Build {
  id: string;
  title: string;
  /** One line shown on the closed card. */
  blurb: string;
  status: 'LIVE' | 'INTERNAL' | 'EXPERIMENT';
  year: string;
  what: string;
  why: string;
  does: string[];
  tech: string[];
  /** Optional. Relative paths are resolved against the site base path. */
  href?: string;
  hrefLabel?: string;
}

export const builds: Build[] = [
  {
    id: 'ask',
    title: 'ASK',
    blurb: 'A personal assistant that belongs to whoever opens it.',
    status: 'LIVE',
    year: '2025',
    what: 'A browser-only assistant with durable memory, goal tracking, voice in and out, and an automatic fallback chain across open models. No backend, no build step, no account.',
    why: 'Every assistant worth using wants a login and a subscription first. I wanted one that works the second the page loads, keeps its memory on the device, and belongs to the person holding the phone.',
    does: [
      'Remembers durable facts about you and shows every one of them, deletable.',
      'Tracks what you are working toward and points answers back at it.',
      'Talks and listens using the browser’s own speech engine — offline capable.',
      'Falls through a chain of models when one refuses or rate-limits.',
    ],
    tech: ['Vanilla JS', 'Web Speech API', 'Service Worker', 'LocalStorage', 'Open model APIs'],
    href: 'ask/',
    hrefLabel: 'Open it',
  },
  {
    id: 'quote-engine',
    title: 'QUOTATION ENGINE',
    blurb: 'Customer message in, priced quotation out.',
    status: 'INTERNAL',
    year: '2024 —',
    what: 'The pipeline in sector 02, built for a real retail business: an unstructured enquiry becomes a matched, priced, formatted quotation, and an invoice when it is accepted.',
    why: 'The same request arrived a hundred times a week in a hundred different shapes, and every one of them cost somebody twenty minutes and a spreadsheet.',
    does: [
      'Pulls items and intent out of free text and voice notes.',
      'Matches against the live catalogue and flags what it is unsure about.',
      'Applies tiered pricing rules rather than guessing at them.',
      'Renders the document and files the record without a human step.',
    ],
    tech: ['TypeScript', 'Node', 'Google Apps Script', 'LLM APIs', 'PDF generation'],
  },
  {
    id: 'catalogue',
    title: 'CATALOGUE SYNC',
    blurb: 'One product truth, many storefronts.',
    status: 'INTERNAL',
    year: '2024 —',
    what: 'Internal tooling that keeps product data consistent across a website and several marketplaces, and tells a human the moment they disagree.',
    why: 'Listings drift. A price fixed in one place stays wrong in four others, and nobody notices until a customer does.',
    does: [
      'Holds a single canonical record per product.',
      'Diffs every channel against it on a schedule.',
      'Reports drift as a short list of decisions, not a spreadsheet.',
    ],
    tech: ['Python', 'APIs', 'Supabase', 'Scheduled jobs'],
  },
  {
    id: 'lab',
    title: 'THE LAB',
    blurb: 'Raspberry Pi, sensors, and things that should not be on the internet.',
    status: 'EXPERIMENT',
    year: 'ongoing',
    what: 'A shelf of single-board computers running whatever the current question is — local network monitoring, home automation, offline model inference, hardware that talks to software I wrote.',
    why: 'Some things you only understand once they are physically in front of you and refusing to boot.',
    does: [
      'Monitors and logs a small network to see what actually talks to what.',
      'Runs small models locally to find out where the ceiling really is.',
      'Bridges physical inputs into the same automations everything else uses.',
    ],
    tech: ['Raspberry Pi', 'Python', 'Linux', 'MQTT', 'Local inference'],
  },
  {
    id: 'utilities',
    title: 'UTILITY BELT',
    blurb: 'Small tools, built the day they were needed.',
    status: 'INTERNAL',
    year: 'ongoing',
    what: 'A drawer of single-purpose utilities: bulk renamers, format converters, report generators, sheet scrubbers, one-off scrapers. Each one exists because doing it by hand a second time was unacceptable.',
    why: 'Most useful software is fifty lines long and only three people will ever run it. That is fine.',
    does: [
      'Cleans and reshapes messy exports into something usable.',
      'Generates recurring reports on a schedule instead of on request.',
      'Automates the small repeated task nobody thought to complain about.',
    ],
    tech: ['Python', 'Apps Script', 'CLI', 'Sheets API'],
  },
];
