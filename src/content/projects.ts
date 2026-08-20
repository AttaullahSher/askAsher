/**
 * The work, opened from the button at the end.
 *
 * This is not a CV and it is not a set of case studies. It is what the person
 * does — what he can build, what he can find out, and what he refuses to do
 * with either. Written in the first person for that reason.
 *
 * Rules for this file: no invented metrics, no awards, no client logos, and
 * nothing that exposes a business's internals or a technique anybody could
 * follow. Say what is true about the capability. Never publish the method.
 *
 * Anything not actually built carries status CONCEPT and says so in `guarded`.
 * A design is worth reading. A design wearing a shipped system's clothes is a
 * lie, and this page does not tell any.
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
  tech: string[];
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
    what: 'I rebuild how a business actually runs. The counter, the paperwork, the stock, the product data sitting in four different places disagreeing with itself — all of it collapsed into one record that everything else reads from. The work that used to wait on a person stops waiting.',
    why: 'Every business I have been let into was being held together by one person’s memory and a spreadsheet nobody else fully understands. That is not a system. That is a hostage situation with good intentions.',
    does: [
      'I find the hour a day that is quietly disappearing, and I make it stop existing.',
      'I build the thing that business needed, not the thing a vendor sells to everybody.',
      'I hand it over finished. If it still needs me afterwards, I designed it badly.',
    ],
    tech: ['TypeScript', 'Node', 'SQL', 'LLM APIs', 'Offline-first sync'],
    guarded:
      'Held at arm’s length on purpose. The pricing, the schema and the source belong to the business, not to this page.',
  },
  {
    id: 'data',
    code: 'P-02',
    title: 'DATA',
    blurb: 'I read patterns. Everybody leaves them.',
    status: 'INTERNAL',
    what: 'I keep patterns rather than facts. Not what anybody said — what they do, and when, and how that quietly changes: who slips at the end of every month, who goes silent for a fortnight before they spend, which machine changes its rhythm long before it fails. It is filed in a structure that exists in exactly one place, and that place is not a document.',
    why: 'I notice this whether I want to or not. Loose, it turns into gossip, or leverage, or a favour somebody asks for quietly. Given a shape, it turns into knowing what next month looks like before next month does. Which of the two it becomes has never once been a technical question.',
    does: [
      'I can usually tell what somebody is about to do before they have finished deciding.',
      'Nobody has to tell me anything. People announce themselves in their timing.',
      'None of it is written down anywhere it could be taken, copied, or explained to a third party.',
      'It has never been pointed at a person. Not for revenge, not as a favour, not for somebody with a very good reason.',
    ],
    tech: ['Python', 'SQL', 'Time-series store', 'Local inference'],
    guarded:
      'Deliberately vague, and staying that way. If somebody needs it explained before they could use it, that is already the answer.',
  },
  {
    id: 'trace',
    code: 'P-03',
    title: 'TRACE',
    blurb: 'Your traffic is encrypted. Your day is still readable.',
    status: 'CONCEPT',
    what: 'Encryption hides what you said. It has never hidden that you said it, when, how often, or to whom. From nothing but packet sizes, timing and direction you can rebuild a day: when the house woke up, which app was opened, what was streamed, which evening nobody was home. And then measure precisely what it costs to make that unreadable.',
    why: '"It is encrypted" is where most people stop thinking, and I would like to take that sentence away from them gently, on their own network, before somebody less friendly does it for nothing.',
    does: [
      'I know what a network gives away with not one thing decrypted.',
      'I know which devices announce themselves, how often, and how loudly.',
      'I know what it costs to shut them up, and it is never free.',
    ],
    tech: ['Python', 'Packet capture', 'Time-series store', 'Local inference', 'Raspberry Pi'],
    guarded:
      'Written as a plan, pointed at a network I pay for. It has never been aimed at anybody else’s.',
  },
  {
    id: 'watch',
    code: 'P-04',
    title: 'WATCH',
    blurb: 'Every device you own is a radio. I know how to listen.',
    status: 'CONCEPT',
    what: 'Phones and laptops broadcast all day, to nothing in particular, whether they are connected to anything or not. A room can be read from that alone — who is in it, when they arrived, which day looks different from every other day. Movement through a wall can be read from the distortion in an ordinary wifi signal. No camera. No microphone. The radio already sitting in the hallway is enough.',
    why: 'Listening and watching are a craft, and the craft is mostly patience. None of it is difficult, which is exactly the problem — a shop, a station or a parked car can do it to you today and never mention it. I would rather know precisely how much of it works on me.',
    does: [
      'I know what a room gives away when nobody has connected to anything.',
      'I know which phone settings genuinely stop it, and which ones only look like they do.',
      'I have never pointed any of it at somebody who did not know.',
    ],
    tech: ['Raspberry Pi', 'USB WiFi adapter', 'Monitor mode', 'Python', 'Signal processing'],
    guarded:
      'Written as a plan, pointed at my own home and my own devices, and it stays there. Doing this to people who never agreed to it is the exact thing it is meant to warn about.',
  },
  {
    id: 'range',
    code: 'P-05',
    title: 'RANGE',
    blurb: 'I break the things that were sold as unbreakable.',
    status: 'CONCEPT',
    what: 'Build a live copy of something real, attack it from end to end, and watch what the alarms actually did. Then destroy the copy. The only thing that survives is a short list: what would genuinely have caught somebody, and what turned out to be decoration with a licence fee.',
    why: 'Security is bought after a good demonstration and then never tested again. An alarm nobody has ever set off is a wire, not a defence. Somebody has to be willing to be the attacker to find that out, and I have never had a problem being that.',
    does: [
      'I attack a copy of the thing. Never the thing.',
      'I keep only what fired during a real attack and stayed silent all week.',
      'I delete the copy. Nothing survives the exercise except the answer.',
    ],
    tech: ['Containers', 'Infrastructure as code', 'Detection engineering', 'Ephemeral networks'],
    guarded:
      'Written as a plan. It only ever points at an environment the same scripts create and then delete — mine, or one I was invited into. There is no technique anywhere on this page.',
  },
  {
    id: 'lab',
    code: 'P-06',
    title: 'LAB',
    blurb: 'The bench. I break my own things first.',
    status: 'ONGOING',
    what: 'A shelf of small computers and radios on a network that touches nothing else. Anything new is tested here, attacked here, and left running until it fails. If something is going to surprise me, I would rather it did so on my own hardware at one in the morning.',
    why: 'Reading about a weakness is not the same as having caused one. I do not trust anything I have not personally taken apart, and that includes the things I built.',
    does: [
      'I attack my own systems, on my own hardware, on a network with nothing else on it.',
      'I run models locally to find the real ceiling rather than the advertised one.',
      'I watch what talks to what — including the things nobody installed on purpose.',
      'Nothing reaches anybody else until it has survived the bench. Most things do not.',
    ],
    tech: ['Raspberry Pi', 'Linux', 'Python', 'MQTT', 'Local inference', 'Isolated network'],
    guarded:
      'Isolated on purpose. Everything on the bench is mine, and none of it has ever been pointed outward.',
  },
  {
    id: 'ask',
    code: 'P-07',
    title: 'ASK',
    blurb: 'A thinking partner that belongs to whoever opens it. Free.',
    status: 'LIVE',
    what: 'An assistant that runs entirely in the browser — lasting memory, goal tracking, voice in and out, and an automatic fallback across several open models. No account, no subscription, no server. It opens the moment the page loads and everything it knows about you stays on your own device.',
    why: 'The people who have to decide things are the ones least free to ask openly. Every assistant worth using wants a login and a copy of the conversation first. So I built one that has nowhere to send it.',
    does: [
      'It remembers what matters about you, shows you all of it, and lets you delete any of it.',
      'It argues with a decision before you make it, which is considerably cheaper than after.',
      'It talks and listens, so it works while you are driving or your hands are full.',
      'It falls through a chain of models when one refuses, so you still get an answer.',
    ],
    tech: ['Vanilla JS', 'Web Speech API', 'Service Worker', 'LocalStorage', 'Open model APIs'],
    href: 'ask/',
    hrefLabel: 'Open it',
  },
  {
    id: 'grab',
    code: 'P-08',
    title: 'GRAB',
    blurb: 'Paste a link, get the video. Free, no adverts, no account.',
    status: 'LIVE',
    what: 'A page that downloads videos. Paste the link, press the button, get the file — YouTube, Instagram, TikTok, Facebook, X, Reddit and about twenty others. Nothing is stored on a server because there is no server: it is a static page and it all happens in your browser.',
    why: 'Every other one of these is buried in adverts and gives up the moment a request fails — even though a failed request usually just means one server was busy. So mine keeps trying, a different way each time, until something works. Then I put it online for nothing, which is where most of my tools end up.',
    does: [
      'It races several download servers and takes whichever answers first.',
      'It reads the error before retrying, so it never wastes your time on a retry that cannot work.',
      'It keeps its own server list up to date on a schedule. Nobody maintains it by hand.',
      'It costs nothing, tracks nothing, and asks you for nothing.',
    ],
    tech: ['Vanilla JS', 'Service Worker', 'PWA share target', 'GitHub Actions', 'Cobalt API'],
    href: 'https://attaullahsher.github.io/Ashgrab/',
    hrefLabel: 'Open it',
  },
  {
    id: 'vpn',
    code: 'P-09',
    title: 'VPN',
    blurb: 'A private VPN for my family. I am the only one who could keep logs.',
    status: 'INTERNAL',
    what: 'A WireGuard VPN for four people, running on a free cloud server, with its own private resolver inside the tunnel so the network you are sitting on cannot see where you go. The whole thing is scripted: one command adds a device, another revokes it, and nothing else gets disconnected.',
    why: 'A paid VPN asks you to trust a company you have no way of checking. Running my own does not make anybody anonymous — it means I know exactly who is in a position to keep logs, and it is me, and I do not.',
    does: [
      'Nobody else is in the path. That is the entire point of it.',
      'Adding a device takes one command and a QR code.',
      'It runs on a free tier, so it costs the family nothing.',
    ],
    tech: ['WireGuard', 'Bash', 'Ubuntu', 'iptables', 'Unbound', 'Oracle Cloud'],
    href: 'https://github.com/AttaullahSher/VPN',
    hrefLabel: 'Read the scripts',
    guarded:
      'Keys and device settings are not on this page. The scripts will not print a private key unless you ask them to.',
  },
  {
    id: 'web',
    code: 'P-10',
    title: 'WEB',
    blurb: 'Interfaces that behave like software, not like brochures.',
    status: 'ONGOING',
    what: 'Sites and internal screens, including the one you are standing in. Built from nothing every time — no template, no page builder, no bought layout — because the part that matters is always the part a template cannot do.',
    why: 'Most of what is sold as web design is a template with somebody else’s photographs in it, signed off on a desktop monitor in an office with good internet. Almost nobody has opened their own site on a three-year-old phone, at night, on one bar of signal, with real data in it. That is the only test that counts.',
    does: [
      'Built for the device it will be opened on, not the one it was designed on.',
      'Motion that carries the content instead of delaying it.',
      'No template and no page builder anywhere in it — this page included.',
    ],
    tech: ['TypeScript', 'React', 'Next.js', 'Tailwind', 'Canvas', 'Web Audio'],
  },
];
