/**
 * The work, opened from the button at the end.
 *
 * Rule for this file: no invented metrics, no awards, no client logos, and
 * nothing that exposes a business's internals. Describe the shape of a system,
 * never its keys, schema, pricing rules or source.
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
    id: 'pos',
    code: 'P-01',
    title: 'POS',
    blurb: 'Point of sale and stock, built for a shop floor that never stops.',
    status: 'INTERNAL',
    what: 'A retail system for a music business: what is on the shelf, what just left it, what it was sold for, and what that means for tomorrow. Built around the counter rather than around the database.',
    why: 'Off-the-shelf retail software assumes every shop is the same shop. Ours is not. Serial-tracked instruments, trade-ins, repairs, rentals and school orders do not fit a template designed for selling t-shirts.',
    flow: [
      { step: 'SCAN', detail: 'An item is identified at the counter — barcode, serial, or by hand when the label has long since fallen off.' },
      { step: 'RESOLVE', detail: 'The system finds the one true record for it: variant, condition, location, and whether it is actually available or already promised to somebody.' },
      { step: 'PRICE', detail: 'Rules apply themselves — customer tier, bundle, trade-in credit, seasonal terms. The person at the counter is not doing arithmetic.' },
      { step: 'COMMIT', detail: 'The sale is written once. Stock moves, the ledger updates, and the receipt is generated from the same record rather than a second version of the truth.' },
      { step: 'SETTLE', detail: 'Payment is reconciled, split tenders included, and the drawer balances against what actually happened rather than what someone remembered.' },
      { step: 'REPORT', detail: 'By morning the numbers that matter are already waiting. Nobody exports anything.' },
    ],
    tech: ['TypeScript', 'Node', 'SQL', 'Offline-first sync', 'Thermal printing', 'Barcode / serial capture'],
    guarded:
      'Described at arm’s length on purpose. The pricing logic, schema and source belong to the business, not to this page.',
  },
  {
    id: 'docs',
    code: 'P-02',
    title: 'DOCS',
    blurb: 'Quotations and invoices that generate themselves.',
    status: 'INTERNAL',
    what: 'A document engine sitting on top of the same records the counter uses. An enquiry becomes a priced quotation; an accepted quotation becomes an invoice; both are filed without anyone opening a spreadsheet.',
    why: 'The same request arrived a hundred times a week in a hundred different shapes, and every one of them cost somebody twenty minutes and a template they had renamed "FINAL_v3".',
    does: [
      'Pulls items and intent out of free text, voice notes and photographs of handwritten lists.',
      'Matches against live stock and flags what it is genuinely unsure about instead of guessing.',
      'Renders the document, sends it, and files the record — one path, no second copy.',
      'Turns an acceptance into an invoice without a human retyping a single line.',
    ],
    tech: ['TypeScript', 'Node', 'Google Apps Script', 'LLM APIs', 'PDF generation'],
  },
  {
    id: 'ask',
    code: 'P-03',
    title: 'ASK',
    blurb: 'An assistant that belongs to whoever opens it.',
    status: 'LIVE',
    what: 'A browser-only assistant with durable memory, goal tracking, voice in and out, and an automatic fallback chain across open models. No backend, no build step, no account. It runs the moment the page loads.',
    why: 'Every assistant worth using wants a login and a subscription first. I wanted one that works instantly, keeps its memory on the device, and belongs to the person holding the phone.',
    does: [
      'Remembers durable facts about you and shows every one of them, deletable.',
      'Tracks what you are working toward and points its answers back at it.',
      'Talks and listens using the browser’s own speech engine — offline capable.',
      'Falls through a chain of models when one refuses or rate-limits.',
    ],
    tech: ['Vanilla JS', 'Web Speech API', 'Service Worker', 'LocalStorage', 'Open model APIs'],
    href: 'ask/',
    hrefLabel: 'Open it',
  },
  {
    id: 'data',
    code: 'P-04',
    title: 'DATA',
    blurb: 'One product truth, many storefronts.',
    status: 'ONGOING',
    what: 'Tooling that keeps product data consistent across a website and several marketplaces, and tells a human the moment they start disagreeing with each other.',
    why: 'Listings drift. A price corrected in one place stays wrong in four others, and nobody notices until a customer does — politely, in public.',
    does: [
      'Holds a single canonical record per product.',
      'Diffs every channel against it on a schedule.',
      'Reports drift as a short list of decisions, not a spreadsheet to read.',
    ],
    tech: ['Python', 'SQL', 'APIs', 'Scheduled jobs'],
  },
  {
    id: 'web',
    code: 'P-05',
    title: 'WEB',
    blurb: 'Interfaces, including the one you are standing in.',
    status: 'ONGOING',
    what: 'Sites and internal front-ends. Built for the device they will actually be opened on, which is almost never the one they were designed on.',
    why: 'Most of the web is slow because nobody measured it on a real phone, on real data, at night, on the edge of a signal.',
    does: [
      'Front-ends that hold state without falling apart.',
      'Motion that serves the content rather than delaying it.',
      'Built and measured mobile-first, not adapted down to it afterwards.',
    ],
    tech: ['TypeScript', 'React', 'Next.js', 'Tailwind', 'Canvas'],
  },
  {
    id: 'lab',
    code: 'P-06',
    title: 'LAB',
    blurb: 'Single-board computers and things that should not be online.',
    status: 'ONGOING',
    what: 'A shelf running whatever the current question is — local network monitoring, home automation, offline model inference, hardware that talks to software I wrote.',
    why: 'Some things you only understand once they are physically in front of you, refusing to boot, at one in the morning.',
    does: [
      'Watches a small network to see what actually talks to what.',
      'Runs small models locally to find where the ceiling really is.',
      'Bridges physical inputs into the same automations everything else uses.',
    ],
    tech: ['Raspberry Pi', 'Linux', 'Python', 'MQTT', 'Local inference'],
  },
  {
    id: 'grab',
    code: 'P-07',
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
    code: 'P-08',
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
    code: 'P-09',
    title: 'RANGE',
    blurb: 'A fake company, hacked on purpose every week.',
    status: 'CONCEPT',
    what: 'A plan for a practice environment. Build a small fake company — a website, a mail server, a file share, a few fake employees — attack it automatically, then delete the whole thing. What you keep is the list of alarms that actually caught the attack.',
    why: 'Security tools get bought after a good demo and are then never tested again. If an alert has never fired during a real attack, nobody knows whether it works. The only honest way to find out is to attack a copy of your own setup and see what you would have missed.',
    flow: [
      { step: 'BUILD', detail: 'The fake company is generated fresh each time, with different server names, people and passwords, so nothing can quietly memorise last week’s version.' },
      { step: 'FILL', detail: 'It gets filled in until it looks used: traffic during working hours, documents that reference each other, and one password reused somewhere it should not be.' },
      { step: 'ATTACK', detail: 'A scripted attack runs start to finish — get in, look around, move to other machines, reach something valuable — and every step is timestamped.' },
      { step: 'COMPARE', detail: 'Then compare the attack against the logs. Which steps were never recorded, which were recorded but nobody would ever read, and which alerts fired for the wrong reason.' },
      { step: 'KEEP', detail: 'Delete the company. Keep only the alerts that fired during the attack and stayed quiet during a week of normal use.' },
    ],
    tech: ['Containers', 'Infrastructure as code', 'Detection rules', 'Log pipeline', 'Ephemeral networks'],
    guarded:
      'Not built — this is a written plan. It only ever targets a fake company that the same scripts create and then delete.',
  },
  {
    id: 'trace',
    code: 'P-10',
    title: 'TRACE',
    blurb: 'Your internet is encrypted and still gives you away.',
    status: 'CONCEPT',
    what: 'A plan for a monitor on your own home network. It never reads the contents of anything — only packet sizes, timing and direction — and tries to work out what happened anyway: which device woke up, which app was used, roughly what someone was doing. Then it measures what it would take to hide that.',
    why: '"It is encrypted" is where most privacy explanations stop. But encryption hides what you sent, not that you sent it. The pattern of your traffic still shows when you wake up, what you stream, and when the house is empty — and I wanted to see how much of that is really readable.',
    flow: [
      { step: 'WATCH', detail: 'Record packet size, direction and the gaps between packets. Nothing is decrypted and no content is stored.' },
      { step: 'MATCH', detail: 'Each device has a recognisable pattern. A video starting looks nothing like a doorbell checking in, which looks nothing like a phone sitting idle overnight.' },
      { step: 'GUESS', detail: 'A small model running on the same box puts a name to each pattern, with a confidence score. What it gets wrong matters as much as what it gets right.' },
      { step: 'SHOW', detail: 'The result is a timeline of a normal day in the house, rebuilt without decrypting a single thing. It is meant to be uncomfortable to look at.' },
      { step: 'HIDE', detail: 'Then turn on padding and batching, watch the same day again, and report the real cost: how much of the timeline disappears, and how much speed and data it took to hide it.' },
    ],
    tech: ['Python', 'Packet capture', 'Time-series store', 'Local inference', 'Raspberry Pi'],
    guarded:
      'Not built — this is a written plan, and it only ever looks at a network you own.',
  },
  {
    id: 'seen',
    code: 'P-11',
    title: 'SEEN',
    blurb: 'Your phone announces itself all day. Anyone nearby can listen.',
    status: 'CONCEPT',
    what: 'A plan for a WiFi listener that measures how much your own devices give away. It does two things. It records what phones and laptops broadcast constantly, even while connected to nothing, and turns that into a picture of who is in a room and when they arrived. Then it uses the distortion in an ordinary WiFi signal to detect movement through a wall — no camera, no microphone, just the radio already sitting in the hallway.',
    why: 'Every device you own is a radio that never stops talking. A phone in your pocket calls out for networks it remembers, and a shop, a station or a parked car can write all of it down. WiFi motion sensing is now sold as a router feature. None of this is secret or difficult, which is the problem — so I would rather know exactly how much of it works on me than assume it does not.',
    flow: [
      { step: 'LISTEN', detail: 'A cheap USB WiFi adapter records what nearby devices broadcast while looking for networks. Nothing has to connect and no password is involved.' },
      { step: 'IDENTIFY', detail: 'Phones are meant to randomise their hardware address so they cannot be followed. Many still leak a real one, or hold a pattern steady long enough to matter. The point is to measure how often that protection actually fails.' },
      { step: 'MAP', detail: 'Signal strength across two or three cheap receivers places a device in a room rather than at a point. Over a week that turns into a schedule: who is home, when they leave, and which day looks different.' },
      { step: 'SENSE', detail: 'Bodies absorb and reflect WiFi. Watching how the signal between two fixed points changes shows movement, roughly where it is, and whether a room is empty — through a wall, with nothing pointed at anyone.' },
      { step: 'DEFEND', detail: 'Then the half that is worth having. Which phone settings genuinely stop this, which ones only look like they do, and what the same week of tracking produces once the working ones are switched on.' },
    ],
    tech: ['Raspberry Pi', 'USB WiFi adapter', 'Monitor mode', 'Python', 'Signal processing', 'Local storage'],
    guarded:
      'Not built — a written plan, pointed at my own home and my own devices. Doing this to people who never agreed to it is the exact thing it is meant to warn about, so it stays a plan about a house I live in.',
  },
];
