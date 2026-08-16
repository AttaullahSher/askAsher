/**
 * The personal file, opened from the button at the end.
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
    note: 'The one where the decisions land on me.',
  },
  {
    title: 'Partner',
    org: 'AKM Music',
    note: 'Instruments, people who play them, and the systems underneath.',
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
  'Four things run at once, most days. A company to steer, a music business I own part of, hours given to the people who keep a city quiet, and a course I am still not finished with.',
  'Most of the work is unglamorous. Someone loses an hour a day to something a machine should be doing. I make it cost nothing, and nobody notices — which is the correct outcome.',
  'The rest is curiosity with a keyboard. I take things apart to see where they give. I have never once regretted knowing how something works.',
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
