/**
 * The work, opened from the button at the end.
 *
 * Rule for this file: no invented metrics, no awards, no client logos, and
 * nothing that exposes a business's internals. Describe the shape of a system,
 * never its keys, schema, pricing rules or source.
 */

export interface Project {
  id: string;
  code: string;
  title: string;
  /** One line on the closed row. */
  blurb: string;
  status: 'LIVE' | 'INTERNAL' | 'ONGOING';
  what: string;
  why: string;
  /** Optional ordered flow — used where "how it works" is the interesting part. */
  flow?: { step: string; detail: string }[];
  does?: string[];
  tech: string[];
  href?: string;
  hrefLabel?: string;
  /** Shown where a system is deliberately described at arm's length. */
  guarded?: string;
}

export const projects: Project[] = [
  {
    id: 'pos',
    code: 'P-01',
    title: 'POS',
    blurb: 'Point of sale and stock, built for a shop floor that never stops.',
    status: 'INTERNAL',
    what: 'A retail system for a music business: what is on the shelf, what just left it, what it was sold for, and what that means for tomorrow. Built around the counter rather than around the database.',
    why: 'Off-the-shelf retail software assumes every shop is the same shop. Ours is not. Serial-tracked instruments, trade-ins, repairs, rentals and school orders do not fit a template designed for selling t-shirts.',
    flow: [
      { step: 'SCAN', detail: 'An item is identified at the counter — barcode, serial, or by hand when the label has long since fallen off.' },
      { step: 'RESOLVE', detail: 'The system finds the one true record for it: variant, condition, location, and whether it is actually available or already promised to somebody.' },
      { step: 'PRICE', detail: 'Rules apply themselves — customer tier, bundle, trade-in credit, seasonal terms. The person at the counter is not doing arithmetic.' },
      { step: 'COMMIT', detail: 'The sale is written once. Stock moves, the ledger updates, and the receipt is generated from the same record rather than a second version of the truth.' },
      { step: 'SETTLE', detail: 'Payment is reconciled, split tenders included, and the drawer balances against what actually happened rather than what someone remembered.' },
      { step: 'REPORT', detail: 'By morning the numbers that matter are already waiting. Nobody exports anything.' },
    ],
    tech: ['TypeScript', 'Node', 'SQL', 'Offline-first sync', 'Thermal printing', 'Barcode / serial capture'],
    guarded:
      'Described at arm’s length on purpose. The pricing logic, schema and source belong to the business, not to this page.',
  },
  {
    id: 'docs',
    code: 'P-02',
    title: 'DOCS',
    blurb: 'Quotations and invoices that generate themselves.',
    status: 'INTERNAL',
    what: 'A document engine sitting on top of the same records the counter uses. An enquiry becomes a priced quotation; an accepted quotation becomes an invoice; both are filed without anyone opening a spreadsheet.',
    why: 'The same request arrived a hundred times a week in a hundred different shapes, and every one of them cost somebody twenty minutes and a template they had renamed "FINAL_v3".',
    does: [
      'Pulls items and intent out of free text, voice notes and photographs of handwritten lists.',
      'Matches against live stock and flags what it is genuinely unsure about instead of guessing.',
      'Renders the document, sends it, and files the record — one path, no second copy.',
      'Turns an acceptance into an invoice without a human retyping a single line.',
    ],
    tech: ['TypeScript', 'Node', 'Google Apps Script', 'LLM APIs', 'PDF generation'],
  },
  {
    id: 'ask',
    code: 'P-03',
    title: 'ASK',
    blurb: 'An assistant that belongs to whoever opens it.',
    status: 'LIVE',
    what: 'A browser-only assistant with durable memory, goal tracking, voice in and out, and an automatic fallback chain across open models. No backend, no build step, no account. It runs the moment the page loads.',
    why: 'Every assistant worth using wants a login and a subscription first. I wanted one that works instantly, keeps its memory on the device, and belongs to the person holding the phone.',
    does: [
      'Remembers durable facts about you and shows every one of them, deletable.',
      'Tracks what you are working toward and points its answers back at it.',
      'Talks and listens using the browser’s own speech engine — offline capable.',
      'Falls through a chain of models when one refuses or rate-limits.',
    ],
    tech: ['Vanilla JS', 'Web Speech API', 'Service Worker', 'LocalStorage', 'Open model APIs'],
    href: 'ask/',
    hrefLabel: 'Open it',
  },
  {
    id: 'data',
    code: 'P-04',
    title: 'DATA',
    blurb: 'One product truth, many storefronts.',
    status: 'ONGOING',
    what: 'Tooling that keeps product data consistent across a website and several marketplaces, and tells a human the moment they start disagreeing with each other.',
    why: 'Listings drift. A price corrected in one place stays wrong in four others, and nobody notices until a customer does — politely, in public.',
    does: [
      'Holds a single canonical record per product.',
      'Diffs every channel against it on a schedule.',
      'Reports drift as a short list of decisions, not a spreadsheet to read.',
    ],
    tech: ['Python', 'SQL', 'APIs', 'Scheduled jobs'],
  },
  {
    id: 'web',
    code: 'P-05',
    title: 'WEB',
    blurb: 'Interfaces, including the one you are standing in.',
    status: 'ONGOING',
    what: 'Sites and internal front-ends. Built for the device they will actually be opened on, which is almost never the one they were designed on.',
    why: 'Most of the web is slow because nobody measured it on a real phone, on real data, at night, on the edge of a signal.',
    does: [
      'Front-ends that hold state without falling apart.',
      'Motion that serves the content rather than delaying it.',
      'Built and measured mobile-first, not adapted down to it afterwards.',
    ],
    tech: ['TypeScript', 'React', 'Next.js', 'Tailwind', 'Canvas'],
  },
  {
    id: 'lab',
    code: 'P-06',
    title: 'LAB',
    blurb: 'Single-board computers and things that should not be online.',
    status: 'ONGOING',
    what: 'A shelf running whatever the current question is — local network monitoring, home automation, offline model inference, hardware that talks to software I wrote.',
    why: 'Some things you only understand once they are physically in front of you, refusing to boot, at one in the morning.',
    does: [
      'Watches a small network to see what actually talks to what.',
      'Runs small models locally to find where the ceiling really is.',
      'Bridges physical inputs into the same automations everything else uses.',
    ],
    tech: ['Raspberry Pi', 'Linux', 'Python', 'MQTT', 'Local inference'],
  },
];
