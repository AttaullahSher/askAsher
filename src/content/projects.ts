/**
 * The work, opened from the button at the end.
 *
 * Rule for this file: no invented metrics, no awards, no client logos, and
 * nothing that exposes a business's internals. Describe the shape of a system,
 * never its keys, schema, pricing rules or source.
 *
 * Written for the person paying for it, not the person maintaining it. If a
 * line cannot be read by somebody who has never written code, it gets rewritten
 * until it can.
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
  /** Optional ordered flow — used where "how it works" is the interesting part. */
  flow?: { step: string; detail: string }[];
  does?: string[];
  tech: string[];
  href?: string;
  hrefLabel?: string;
  /** Shown where a system is deliberately described at arm's length. */
  guarded?: string;
}

export const projects: Project[] = [
  {
    id: 'shift',
    code: 'P-01',
    title: 'SHIFT',
    blurb: 'A whole business moved off manual — counter, paperwork and product data as one system.',
    status: 'INTERNAL',
    what: 'The operating layer of a music business, rebuilt as one system instead of six habits. What is on the shelf, what just left it, what it was sold for, the quotation that started it, the invoice that ended it, and the same product information holding still across a website and several marketplaces. One record, written once, that everything else reads from.',
    why: 'Off-the-shelf retail software assumes every shop is the same shop. Ours is not — serial-tracked instruments, trade-ins, repairs, rentals and school orders do not fit a template designed for selling t-shirts. So the gaps were filled with people: a spreadsheet here, a renamed template there, one person who remembers what the last customer paid. That holds until nine in the morning, when forty things need answering at once.',
    flow: [
      { step: 'CAPTURE', detail: 'A request arrives however it likes — at the counter, on WhatsApp, as a voice note, as a photograph of a handwritten list. It is read into proper line items instead of being retyped by somebody.' },
      { step: 'RESOLVE', detail: 'The system finds the one true record for each item: variant, condition, location, and whether it is genuinely available or already promised to someone else.' },
      { step: 'PRICE', detail: 'The rules apply themselves — customer tier, bundle, trade-in credit, seasonal terms. Nobody at the counter is doing arithmetic, and nobody is guessing.' },
      { step: 'ISSUE', detail: 'The quotation writes itself, sends itself and files itself. When it is accepted it becomes an invoice without a single line being typed a second time.' },
      { step: 'COMMIT', detail: 'The sale is written once. Stock moves, the ledger updates, and the receipt comes from that same record rather than a second version of the truth.' },
      { step: 'SYNC', detail: 'Website and marketplace listings are checked against that record on a schedule. Where they have drifted apart, it comes back as a short list of decisions rather than a spreadsheet to read.' },
      { step: 'REPORT', detail: 'By morning the numbers that matter are already waiting. Nobody exports anything.' },
    ],
    tech: ['TypeScript', 'Node', 'SQL', 'Offline-first sync', 'LLM APIs', 'PDF generation', 'Barcode / serial capture'],
    guarded:
      'Described at arm’s length on purpose. The pricing logic, the schema and the source belong to the business, not to this page.',
  },
  {
    id: 'ask',
    code: 'P-02',
    title: 'ASK',
    blurb: 'A second opinion that belongs to whoever opens it, and reports to nobody.',
    status: 'LIVE',
    what: 'A browser-only assistant with a memory that lasts, goal tracking, voice in and out, and an automatic fallback across several open models. No backend, no build step, no account. It runs the moment the page loads, and everything it knows about you stays on the device it is running on.',
    why: 'The people who have to decide things are the ones least free to ask openly. Every assistant worth using wants a login, a subscription and a copy of the conversation first. I wanted one that opens instantly, understands the situation of the person holding the phone, and has no server anywhere to leak it from.',
    does: [
      'Remembers the durable facts about you, and shows you every one of them, deletable.',
      'Tracks what you are working toward and points its answers back at it.',
      'Argues with a decision before it is made, which is considerably cheaper than after.',
      'Talks and listens through the browser’s own speech engine — usable driving, walking, or with both hands full.',
      'Falls through a chain of models when one refuses or rate-limits, so an answer still arrives.',
    ],
    tech: ['Vanilla JS', 'Web Speech API', 'Service Worker', 'LocalStorage', 'Open model APIs'],
    href: 'ask/',
    hrefLabel: 'Open it',
  },
  {
    id: 'data',
    code: 'P-03',
    title: 'DATA',
    blurb: 'Patterns, kept somewhere no other mind can reach.',
    status: 'INTERNAL',
    what: 'A private record of patterns rather than facts. Not what anybody said — how things behave over time: which supplier slips in the last week of a month, which customer goes quiet for a fortnight before a large order, which machine changes its rhythm a month before it fails. It is filed in a structure that exists in exactly one place, and that place is not a document.',
    why: 'I notice patterns whether I want to or not. Left loose, that turns into gossip, or leverage, or a favour somebody asks for quietly. Given a structure, it turns into forecasting — I know roughly what next month looks like before next month does. The difference between those two outcomes was never technical. It is entirely about what the person holding it refuses to do with it.',
    does: [
      'Reads behaviour over time instead of keeping what anyone said or wrote.',
      'Turns "something feels off with this account" into a date, a number and a reason.',
      'Answers to one person. No export, no sharing, no second copy on anybody else’s machine.',
      'Is never pointed at a person for leverage — not for revenge, not as a favour, not for someone who asks nicely and has a very good reason.',
    ],
    tech: ['Python', 'SQL', 'Time-series store', 'Scheduled jobs', 'Local inference'],
    guarded:
      'Deliberately vague, and staying that way. The structure is not written down — not in a schema, not in a note, not on this page — so there is nothing to hand over, steal, or talk anybody out of. If somebody needs it explained before they can use it, that is already the answer.',
  },
  {
    id: 'web',
    code: 'P-04',
    title: 'WEB',
    blurb: 'Interfaces that behave like software, not like brochures.',
    status: 'ONGOING',
    what: 'Websites and internal screens, including the one you are standing in. Built from nothing every time — no template, no page builder, no bought layout — because the part that matters is always the part a template cannot do: state that holds, motion that means something, and a screen that still answers on a tired phone.',
    why: 'Most of what is sold as web design is a template with somebody else’s photographs in it, approved on a desktop monitor in an office with good internet. Almost nobody has opened their own site on a three-year-old phone, at night, on one bar of signal, with real data in it. That is the only test that counts, because that is where it will actually be opened.',
    does: [
      'Built for the device it will be opened on, not the one it was designed on.',
      'Motion that carries the content instead of delaying it.',
      'No template and no page builder anywhere in it — this page included.',
      'Measured rather than assumed: if it cannot answer in about a second on a bad connection, it is not finished.',
    ],
    tech: ['TypeScript', 'React', 'Next.js', 'Tailwind', 'Canvas', 'Web Audio'],
  },
  {
    id: 'lab',
    code: 'P-05',
    title: 'LAB',
    blurb: 'The bench where I break my own things first.',
    status: 'ONGOING',
    what: 'A shelf of small computers, radios and half-finished ideas, on a network that touches nothing else. It is where anything new gets tested, attacked, and left running until it fails: a model running locally, a device that should never have been online, a system I would rather take apart myself than have somebody else take apart later.',
    why: 'Reading about a weakness is not the same as having caused one. You do not properly understand a thing until you have watched it come apart in front of you at one in the morning, on hardware you paid for and can therefore ruin.',
    does: [
      'Attacks my own systems, on my own hardware, on a network with nothing else on it.',
      'Runs models locally to find where the real ceiling is rather than the advertised one.',
      'Watches that small network to see what actually talks to what — including the things nobody installed on purpose.',
      'Nothing reaches a business until it has survived the bench. Most things do not.',
    ],
    tech: ['Raspberry Pi', 'Linux', 'Python', 'MQTT', 'Local inference', 'Isolated network'],
    guarded:
      'Isolated on purpose. Everything on the bench is mine, and none of it has ever been pointed outward.',
  },
  {
    id: 'grab',
    code: 'P-06',
    title: 'GRAB',
    blurb: 'Paste a video link, get the file. It keeps trying until one works.',
    status: 'LIVE',
    what: 'A web page that downloads videos. Paste a link, check the thumbnail, press Download. It works with YouTube, Instagram, TikTok, Facebook, X, Reddit and about twenty other sites. No account, no ads, and nothing kept on a server — it is a static page, so it all happens in your browser. The actual extraction is done by cobalt, an open-source downloader server; this is the app around it.',
    why: 'Most download sites are covered in adverts and give up as soon as one request fails. But a failed request usually only means that one server was busy, or that one video quality was not available. Trying again a different way normally works, so I built something that does that automatically.',
    flow: [
      { step: 'CHECK', detail: 'When the page opens it tests every download server and puts the fastest working ones first. If you run your own server, it always goes first.' },
      { step: 'RACE', detail: 'Your link goes to the two fastest servers at the same time. Whichever answers first wins.' },
      { step: 'RETRY', detail: 'If that fails it tries again with different settings: send the file through the server instead of direct, drop from 1080 to 720, use a different video format, or fall back to the older API.' },
      { step: 'REACT', detail: 'It reads the error before retrying. "Needs an API key" means skip that server. "Rate limited" means stop and move on. "Link not supported" means retrying will not help.' },
      { step: 'DOWNLOAD', detail: 'The file saves with a progress bar and a proper filename. If the browser blocks that, it falls back to a normal download link, then to opening the video in a new tab.' },
      { step: 'UPDATE', detail: 'Once a week a scheduled job checks which public servers are still alive and rewrites its own server list. Nobody maintains it by hand.' },
    ],
    tech: ['Vanilla JS', 'Service Worker', 'PWA share target', 'GitHub Actions', 'Cobalt API'],
    href: 'https://attaullahsher.github.io/Ashgrab/',
    hrefLabel: 'Open it',
  },
  {
    id: 'vpn',
    code: 'P-07',
    title: 'VPN',
    blurb: 'A private VPN for four people, on a free cloud server.',
    status: 'INTERNAL',
    what: 'A WireGuard VPN for my family, running on a free Oracle Cloud ARM server. The whole setup is scripted: run the scripts and you get a working VPN with its own DNS, plus one command to add a device and another to remove it. You can run any script twice without breaking anything.',
    why: 'A paid VPN asks you to trust a company you have no way of checking. Running my own does not make anyone anonymous, but it does mean I know exactly who is in a position to keep logs, and that is me. It also runs on Oracle’s free tier, so it costs nothing.',
    flow: [
      { step: 'FIREWALL', detail: 'Ubuntu on Oracle blocks traffic on the server itself, not just in the cloud firewall, so opening ports in the Oracle console is not enough. The scripts add each rule above that block rule, then check the order is right.' },
      { step: 'TUNNEL', detail: 'WireGuard runs on UDP 51820 at MTU 1420. TCP packet size is also capped to the real network limit, which fixes the common bug where a page loads halfway and then hangs.' },
      { step: 'DNS', detail: 'A resolver runs inside the tunnel and can only be reached by connected devices. It sends lookups upstream encrypted, so the wifi you are on cannot see which sites you visit.' },
      { step: 'DEVICES', detail: 'One command adds a device and prints a QR code to scan. Another revokes it. Both apply immediately without restarting the VPN, so nobody else gets disconnected.' },
      { step: 'CHECK', detail: 'A verify script tests connections, firewall order, DNS, packet size and speed. A second one shows how much data has been used against the 10 TB free limit, so there is never a surprise.' },
    ],
    tech: ['WireGuard', 'Bash', 'Ubuntu', 'iptables', 'Unbound', 'cloud-init', 'Oracle Cloud'],
    href: 'https://github.com/AttaullahSher/VPN',
    hrefLabel: 'Read the scripts',
    guarded:
      'Keys and device settings are not on this page. The scripts will not print a private key unless you ask them to.',
  },
  {
    id: 'range',
    code: 'P-08',
    title: 'RANGE',
    blurb: 'A proving ground. A defence that has never been shot at is decoration.',
    status: 'CONCEPT',
    what: 'A plan for a proving ground: a disposable copy of a real environment — servers, staff accounts, mail, file shares, ordinary working traffic — generated from nothing, attacked from end to end, then destroyed. What comes out is one short list. The alarms that actually fired, and the ones that stayed quiet while somebody walked the length of the building.',
    why: 'Security is usually bought after a good demonstration and then never tested again. An alarm nobody has ever set off is a wire, not a defence. The only honest way to learn what your own setup would catch is to attack a copy of it and count what walked straight through.',
    flow: [
      { step: 'BUILD', detail: 'The environment is generated fresh for every run — different machines, names, people and passwords — so nothing can quietly memorise last week’s version and score well by remembering.' },
      { step: 'INHABIT', detail: 'It is lived in until it looks real: traffic during working hours, documents that reference each other, and exactly one password reused somewhere it should not be.' },
      { step: 'RUN', detail: 'A full attack executes start to finish — get in, look around, move sideways, reach something that matters — with every step timestamped as it happens.' },
      { step: 'SCORE', detail: 'The attack is laid over the logs. Which steps were never recorded at all, which were recorded somewhere nobody would ever read, and which alarms fired for entirely the wrong reason.' },
      { step: 'KEEP', detail: 'Delete the environment. Keep only the detections that fired during the attack and stayed silent through a week of ordinary work. Everything else was decoration.' },
    ],
    tech: ['Containers', 'Infrastructure as code', 'Detection engineering', 'Log pipeline', 'Ephemeral networks'],
    guarded:
      'Not built — this is a written plan. It only ever points at an environment the same scripts create and then delete, and there is no technique anywhere on this page.',
  },
  {
    id: 'trace',
    code: 'P-09',
    title: 'TRACE',
    blurb: 'Everything you own is encrypted. Your whole day is still readable.',
    status: 'CONCEPT',
    what: 'A plan for a monitor on my own network that never reads a single message. Sizes, timing and direction only — and from that alone it rebuilds the day: when the house woke up, which app was opened, what was streamed, which evening nobody was home. Then it measures exactly what it costs to make that unreadable again.',
    why: '"It is encrypted" is where most conversations about privacy stop. Encryption hides what you said. It has never hidden that you said it, when, how often, or to whom — and that shape alone describes a routine to anyone patient enough to write it down. I would rather know precisely how much of mine is legible than assume none of it is.',
    flow: [
      { step: 'WATCH', detail: 'Record packet size, direction and the gaps between packets. Nothing is decrypted and no content is stored.' },
      { step: 'MATCH', detail: 'Every device has a signature. A video starting looks nothing like a doorbell checking in, which looks nothing like a phone asleep on a bedside table.' },
      { step: 'NAME', detail: 'A small model on the same box puts a name to each pattern, with a confidence score. What it gets wrong matters as much as what it gets right.' },
      { step: 'REBUILD', detail: 'The output is an ordinary day in the house, reconstructed without decrypting a single thing. It is meant to be uncomfortable to look at.' },
      { step: 'HIDE', detail: 'Then padding and batching go on, the same day runs again, and the real cost is reported: how much of the timeline disappears, and what it took in speed and data to make it disappear.' },
    ],
    tech: ['Python', 'Packet capture', 'Time-series store', 'Local inference', 'Raspberry Pi'],
    guarded:
      'Not built — this is a written plan, and it only ever looks at a network I pay for.',
  },
  {
    id: 'watch',
    code: 'P-10',
    title: 'WATCH',
    blurb: 'Every device you own is a radio that never stops talking.',
    status: 'CONCEPT',
    what: 'A plan for a listening post, and for the discipline of running one. Phones and laptops broadcast constantly, to nothing in particular, all day. This records what a room gives away while nothing is connected to anything — who is present, when they arrived, which day looks different from the others — and then reads movement through a wall from the distortion in an ordinary WiFi signal. No camera. No microphone. Just the radio already sitting in the hallway.',
    why: 'Listening and watching are a craft, and the craft is mostly patience. A phone in a pocket calls out for every network it remembers, and a shop, a station or a parked car can write all of it down. Motion sensing through walls is now sold as a router feature. None of it is secret or difficult, which is exactly the problem — so I would rather know precisely how much of it works on me than assume it does not.',
    flow: [
      { step: 'LISTEN', detail: 'A cheap USB WiFi adapter records what nearby devices broadcast while looking for networks. Nothing has to connect and no password is involved.' },
      { step: 'IDENTIFY', detail: 'Phones are meant to randomise their hardware address so they cannot be followed. Many still leak a real one, or hold a pattern steady long enough to matter. The point is to measure how often that protection actually fails.' },
      { step: 'PLACE', detail: 'Signal strength across two or three cheap receivers puts a device in a room rather than at a point. Over a week that becomes a schedule: who is home, when they leave, and which day breaks the pattern.' },
      { step: 'SENSE', detail: 'Bodies absorb and reflect WiFi. Watching how the signal between two fixed points changes shows movement, roughly where it is, and whether a room is empty — through a wall, with nothing pointed at anyone.' },
      { step: 'DEFEND', detail: 'Then the half that is worth having. Which phone settings genuinely stop this, which ones only look like they do, and what the same week of tracking produces once the working ones are switched on.' },
    ],
    tech: ['Raspberry Pi', 'USB WiFi adapter', 'Monitor mode', 'Python', 'Signal processing', 'Local storage'],
    guarded:
      'Not built — a written plan, pointed at my own home and my own devices. Doing this to people who never agreed to it is the exact thing it is meant to warn about, so it stays a plan about a house I live in.',
  },
];
