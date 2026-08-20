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
    label: 'Devices',
    body: 'A phone is a microphone, a camera, a radio and a very long memory.',
  },
  {
    label: 'Signal',
    body: 'Nobody has to read what you sent. When, how often, and who answered tells most of it.',
  },
  {
    label: 'Restraint',
    body: 'Knowing how is common. Choosing not to, with nobody watching, is not.',
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
  lead: 'You agreed to nothing. Tapped nothing. Here is what this page can already see.',
  /** Lands line by line once the listing finishes. Four beats, no more. */
  turn: [
    'Four milliseconds.',
    'No prompt. No permission. Nothing you agreed to.',
    'Every site you opened today read the same thing.',
    'Most of them wrote it down.',
  ],
  /** Without this the section is a cheap scare. With it, that is the subject. */
  release:
    'This one did not. Nothing above was sent anywhere and nothing was stored. Close the tab and every line of it stops existing.',
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
  'None of it is for sale. I notice, and then I put it down. Every day, with nobody watching. That is the whole discipline.';
