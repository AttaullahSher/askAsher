/**
 * The SECURITY sector.
 *
 * There is no run, no scan and no list of steps here, deliberately. How it is
 * done is nobody's business and it is not the interesting part.
 *
 * What changed: this sector used to end with a hundred-word paragraph in which
 * the author explained, at length, how much restraint he has — including the
 * line about the people who tested it finding out it was "the only thing
 * standing between them and a genuinely bad week." Telling a reader you are
 * dangerous is the one reliable way to convince them you are not. So the
 * paragraph is gone and a demonstration stands in its place: the page reads
 * the visitor's own device in front of them, out loud, and then deliberately
 * drops every value. The restraint is shown in four seconds instead of
 * asserted in four sentences, and the fear belongs to the reader's situation
 * rather than to anything claimed about the author.
 */

/** Four lines. Landed one at a time, in the order they have to be read. */
export const securityCreed: string[] = [
  'I see where a thing would give.',
  'Usually before anyone has thought to ask me to look.',
  'And then I leave it exactly where it stands.',
  'That is a decision. It was never a limit.',
];

export const securityPrinciples: { label: string; body: string }[] = [
  {
    label: 'Surface',
    body: 'A business grows by adding doors — an app, a portal, a login for a supplier. Nobody is ever handed the job of counting them.',
  },
  {
    label: 'Devices',
    body: 'A phone is a microphone, a camera, a radio and a very long memory. It was never only a phone.',
  },
  {
    label: 'Signal',
    body: 'Nobody has to read what you sent. When you sent it, how often, and who answered already tells most of the story.',
  },
  {
    label: 'Trust',
    body: 'Anything arriving from outside is a stranger at the door. Greeted, checked, and never walked straight through to the till.',
  },
  {
    label: 'Privacy',
    body: 'The safest record is the one that was never written. The second safest is the one deleted on time. Everything after that is a promise.',
  },
  {
    label: 'Restraint',
    body: 'Knowing how is common enough. Choosing not to — every day, with nobody watching and nobody ever finding out — is the part almost nobody trains.',
  },
];

/** The one rule, stated once and not argued about. */
export const securityScope =
  'What I touch is mine, or I was invited to it. There has never been a third category.';

/**
 * The live readout.
 *
 * Copy only — every value on screen is read from the visitor's own browser at
 * render time by `src/lib/readout.ts`, which is where the rules about what may
 * and may not be read are written down.
 */
export const readout = {
  eyebrow: 'Live · read off your device',
  /** Sits above the list, before anything has appeared. */
  lead: 'You have not agreed to anything, tapped anything, or answered a single question. This is some of what this page could already see.',
  /**
   * The turn. Lands line by line once the list has finished assembling —
   * this is the part that does the work, so it stays short.
   */
  turn: [
    'That took about four milliseconds.',
    'No prompt. No permission. Nothing you agreed to.',
    'Every site you opened today read the same thing.',
    'Most of them wrote it down.',
  ],
  /**
   * The release. Without this the section is just a cheap scare; with it, the
   * whole sector is about the difference between the two.
   */
  release:
    'This one did not. Nothing above was sent anywhere, and nothing was stored — there is no server behind this page, no database and nothing counting you. Close the tab and every line of it stops existing. That is not a feature. It is just what happens when nobody decided to keep it.',
  /** Shown instead of the list if a hardened browser gives up nothing. */
  empty:
    'Your browser gave up almost nothing. That is rarer than you would think, and it is a good sign.',
};

/**
 * The closing line, now a quarter of its old length. It follows a
 * demonstration, so it no longer has to do the convincing on its own.
 */
export const securityClose =
  'None of this is a service and none of it is for sale. It is simply what I am like in a room: I notice where a thing would give, immediately, without trying, and then I do nothing about it. That is the whole discipline and the only part of it worth respecting.';
