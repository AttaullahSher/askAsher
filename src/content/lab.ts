/**
 * The Lab. After hours, not for clients.
 *
 * Kept apart from the professional work on purpose: a recruiter should never
 * have to read past a Wi-Fi experiment to find the systems a business runs on,
 * and the experiments should never have to be dressed up to sit next to them.
 *
 * **Short.** Declaratives, under fifteen words where possible.
 *
 * **No disclaimers.** `status` says what the entry is, never whether it
 * shipped. LIVE: open it now. PRIVATE: running for people who are not you.
 * CLOSED: not published. Scope is stated once, in `security.ts`.
 *
 * **No claimed operation.** Nothing here says a thing was pointed at a person.
 * Authority comes from knowing exactly how something works and declining to
 * dress it up.
 */

export const labIntro = {
  eyebrow: 'The lab',
  title: ['After', 'hours'],
  lead: 'Not for clients. This is where I take things apart, including my own, to find where they give.',
};

export interface LabProject {
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

export const lab: LabProject[] = [
  {
    id: 'watch',
    code: 'L-01',
    title: 'WATCH',
    blurb: 'Your phone is talking right now. Not to you.',
    status: 'CLOSED',
    what: 'It calls out the name of every network it has ever joined. Out loud. To the whole room. Connected to nothing. Bodies bend a wifi signal, so a box in a hallway knows somebody is moving next door, roughly where they stand, and whether the place is empty. No camera. No microphone. And what you send is locked, which hides the words and nothing else — when, how often, who answered. A day rebuilds itself out of timing alone.',
    why: 'None of it is difficult. That is the problem. A shop, a station, a parked car does this to you today and never mentions it. I would rather be the one who knows exactly how much of it works.',
    does: [
      'What a room gives away while every phone in it is connected to nothing.',
      'What a link learns the second you tap it.',
      'What your pocket can already see and hear.',
      'Which settings stop it. Which ones only feel like they do.',
      'And that most of what people call privacy is a setting somebody else can see through.',
    ],
  },
  {
    id: 'range',
    code: 'L-02',
    title: 'RANGE',
    blurb: 'I break what was sold as unbreakable.',
    status: 'CLOSED',
    what: 'A working copy of something real. The machines, the staff, the mail — invented, and behaving like the original. Then I rob it. Front door to whatever is worth taking. Watch which alarms move. Delete the copy.',
    why: 'Security gets bought after a good demonstration and never tested again. An alarm nobody has set off is a wire, not a defence.',
    does: [
      'I rob the copy. Never the original.',
      'I keep the alarms that fired under attack and stayed quiet all week.',
      'Everything else was expensive decoration.',
      'The list at the end is short. It is always shorter than anybody wants it to be.',
    ],
  },
  {
    id: 'lab',
    code: 'L-03',
    title: 'LAB',
    blurb: 'The bench. I break my own things first.',
    status: 'CLOSED',
    what: 'A shelf of small computers and antennas on a network that touches nothing else in the house. New things get taken apart here and left running until they fall over.',
    why: 'Reading about a weakness is not the same as having caused one. I do not trust anything I have not taken apart, and that includes what I built.',
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
    code: 'L-04',
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
    code: 'L-05',
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
    code: 'L-06',
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
    id: 'map',
    code: 'L-07',
    title: 'MAP',
    blurb: 'Every system I run, as a city you can fly over.',
    status: 'LIVE',
    what: 'A 3D map of the whole estate. Each app is a building. Each automated job is a robot that sleeps until a message, a payment or its clock wakes it. There is a film mode for screen recording.',
    why: 'Nobody reads an architecture diagram twice. Everybody watches a city light up.',
    does: [
      'The real shape of the systems on this page, with nothing private in it.',
      'Activity on screen is simulated. No customer data, no keys, no numbers.',
    ],
    href: 'https://github.com/AttaullahSher/Architectural-Dashboard',
    hrefLabel: 'See the source',
  },
  {
    id: 'web',
    code: 'L-08',
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
