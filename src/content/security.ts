/**
 * The SECURITY sector.
 *
 * No run, no scan, no list of steps. How it is done is nobody's business and
 * it was never the interesting part.
 *
 * This sector used to end on a hundred words of the author explaining how much
 * restraint he has. Telling a reader you are dangerous is the one reliable way
 * to convince them you are not, so the paragraph is gone and a demonstration
 * stands where it was: the page reads the visitor's own device in front of
 * them and then drops every value. The line about nothing crossing a room
 * unnoticed lands immediately after that, because by then it has been proved
 * rather than claimed — and a proved line needs six words where a claimed one
 * needs sixty.
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
    body: 'A business grows by adding doors. An app, a portal, a login for a supplier. Nobody is ever handed the job of counting them.',
  },
  {
    label: 'Devices',
    body: 'A phone is a microphone, a camera, a radio and a very long memory. It was never only a phone.',
  },
  {
    label: 'Signal',
    body: 'Nobody has to read what you sent. When, how often, and who answered tells most of it.',
  },
  {
    label: 'Trust',
    body: 'Anything from outside is a stranger at the door. Greeted, checked, never walked straight through to the till.',
  },
  {
    label: 'Privacy',
    body: 'The safest record was never written. The second safest was deleted on time. Everything after that is a promise.',
  },
  {
    label: 'Restraint',
    body: 'Knowing how is common. Choosing not to — every day, with nobody watching — is the part almost nobody trains.',
  },
];

/**
 * The one rule, stated once for the whole site.
 *
 * This now carries the scope that used to be repeated, apologetically, at the
 * bottom of three separate project entries. Said once and flatly, it reads as
 * a standard. Said four times, it read as a man explaining himself.
 */
export const securityScope =
  'What I touch is mine, or I was invited to it. There has never been a third category.';

/**
 * The live readout.
 *
 * Copy only. Every value on screen is read from the visitor's own browser at
 * render time by `src/lib/readout.ts`, which holds the rules about what may
 * and may not be read.
 */
export const readout = {
  eyebrow: 'Live · off your device',
  lead: 'You agreed to nothing. Tapped nothing. Answered nothing. Here is some of what this page can already see.',
  /** Lands line by line once the listing finishes. Four beats, no more. */
  turn: [
    'Four milliseconds.',
    'No prompt. No permission. Nothing you agreed to.',
    'Every site you opened today read the same thing.',
    'Most of them wrote it down.',
  ],
  /** Without this the section is a cheap scare. With it, that is the subject. */
  release:
    'This one did not. Nothing above was sent anywhere and nothing was stored. There is no server behind this page and nothing counting you. Close the tab and every line of it stops existing.',
  /**
   * The line the whole sector exists to earn. It goes here, under the proof,
   * and not in a paragraph forty lines further down where it would be a boast.
   */
  after: 'Nothing crosses a room without leaving something behind. I read it before I have decided to.',
  /** Shown instead of the list if a hardened browser gives up nothing. */
  empty: 'Your browser gave up almost nothing. Rarer than you would think, and a good sign.',
};

/** The restraint, after the demonstration. A quarter of its old length. */
export const securityClose =
  'None of this is a service and none of it is for sale. It is what I am like in a room. I notice, and then I do nothing about it. That is the whole discipline, and the only part worth respecting.';
