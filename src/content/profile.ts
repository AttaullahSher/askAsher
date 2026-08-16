/**
 * The personal file, opened from the first door at the end.
 *
 * Written to be read, not scanned. Facts stated once, plainly, and then left
 * alone — the restraint is the point. Nothing here is embellished; if a line
 * stops being true, delete it rather than soften it.
 */

export interface Role {
  title: string;
  org: string;
  note: string;
}

export const roles: Role[] = [
  {
    title: 'Managing Director',
    org: 'Anfal',
    note: 'The one where the decisions land on me, and stay landed.',
  },
  {
    title: 'Partner',
    org: 'AKM Music',
    note: 'Instruments, the people who play them, and the systems underneath.',
  },
  {
    title: 'Volunteer',
    org: 'Local law enforcement',
    note: 'Time given, quietly. Not a story I tell at dinner.',
  },
  {
    title: 'Student',
    org: 'Part time, ongoing',
    note: 'The day I stop is the day it gets boring.',
  },
];

/** Read in order. Each line earns its place or it goes. */
export const bio: string[] = [
  'Four things run at once, most days. A company to steer, a music business I own part of, hours given to the people who keep a city quiet, and a course I am still not finished with. None of them politely wait their turn.',
  'Most of the work is unglamorous. Someone is losing an hour a day to something a machine should be doing, and I make it cost nothing. Done properly, nobody notices — which is exactly the point. The systems that get talked about are usually the ones that broke.',
  'None of it would survive on its own. There is a version of me that never leaves the screen, and he is unbearable company. So there are long dinners, worse jokes, and people in my life who have never once asked what a database is and never will. That is the part that keeps the rest running.',
  'The remainder is curiosity with a keyboard. I take things apart to find where they give. I have never once regretted knowing how something works, and I have occasionally regretted finding out at four in the morning.',
];

/** The closing note. Deliberately the shortest thing on the page. */
export const bioClose = 'Better in person than in text. Better at 2am than at 9.';

/** Small factual chips under the roles. */
export const facts: { k: string; v: string }[] = [
  { k: 'Based', v: 'Abu Dhabi' },
  { k: 'Works in', v: 'English · Urdu' },
  { k: 'Hours', v: 'Late' },
  { k: 'Answers to', v: 'Asher' },
];

/**
 * Contact lives inside the file rather than on the page — you get it after
 * you have read something.
 */
export const contact: { label: string; href: string; note: string }[] = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/attaullah.sher',
    note: 'probably where you came from',
  },
  {
    label: 'Email',
    href: 'mailto:attaullah.sher@me.com',
    note: 'for anything real',
  },
];

/**
 * Appreciation counter.
 *
 * `seed` is a starting number, not a measurement — see the note in
 * `Appreciation.tsx`. Taps are counted on the visitor's own device.
 */
export const appreciation = {
  seed: 257,
  prompt: 'Leave a line',
  hint: 'Opens your mail app — nothing is stored on this page.',
};
