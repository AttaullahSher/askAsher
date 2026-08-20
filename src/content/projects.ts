/**
 * The work, opened from the button at the end.
 *
 * This is not a CV and it is not a set of case studies. It is what the person
 * does — what he can build, what he can find out, and what he refuses to do
 * with either. Written in the first person for that reason.
 *
 * Written for somebody who has never written a line of code and never wants
 * to. No tool names, no stack lists, no jargon: if a sentence needs a glossary
 * it gets rewritten until it does not. `made` is one human line about what it
 * actually took, in place of a list of technologies nobody outside the trade
 * can read.
 *
 * Rules: no invented metrics, no awards, no client logos, and nothing that
 * exposes a business's internals or a technique somebody could follow. Say
 * what is true about the capability. Never publish the method.
 *
 * **On hedging.** An entry states what is true and then stops. It does not
 * apologise for itself afterwards. The old file closed three entries with
 * "written down, not built" and a paragraph explaining who it had never been
 * pointed at — a strong subject followed by a flinch, which reads as fear
 * rather than as ethics. `status` already says what a thing is. `guarded`
 * survives in exactly two places: where a real client's internals are the
 * reason, and where scope genuinely needs stating once, flatly, in a single
 * line. Nowhere else.
 *
 * **On the second person.** The research entries are written about the reader,
 * not about the author. "I know what a room gives away" is a claim somebody
 * has to take on trust. "Your phone is talking right now" is a fact they can
 * check, and it does not require the writer to have done anything to anybody.
 * The subject is frightening on its own. It never needed help.
 */

export interface Project {
  id: string;
  code: string;
  title: string;
  /** One line on the closed row. */
  blurb: string;
  /**
   * What the thing *is*, not whether it shipped.
   *
   * RUNNING — live, anybody can open it.
   * IN USE  — real, running for real people, not public.
   * BENCH   — the workshop. Permanently half-apart, on purpose.
   * STUDY   — research. Understood, costed, not deployed at anybody.
   */
  status: 'RUNNING' | 'IN USE' | 'BENCH' | 'STUDY';
  what: string;
  why: string;
  does?: string[];
  /** What it actually took. One line, plain, occasionally funny. */
  made?: string;
  href?: string;
  hrefLabel?: string;
  /** Scope, stated once. Not an apology. */
  guarded?: string;
}

export const projects: Project[] = [
  {
    id: 'shift',
    code: 'P-01',
    title: 'SHIFT',
    blurb: 'I take a business off manual and leave it running without me.',
    status: 'IN USE',
    what: 'I rebuild the way a business actually runs. The till, the paperwork, the stock, and the prices sitting in four different places quietly disagreeing with each other — all of it pulled into one place that everything else asks. The jobs that used to sit waiting for a person stop waiting.',
    why: 'Every business I have been let inside was being held together by one person’s memory and a spreadsheet nobody else dares touch. That is not a system. That is a hostage situation with good intentions.',
    does: [
      'I find the hour a day that quietly disappears, and I make it stop existing.',
      'I build the thing that business actually needed, not the thing a salesman sells to everybody.',
      'I hand it over finished. If it still needs me afterwards, I built it wrong.',
    ],
    made: 'Months of it, and a great deal of arguing with a spreadsheet.',
    guarded:
      'How it prices things, and everything underneath it, belongs to the business and not to this page.',
  },
  {
    id: 'watch',
    code: 'P-02',
    title: 'WATCH',
    blurb: 'Your phone is talking right now. Not to you.',
    status: 'STUDY',
    what: 'It calls out the names of networks it has joined before — the café, the last hotel, the flat you lived in three years ago — out loud, to any room that cares to listen, connected to nothing. Bodies bend a wifi signal too, so a box in a hallway can tell that somebody is moving in the next room, roughly where they are standing, and whether the place is empty. No camera, no microphone, nothing anybody would notice. And what you send is locked, which hides the words and nothing else: when you sent it, how often, and who answered will rebuild a day on their own. What time the house woke up. Which app got opened at three. Which evening nobody came home.',
    why: 'None of it is difficult, and that is the entire point. A shop, a station, an airport or a parked car can do this today and none of them will ever mention it. The question was never whether it works. It is who is holding the other end, and whether they are the sort of person who tells you.',
    does: [
      'What a room gives away while every phone in it is connected to nothing.',
      'What a link learns the second you tap it — roughly where you are, what you are holding, what time you were awake.',
      'What the phone in your pocket can already see and hear, and how little has to change for that to stop being yours.',
      'Which settings genuinely stop it, and which ones were only ever there to make you feel better.',
    ],
    made: 'Reading, mostly. The hardware costs about the price of a dinner, which is the part that should worry you.',
    guarded: 'My own network, my own devices. There has never been a second category.',
  },
  {
    id: 'range',
    code: 'P-03',
    title: 'RANGE',
    blurb: 'I break the things that were sold as unbreakable.',
    status: 'STUDY',
    what: 'Build a working copy of something real — the machines, the staff, the emails, all of it invented but behaving like the real thing — then rob it properly, from the front door to whatever is worth stealing. Watch which alarms go off. Then delete the whole thing. What survives is one short list: what would genuinely have caught somebody, and what turned out to be expensive decoration.',
    why: 'Security gets bought after a good demonstration and then never tested again. An alarm nobody has ever set off is a wire, not a defence. Somebody has to be willing to play the burglar to find that out, and I have never had a problem being that.',
    does: [
      'I rob the copy. Never the real thing.',
      'I keep only the alarms that went off during a real attack and stayed quiet all week.',
      'Then I delete the copy. Nothing survives except the answer.',
    ],
    made: 'A weekend to build, an afternoon to destroy.',
  },
  {
    id: 'lab',
    code: 'P-04',
    title: 'LAB',
    blurb: 'The bench. I break my own things first.',
    status: 'BENCH',
    what: 'A shelf of small computers and antennas on a network that touches nothing else in the house. Anything new gets tested here, pulled apart here, and left running until it falls over. If something is going to surprise me, I would rather it happened on my own kit at one in the morning than on somebody else’s at nine.',
    why: 'Reading about a weakness is not the same as having caused one. I do not trust anything I have not personally taken apart, and that includes the things I built myself.',
    does: [
      'I attack my own things, on my own kit, on a network with nothing else on it.',
      'I find out where the ceiling really is rather than where the advertising says it is.',
      'I watch what talks to what — including the things nobody installed on purpose.',
      'Nothing reaches anybody else until it has survived the bench. Most things do not.',
    ],
    made: 'A shelf, a pile of second-hand parts, and no sensible bedtime.',
  },
  {
    id: 'ask',
    code: 'P-05',
    title: 'ASK',
    blurb: 'A thinking partner that belongs to whoever opens it. Free, no sign-up.',
    status: 'RUNNING',
    what: 'It opens in your browser and starts straight away. No account, no subscription, nothing to install. It remembers what matters about you, shows you everything it remembers, and lets you delete any of it. It will talk out loud and listen back if your hands are full. Nothing leaves your phone, because there is nowhere for it to go.',
    why: 'The people who most need to think out loud are the ones least free to do it. Every assistant worth using wants your email address and a copy of the conversation before it will say a word. So I built one with nowhere to send it.',
    does: [
      'It argues with a decision before you make it, which is much cheaper than after.',
      'It keeps track of what you are working towards and points its answers back at it.',
      'It talks and listens, so it still works while you are driving.',
      'If one brain refuses to answer, it quietly asks another one.',
    ],
    made: 'A few late nights and a stubborn refusal to add a login screen.',
    href: 'ask/',
    hrefLabel: 'Open it',
  },
  {
    id: 'grab',
    code: 'P-06',
    title: 'GRAB',
    blurb: 'Paste a link, get the video. Free, no adverts, no account.',
    status: 'RUNNING',
    what: 'A page that downloads videos. Paste the link, press the button, get the file — YouTube, Instagram, TikTok, Facebook, X, Reddit and about twenty others. Nothing is kept anywhere, because there is nowhere to keep it: the whole thing happens on your own phone.',
    why: 'Every other one of these is buried in adverts and gives up the moment anything goes wrong — usually just because one server was busy for a second. Mine keeps trying, a different way each time, until it works. Then I put it online for free, which is where most of my things end up.',
    does: [
      'It asks several servers at once and takes whichever one answers first.',
      'When something fails it reads why, then tries the way that will actually work.',
      'It keeps itself up to date. Nobody maintains it by hand.',
      'No adverts, no account, no tracking, no charge.',
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
    status: 'IN USE',
    what: 'A private way onto the internet for four people, running on a server that costs nothing. While you are on it, the café, the hotel or the airport cannot see where you go. Adding a phone takes one command and a code you point the camera at. Removing one takes less.',
    why: 'A paid service asks you to trust a company you have no way of checking. Running my own does not make anybody invisible — it means I know exactly who is in a position to keep a record of it. It is me. I do not.',
    does: [
      'Nobody else is in the middle. That is the entire point of it.',
      'Adding somebody takes one command and about ten seconds.',
      'It runs on a free server, so it costs the family nothing at all.',
    ],
    made: 'One free server, one weekend, and a family who noticed nothing had changed.',
    href: 'https://github.com/AttaullahSher/VPN',
    hrefLabel: 'Read the scripts',
    guarded: 'Nothing on this page would let anybody onto it.',
  },
  {
    id: 'web',
    code: 'P-08',
    title: 'WEB',
    blurb: 'Websites that behave like something, not like a brochure.',
    status: 'RUNNING',
    what: 'Sites and screens, including the one you are standing in. Built from nothing every time — no template, no drag-and-drop builder, no layout bought from somebody else — because the good part is always the part a template cannot do.',
    why: 'Most of what gets sold as web design is a template with somebody else’s photographs in it, approved on a big monitor in an office with fast internet. Almost nobody has opened their own site on a three-year-old phone, at night, on one bar of signal. That is the only test that counts, because that is where people actually are.',
    does: [
      'Built for the phone it will be opened on, not the laptop it was designed on.',
      'It moves because the movement means something, not to look busy.',
      'No template anywhere in it. This page included.',
    ],
    made: 'This one took longer than it should have, and it shows in the right places.',
  },
];
