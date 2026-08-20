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
  'Four things run at once. A company to steer, a music business I own part of, hours given to the people who keep a city quiet, and a course I am in no hurry to finish.',
  'Most of the work is unglamorous, and that is the whole trade. A business is quietly losing an hour a day to something that should have been software years ago. I find it, move it, and the hour stops existing — usually without anybody noticing anything changed except that they got home earlier.',
  'There is a version of me that never leaves the screen. He is unbearable company. So there are long dinners, worse jokes, and people who have never once asked what a database is. I am reliably the last one awake, and rarely the only one.',
  'The rest is curiosity with a keyboard. I take things apart to find where they give. Rooms and people included. I stopped mentioning that a long time ago.',
];

/**
 * The modes.
 *
 * Not phases, and not a personality test. Several things that are true of the
 * same person on the same day — which is the only honest way to write this,
 * because a single consistent character is a brand, not a human being.
 */
export interface Mode {
  id: string;
  label: string;
  body: string;
}

export const modes: Mode[] = [
  {
    id: 'charm',
    label: 'Charm',
    body: 'Better company than is convenient, and faster with a line than anybody needs me to be. It has earned me a reputation I have never once bothered to correct.',
  },
  {
    id: 'family',
    label: 'Family first',
    body: 'Above all of it. Not a value I list — an order I follow. Everything else here is negotiable and this is the part that is not.',
  },
  {
    id: 'contained',
    label: 'Self-contained',
    body: 'Emotionally independent, which is the polite way of saying I need nothing back. People read that as distance right up until they need something.',
  },
  {
    id: 'poetry',
    label: 'Pashto poetry',
    body: 'Read late and out loud, in a language that carries grief and pride in the same breath. A landay says in two lines what an essay cannot in two pages.',
  },
  {
    id: 'history',
    label: 'History',
    body: 'Read for the pattern, never the dates. Empires end the way businesses do — slowly, and then in a single afternoon nobody thought to write down.',
  },
];

/** The frame around the modes. The point is that none of them wait their turn. */
export const modesNote =
  'None of these take turns. They run at once, all day, and the one you meet is mostly a question of what time it is.';

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
 * The half that is not a CV. Written as a grid because that is the format
 * that reads fastest on a phone — and because a list of short certainties
 * lands harder than a paragraph about being trustworthy.
 */
export const offRecord: { k: string; v: string }[] = [
  { k: 'Secrets', v: 'Die here' },
  { k: 'Grudges', v: 'None kept' },
  { k: 'Your tells', v: 'Clocked, then dropped' },
  { k: 'Judgement', v: 'Permanently reserved' },
  { k: 'Chasing', v: 'Never. I remember instead' },
  { k: 'After midnight', v: 'Considerably better' },
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
