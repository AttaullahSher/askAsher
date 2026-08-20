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
 * Anything not actually built carries status CONCEPT and says so in `guarded`.
 */

export interface Project {
  id: string;
  code: string;
  title: string;
  /** One line on the closed row. */
  blurb: string;
  status: 'LIVE' | 'INTERNAL' | 'ONGOING' | 'CONCEPT';
  what: string;
  why: string;
  does?: string[];
  /** What it actually took. One line, plain, occasionally funny. */
  made?: string;
  href?: string;
  hrefLabel?: string;
  /** Shown where something is deliberately held at arm's length. */
  guarded?: string;
}

export const projects: Project[] = [
  {
    id: 'shift',
    code: 'P-01',
    title: 'SHIFT',
    blurb: 'I take a business off manual and leave it running without me.',
    status: 'INTERNAL',
    what: 'I rebuild the way a business actually runs. The till, the paperwork, the stock, and the prices sitting in four different places quietly disagreeing with each other — all of it pulled into one place that everything else asks. The jobs that used to sit waiting for a person stop waiting.',
    why: 'Every business I have been let inside was being held together by one person’s memory and a spreadsheet nobody else dares touch. That is not a system. That is a hostage situation with good intentions.',
    does: [
      'I find the hour a day that quietly disappears, and I make it stop existing.',
      'I build the thing that business actually needed, not the thing a salesman sells to everybody.',
      'I hand it over finished. If it still needs me afterwards, I built it wrong.',
    ],
    made: 'Months of it, and a great deal of arguing with a spreadsheet.',
    guarded:
      'Held at arm’s length on purpose. How it prices things, and everything underneath it, belongs to the business and not to this page.',
  },
  {
    id: 'data',
    code: 'P-02',
    title: 'DATA',
    blurb: 'I read patterns. Everybody leaves them.',
    status: 'INTERNAL',
    what: 'I keep patterns, not facts. Not what people say — what they do, and when, and how that quietly changes. Who goes silent for two weeks before they spend money. Who always slips in the last week of the month. Which machine starts sounding different long before it dies. All of it filed in a shape that exists in one place, and that place is not written down anywhere.',
    why: 'I notice this whether I want to or not. Left lying around, it turns into gossip, or leverage, or a favour somebody asks me for quietly. Given a shape, it turns into knowing what next month looks like before next month does. Which of the two it becomes has never been a technical question.',
    does: [
      'I can usually tell what somebody is going to do before they have finished deciding it.',
      'Nobody has to tell me anything. People announce themselves in their timing.',
      'It is not written down anywhere it could be taken, copied, or explained to somebody else.',
      'It has never been used against a person. Not for revenge, not as a favour, not for someone with a very good reason.',
    ],
    made: 'Years of paying attention, and a filing system I will never describe to anyone.',
    guarded:
      'Deliberately vague, and staying that way. If somebody needs it explained before they could use it, that is already the answer.',
  },
  {
    id: 'watch',
    code: 'P-03',
    title: 'WATCH',
    blurb: 'Wifi can find you in a room. Through the wall. With nothing pointed at you.',
    status: 'CONCEPT',
    what: 'Your phone talks all day. Not to you — out loud, to the air, whether it is connected to anything or not, calling out the name of every network it has ever known. Sit in a café with the right ears switched on and you can tell who walked in, when, and which of them was here yesterday. Then there is the stranger half: bodies bend a wifi signal, so the box in the hallway can tell that somebody is moving in the next room, roughly where they are standing, and whether the place is empty. No camera. No microphone. Nothing anybody would ever notice.',
    why: 'None of this is difficult, which is the entire problem. A shop, a station, an airport or a parked car can do it to you today and will never mention it. I would rather know exactly how much of it works on me, and on the people I care about, than assume it does not.',
    does: [
      'I know what a room gives away while everybody in it is connected to nothing.',
      'I know what a link learns about you the second you tap it — roughly where you are, what you are holding, and what time you were awake.',
      'I know what the phone in your pocket can see and hear, and how little it takes for that to stop being yours.',
      'I know which settings genuinely stop all of this, and which ones only make you feel better.',
      'I have never pointed any of it at somebody who did not know.',
    ],
    made: 'A cheap antenna, a small computer, and the patience to sit still and listen.',
    guarded:
      'Written down, not built. Pointed at my own home and my own devices, and it stays there — doing this to people who never agreed to it is the exact thing it is meant to warn about.',
  },
  {
    id: 'trace',
    code: 'P-04',
    title: 'TRACE',
    blurb: 'Everything you send is locked. Your day is still an open book.',
    status: 'CONCEPT',
    what: 'Locking a message hides what you said. It has never hidden that you said it, or when, or how often, or who answered. Sit quietly on a network and a day rebuilds itself out of nothing but timing: when the house woke up, which app got opened, what was watched, which evening nobody came home. Then work out what it would actually take to make that unreadable.',
    why: '"It is encrypted" is where most people stop worrying. I would like to take that sentence away from them gently, on their own network, before somebody far less friendly does it for free.',
    does: [
      'I know what a house gives away without a single message being opened.',
      'I know which of your gadgets shout the loudest, and how often.',
      'I know what it costs to shut them up, and it is never free.',
    ],
    made: 'A small computer in a cupboard, and a very boring week of watching it.',
    guarded:
      'Written down, not built, and pointed at a network I pay for. It has never been aimed at anybody else’s.',
  },
  {
    id: 'range',
    code: 'P-05',
    title: 'RANGE',
    blurb: 'I break the things that were sold as unbreakable.',
    status: 'CONCEPT',
    what: 'Build a working copy of something real — the machines, the staff, the emails, all of it invented but behaving like the real thing — then rob it properly, from the front door to whatever is worth stealing. Watch which alarms go off. Then delete the whole thing. What survives is one short list: what would genuinely have caught somebody, and what turned out to be expensive decoration.',
    why: 'Security gets bought after a good demonstration and then never tested again. An alarm nobody has ever set off is a wire, not a defence. Somebody has to be willing to play the burglar to find that out, and I have never had a problem being that.',
    does: [
      'I rob the copy. Never the real thing.',
      'I keep only the alarms that went off during a real attack and stayed quiet all week.',
      'Then I delete the copy. Nothing survives except the answer.',
    ],
    made: 'On paper so far. A weekend to build, an afternoon to destroy.',
    guarded:
      'Written down, not built. It only ever points at something the same scripts create and then delete — mine, or one I was invited into. There is no method anywhere on this page.',
  },
  {
    id: 'lab',
    code: 'P-06',
    title: 'LAB',
    blurb: 'The bench. I break my own things first.',
    status: 'ONGOING',
    what: 'A shelf of small computers and antennas on a network that touches nothing else in the house. Anything new gets tested here, pulled apart here, and left running until it falls over. If something is going to surprise me, I would rather it happened on my own kit at one in the morning than on somebody else’s at nine.',
    why: 'Reading about a weakness is not the same as having caused one. I do not trust anything I have not personally taken apart, and that includes the things I built myself.',
    does: [
      'I attack my own things, on my own kit, on a network with nothing else on it.',
      'I find out where the ceiling really is rather than where the advertising says it is.',
      'I watch what talks to what — including the things nobody installed on purpose.',
      'Nothing reaches anybody else until it has survived the bench. Most things do not.',
    ],
    made: 'A shelf, a pile of second-hand parts, and no sensible bedtime.',
    guarded:
      'Cut off from everything on purpose. It is all mine, and none of it has ever been pointed outward.',
  },
  {
    id: 'ask',
    code: 'P-07',
    title: 'ASK',
    blurb: 'A thinking partner that belongs to whoever opens it. Free, no sign-up.',
    status: 'LIVE',
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
    code: 'P-08',
    title: 'GRAB',
    blurb: 'Paste a link, get the video. Free, no adverts, no account.',
    status: 'LIVE',
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
    code: 'P-09',
    title: 'VPN',
    blurb: 'A private tunnel for my family. I am the only one who could keep a record.',
    status: 'INTERNAL',
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
    guarded:
      'Nothing on this page would let anybody onto it. The scripts keep their mouths shut unless I ask them not to.',
  },
  {
    id: 'web',
    code: 'P-10',
    title: 'WEB',
    blurb: 'Websites that behave like something, not like a brochure.',
    status: 'ONGOING',
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
