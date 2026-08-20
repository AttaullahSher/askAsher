/**
 * The personal file, opened from the first door at the end.
 *
 * Written to be read, not scanned. Facts stated once, plainly, and then left
 * alone — the restraint is the point. Nothing here is embellished; if a line
 * stops being true, delete it rather than soften it.
 *
 * One rule above all the others: **nothing here describes his effect on other
 * people.** No line claims to be good company, hard to read, better after
 * midnight, or memorable. A page cannot assert charm; it can only be charming,
 * and it does that with specifics — a shop, an instrument, an hour of the
 * night, a thing he is bad at. Every sentence that reached for the reader's
 * opinion of him has been replaced with a fact the reader can do something
 * with.
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
  'The music shop keeps me honest. You can tell in about four seconds which guitar is going home to be played and which one is going home to lean against a wall looking expensive, and you sell both without ever once letting on which is which. Nothing I have learned about software has been more useful than that.',
  'There is a version of me that never leaves the screen. He is unbearable company. So there are long dinners, worse jokes, and people who have never once asked what a database is.',
  'The rest is curiosity with a keyboard. I take things apart to find where they give. Rooms and people included. I stopped mentioning that a long time ago.',
];

/**
 * The modes.
 *
 * Not phases, and not a personality test. Several things that are true of the
 * same person on the same day — which is the only honest way to write this,
 * because a single consistent character is a brand, not a human being.
 *
 * Each one names a behaviour somebody could actually watch happen, or admits
 * a cost. A mode with no cost in it is an advert.
 */
export interface Mode {
  id: string;
  label: string;
  body: string;
}

export const modes: Mode[] = [
  {
    id: 'company',
    label: 'Company',
    body: 'I will talk to anybody — the driver, the man fixing the aircon, whoever is standing on their own at the edge of the room. It is not a technique and it is not kindness. They are usually the most interesting person there and everybody else has made the mistake of not checking.',
  },
  {
    id: 'family',
    label: 'Family first',
    body: 'Above all of it. Not a value I list — an order I follow. Everything else here is negotiable and this is the part that is not.',
  },
  {
    id: 'contained',
    label: 'Self-contained',
    body: 'I need very little back. It makes me easy to have around and genuinely hard to read, and I have never worked out how to fix the second half without losing the first.',
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

/**
 * The closing note. Deliberately the shortest thing on the page — and
 * deliberately an open door rather than a last word, because the console is
 * two taps away and this is the sentence standing next to it.
 */
export const bioClose = 'I answer everything. Late, usually, and not always well — but everything.';

/** Small factual chips under the roles. */
export const facts: { k: string; v: string }[] = [
  { k: 'Based', v: 'Abu Dhabi' },
  { k: 'Works in', v: 'English · Urdu · Pashto' },
  { k: 'Hours', v: 'Late' },
  { k: 'Answers to', v: 'Asher' },
  { k: 'Notices', v: 'Most of it' },
  { k: 'Repeats', v: 'None of it' },
];

/**
 * The half that is not a CV.
 *
 * Six promises about how a person gets treated, not six claims about how
 * impressive he is. This grid used to say things like "your tells — clocked,
 * then dropped", which is a boast wearing a promise's coat. What is here now
 * is the thing somebody actually wants to know before they send a message to
 * a stranger: is this safe, and will I get a straight answer.
 */
export const offRecord: { k: string; v: string }[] = [
  { k: 'Secrets', v: 'Die here' },
  { k: 'Grudges', v: 'None kept' },
  { k: 'Judgement', v: 'Permanently reserved' },
  { k: 'Bad news', v: 'Told straight, the first time' },
  { k: 'Being wrong', v: 'I will change my mind in front of you' },
  { k: 'Favours', v: 'Lost count. Never called one in' },
];

/**
 * Contact lives inside the file rather than on the page — you get it after
 * you have read something. The console reaches him without any of this.
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
 * The relay behind the console and the note form.
 *
 * `endpoint` posts to FormSubmit, which forwards to the address in the URL. It
 * must be activated once: send a message yourself, then click the confirmation
 * link FormSubmit emails you. Until that is done, nothing is delivered. Swap
 * this for any endpoint that accepts a JSON POST.
 *
 * There is no counter here any more. The old one seeded itself at 257 and then
 * incremented only inside the visitor's own browser, which meant the number was
 * decoration — and a number that never moves is the one thing on a page a
 * sharp reader checks twice.
 */
export const relay = {
  endpoint: 'https://formsubmit.co/ajax/attaullah.sher@me.com',
  prompt: 'Leave a line',
  thanksTitle: 'Received.',
  thanksBody: 'It will be read. Probably tonight.',
  failBody: 'That did not go through. Instagram is the reliable way.',
};
