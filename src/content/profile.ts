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
  'Four things run at once, most days. A company to steer, a music business I own part of, hours given to the people who keep a city quiet, and a course I am in no particular hurry to finish. None of them wait their turn, and I stopped asking them to.',
  'Most of the work is unglamorous. Someone is losing an hour a day to something a machine should be doing, and I make it cost nothing. Done properly, nobody notices — which is exactly the point. The systems that get talked about are usually the ones that broke.',
  'None of it would survive on its own. There is a version of me that never leaves the screen, and he is unbearable company. So there are long dinners, worse jokes, and people in my life who have never once asked what a database is and never will. I am reliably the last one still awake, and rarely the only one. That is the part that keeps the rest running.',
  'The remainder is curiosity with a keyboard. I take things apart to find where they give. I have never once regretted knowing how something works, and I have occasionally regretted finding out at four in the morning.',
  'The same reflex does not politely stop at software. Rooms, habits, the half-second before somebody answers — I notice, and I have long since stopped mentioning it. Most of what I know about people, they never told me and will never hear repeated. Discretion is not a courtesy I extend. It is the only way I have ever been able to live with knowing things.',
];

/** The closing note. Deliberately the shortest thing on the page. */
export const bioClose = 'Better in person than in text. Better at 2am than at 9. You will work out which one you got.';

/** Small factual chips under the roles. */
export const facts: { k: string; v: string }[] = [
  { k: 'Based', v: 'Abu Dhabi' },
  { k: 'Works in', v: 'English · Urdu' },
  { k: 'Hours', v: 'Late' },
  { k: 'Answers to', v: 'Asher' },
  { k: 'Notices', v: 'Most of it' },
  { k: 'Repeats', v: 'None of it' },
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
 * Appreciation counter and the note form under it.
 *
 * `seed` is a starting number, not a measurement — the tally lives in the
 * visitor's own browser, since this is a static export with no server.
 *
 * `endpoint` posts the note to FormSubmit, which relays it to the address in
 * the URL. It must be activated once: submit a note yourself, then click the
 * confirmation link FormSubmit emails you. Until that is done, nothing is
 * delivered. Swap this for any endpoint that accepts a JSON POST.
 */
export const appreciation = {
  seed: 257,
  endpoint: 'https://formsubmit.co/ajax/attaullah.sher@me.com',
  prompt: 'Leave a line',
  thanksTitle: 'Received.',
  thanksBody: 'It will be read. Probably tonight.',
  failBody: 'That did not go through. Instagram is the reliable way.',
};
