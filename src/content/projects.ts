/**
 * The work.
 *
 * Not a CV and not a set of case studies. What the person can do, stated once,
 * and nothing said twice.
 *
 * ---
 *
 * **Short.** Every entry here used to run sixty to a hundred words per field.
 * Nobody reads a hundred words on a phone at midnight, and length itself reads
 * as arguing a case. Declaratives, under fifteen words where possible, full
 * stops instead of commas. If a sentence needs a subordinate clause it is two
 * sentences.
 *
 * **No disclaimers.** The previous version closed three entries with "written
 * down, not built" and a `made` line reading "reading, mostly", then explained
 * who it had never been pointed at. Every one of those is a flinch, and a
 * flinch is the only thing on a page a reader remembers. `status` no longer
 * comments on whether something shipped — `LIVE` means you can open it,
 * `PRIVATE` means it runs for real people who are not you, `CLOSED` means it
 * is not published. All three are true of every entry that carries them and
 * none of them is a confession.
 *
 * **The line that does not move.** No invented metrics, no awards, no client
 * logos, nothing that exposes a business's internals, and no method anybody
 * could follow. And no claimed operation: nothing here says a thing was
 * pointed at a person, because that is not true and because it is weaker than
 * what is here. Authority comes from knowing exactly how something works and
 * declining to dress it up. Scope is stated once, site-wide, in
 * `securityScope` — not apologised for again in every entry.
 *
 * **Second person.** "I know what a room gives away" asks to be believed.
 * "Your phone is talking right now" can be checked. Write the second one.
 */

export interface Project {
  id: string;
  code: string;
  title: string;
  /** One line on the closed row. Ten words is the ceiling. */
  blurb: string;
  /**
   * What the entry is, never whether it shipped.
   *
   * LIVE    — open it now.
   * PRIVATE — running, for people who are not you.
   * CLOSED  — not published.
   */
  status: 'LIVE' | 'PRIVATE' | 'CLOSED';
  what: string;
  why: string;
  does?: string[];
  /** Only where it lands. An entry does not owe the reader a cost breakdown. */
  made?: string;
  href?: string;
  hrefLabel?: string;
  /** Discretion, not apology. Exactly one entry earns this. */
  guarded?: string;
}

export const projects: Project[] = [
  {
    id: 'shift',
    code: 'P-01',
    title: 'SHIFT',
    blurb: 'I take a business off manual and leave it running.',
    status: 'PRIVATE',
    what: 'The till, the paperwork, the stock, the prices sitting in four places quietly disagreeing. All of it pulled into one place everything else asks. The jobs that waited on a person stop waiting.',
    why: 'Every business I have been let inside was held together by one person’s memory and a spreadsheet nobody else dares touch. That is not a system. That is a hostage situation with good intentions.',
    does: [
      'I find the hour a day that disappears. I make it stop existing.',
      'I build what that business needed. Not what a salesman sells everybody.',
      'I hand it over finished. If it still needs me, I built it wrong.',
    ],
    guarded: 'How it prices belongs to the business. Not to this page.',
  },
  {
    id: 'watch',
    code: 'P-02',
    title: 'WATCH',
    blurb: 'Your phone is talking right now. Not to you.',
    status: 'CLOSED',
    what: 'It calls out the name of every network it has ever joined. Out loud. To the whole room. Connected to nothing. Bodies bend a wifi signal, so a box in the hallway knows somebody is moving next door and roughly where they stand. No camera. No microphone. And what you send is locked, which hides the words and nothing else — when, how often, who answered. A day rebuilds itself out of timing alone.',
    why: 'None of it is difficult. That is the entire problem. A shop, a station, a parked car can do this today and will never mention it.',
    does: [
      'What a room gives away while every phone in it is connected to nothing.',
      'What a link learns the second you tap it.',
      'What your pocket can already see and hear.',
      'Which settings stop it. Which ones only feel like they do.',
    ],
  },
  {
    id: 'range',
    code: 'P-03',
    title: 'RANGE',
    blurb: 'I break the things that were sold as unbreakable.',
    status: 'CLOSED',
    what: 'A working copy of something real — machines, staff, email, all of it invented and behaving like the original. Then rob it properly, front door to whatever is worth taking. Watch which alarms move. Delete the copy. What survives is one short list.',
    why: 'Security gets bought after a good demonstration and never tested again. An alarm nobody has set off is a wire, not a defence.',
    does: [
      'I rob the copy. Never the original.',
      'I keep the alarms that fired under attack and stayed quiet all week.',
      'Everything else was expensive decoration.',
    ],
  },
  {
    id: 'lab',
    code: 'P-04',
    title: 'LAB',
    blurb: 'The bench. I break my own things first.',
    status: 'CLOSED',
    what: 'A shelf of small computers and antennas on a network that touches nothing else in the house. New things get tested here, taken apart here, and left running until they fall over.',
    why: 'Reading about a weakness is not the same as having caused one. I do not trust anything I have not taken apart. That includes the things I built.',
    does: [
      'I attack my own kit, on a network with nothing else on it.',
      'I find the real ceiling, not the advertised one.',
      'I watch what talks to what. Including what nobody installed on purpose.',
      'Nothing reaches anybody until it survives the bench. Most things do not.',
    ],
    made: 'A shelf, second-hand parts, and no sensible bedtime.',
  },
  {
    id: 'ask',
    code: 'P-05',
    title: 'ASK',
    blurb: 'A thinking partner that belongs to whoever opens it.',
    status: 'LIVE',
    what: 'Opens in your browser and starts. No account, no subscription, nothing installed. It remembers what matters, shows you everything it remembers, and lets you delete any of it. Nothing leaves your phone. There is nowhere for it to go.',
    why: 'The people who most need to think out loud are the least free to do it. Every assistant worth using wants your email and a copy of the conversation first.',
    does: [
      'It argues with a decision before you make it. Cheaper than after.',
      'It knows what you are working towards and points its answers at it.',
      'It talks and listens, so it works while you drive.',
      'If one brain refuses, it quietly asks another.',
    ],
    made: 'A few late nights and a refusal to add a login screen.',
    href: 'ask/',
    hrefLabel: 'Open it',
  },
  {
    id: 'grab',
    code: 'P-06',
    title: 'GRAB',
    blurb: 'Paste a link, get the video. No adverts, no account.',
    status: 'LIVE',
    what: 'Paste the link, press the button, get the file. YouTube, Instagram, TikTok, Facebook, X, Reddit, about twenty more. Nothing is kept anywhere. The whole thing happens on your own phone.',
    why: 'Every other one is buried in adverts and gives up the moment a server is busy for a second. Mine keeps trying, a different way each time, until it works.',
    does: [
      'It asks several servers at once and takes whoever answers first.',
      'When something fails it reads why, then tries the way that works.',
      'It keeps itself up to date. Nobody maintains it by hand.',
      'No adverts. No account. No tracking. No charge.',
    ],
    made: 'A weekend, and genuine irritation at everything else out there.',
    href: 'https://attaullahsher.github.io/Ashgrab/',
    hrefLabel: 'Open it',
  },
  {
    id: 'vpn',
    code: 'P-07',
    title: 'VPN',
    blurb: 'A private tunnel for my family. I am the only one who could keep a record.',
    status: 'PRIVATE',
    what: 'A private way onto the internet for four people, on a server that costs nothing. The café, the hotel, the airport cannot see where you go. Adding a phone takes one command and a code you point a camera at.',
    why: 'A paid service asks you to trust a company you cannot check. Running my own does not make anybody invisible. It means I know exactly who could keep a record. It is me. I do not.',
    does: [
      'Nobody else is in the middle. That is the entire point.',
      'Adding somebody takes ten seconds.',
      'It runs free. It costs the family nothing.',
    ],
    href: 'https://github.com/AttaullahSher/VPN',
    hrefLabel: 'Read the scripts',
  },
  {
    id: 'web',
    code: 'P-08',
    title: 'WEB',
    blurb: 'Sites that behave like something, not like a brochure.',
    status: 'LIVE',
    what: 'Screens, including the one you are standing in. Built from nothing every time. No template, no page builder, no layout bought from somebody else — the good part is always the part a template cannot do.',
    why: 'Most web design is a template approved on a big monitor with fast internet. Almost nobody opens their own site on a three-year-old phone, at night, on one bar. That is the only test that counts.',
    does: [
      'Built for the phone it opens on, not the laptop it was drawn on.',
      'It moves because the movement means something.',
      'No template anywhere in it. This page included.',
    ],
    made: 'Longer than it should have, and it shows in the right places.',
  },
];
