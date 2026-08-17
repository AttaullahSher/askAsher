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
    blurb: 'Paste a link, get the video. It refuses to give up.',
    status: 'LIVE',
    what: 'A static page that takes a video link and hands back the file. No account, no ads, nothing stored anywhere. Extraction is done by cobalt, an open-source no-logs server — this is the client wrapped around it, and the part worth reading is what happens after the first attempt fails.',
    why: 'Every downloader on the web is four adverts and a redirect around a single request that usually fails. But one failure rarely means a link is undownloadable. It means one server, one quality, or one codec path is having a bad day.',
    flow: [
      { step: 'SORT', detail: 'Backends are health-checked while the page is still loading and ordered fastest-first. Your own instance, if you run one, goes to the top and stays there.' },
      { step: 'RACE', detail: 'The first request goes to the two fastest healthy servers at once. Whichever answers first wins and the other is dropped.' },
      { step: 'WALK', detail: 'On failure it works a grid of servers against strategies — proxied transport, a step down in quality, a different extraction path, an older API shape, and audio only as the last resort.' },
      { step: 'READ', detail: 'The failure is read rather than blindly retried. Needs a key, skip that server. Rate limited, stop hammering it. Unsupported link, knob-twiddling will not help — move on.' },
      { step: 'DELIVER', detail: 'Streamed into a blob with a real filename and a live progress bar; a native download link if that is blocked; a new tab if that is blocked as well.' },
      { step: 'REFRESH', detail: 'Once a week a job pulls the community instance tracker, keeps the healthiest CORS-open servers and rewrites its own list. If the tracker is down it changes nothing. No human involved either way.' },
    ],
    tech: ['Vanilla JS', 'Service Worker', 'PWA share target', 'GitHub Actions', 'Cobalt API'],
    href: 'https://attaullahsher.github.io/Ashgrab/',
    hrefLabel: 'Open it',
  },
  {
    id: 'vpn',
    code: 'P-08',
    title: 'VPN',
    blurb: 'A tunnel for four people, on hardware nobody pays for.',
    status: 'INTERNAL',
    what: 'WireGuard on a free ARM instance, built entirely by scripts that can be run twice without consequence. Four people, a resolver that exists only inside the tunnel, and peers you can add or revoke without dropping anybody else.',
    why: 'A commercial VPN asks you to move your trust from a carrier to a company whose business model you cannot audit. Owning the exit does not make anyone invisible — it means the party in a position to keep the logs is you, and you can choose not to.',
    flow: [
      { step: 'HARDEN', detail: 'The stock image ends both its input and forward chains in a reject. Opening the cloud firewall is not enough; packets arrive and then die locally. Every rule is inserted above that reject, and proving it is part of the run.' },
      { step: 'TUNNEL', detail: 'WireGuard up, the interface sized well under the real path, and TCP negotiation clamped to what the path actually is — which removes the entire class of bug where a page loads halfway and then hangs.' },
      { step: 'RESOLVE', detail: 'A resolver on the tunnel address, reachable from nowhere else, forwarding upstream over encrypted DNS rather than handing every lookup to whoever runs the network.' },
      { step: 'ROUTE', detail: 'Peers route both address families into the tunnel even where the uplink only carries one. A phone on a modern carrier would otherwise send half its traffic around the VPN entirely.' },
      { step: 'PEER', detail: 'Devices are added and revoked with live calls, never by restarting the interface. Nobody loses a session because somebody else got a new phone.' },
      { step: 'VERIFY', detail: 'One script checks handshakes, firewall ordering, resolution, packet size and throughput, and reports usage against the free ceiling long before a bill would.' },
    ],
    tech: ['WireGuard', 'Bash', 'Ubuntu', 'iptables', 'Unbound', 'cloud-init', 'Oracle Cloud'],
    href: 'https://github.com/AttaullahSher/VPN',
    hrefLabel: 'Read the scripts',
    guarded:
      'Keys, addresses and peer configuration stay off this page. The scripts themselves will not print a private key unless you ask them to, twice.',
  },
  {
    id: 'range',
    code: 'P-09',
    title: 'RANGE',
    blurb: 'A company that does not exist, broken into on a schedule.',
    status: 'CONCEPT',
    what: 'A design for a disposable adversary range. Stand up a plausible small business — a web app, a mail server, a file share, three employees who click things — attack it on a timer, then throw the whole company away and keep only the detections that would have caught the attack.',
    why: 'Defensive tooling gets bought on the strength of a demo and is never tested again. A rule that has never fired against a real chain is a rumour. If you want to know whether you would notice, somebody has to be the one who tries, and it is cheaper if that somebody is you.',
    flow: [
      { step: 'BUILD', detail: 'The whole company comes up from a description, not a snapshot — different hostnames, different people, different mistakes every time, so nothing can quietly learn the shape of last week.' },
      { step: 'SEED', detail: 'It is populated until it looks lived in. Traffic at the hours people work, documents that reference each other, one password reused somewhere it should not have been.' },
      { step: 'RUN', detail: 'A chain executes end to end against the replica — foothold, look around, move sideways, reach something that matters — with every step timestamped against what the defences were doing at that moment.' },
      { step: 'MISS', detail: 'The interesting output is the gap: the steps nothing logged, the steps something logged and nobody would ever have read, and the alerts that fired for the wrong reason and would have been muted by Thursday.' },
      { step: 'KEEP', detail: 'The range is destroyed. Only the detection rules survive, and only the ones that fired on the run and stayed quiet on a week of ordinary traffic.' },
    ],
    tech: ['Containers', 'Infrastructure as code', 'Detection rules', 'Log pipeline', 'Ephemeral networks'],
    guarded:
      'Not built. This is a written design, on the page because the shape of it is the interesting part. It points at infrastructure that exists to be broken and is destroyed afterwards — there is nothing here aimed at anything real.',
  },
  {
    id: 'trace',
    code: 'P-10',
    title: 'TRACE',
    blurb: 'Everything encrypted, and still saying too much.',
    status: 'CONCEPT',
    what: 'A design for a passive observatory on a network you own. It never opens a payload — only sizes, timing and direction — and then tries to narrate the evening anyway: who woke up, which device, what kind of thing they were doing. Then it measures what it costs to make that stop.',
    why: 'The argument for encryption ends the conversation one step too early. The content is sealed and the behaviour is not, and the shape of a household’s traffic tells a fairly complete story to anybody sitting on the wire — including the people you are already paying.',
    flow: [
      { step: 'OBSERVE', detail: 'Packet sizes, gaps and direction, and nothing else. No payload is stored, because the point is what leaks when the payload is genuinely unreadable.' },
      { step: 'SHAPE', detail: 'Flows become fingerprints — the burst pattern of a video starting, the heartbeat of a doorbell, the very particular silence of a phone whose owner is asleep.' },
      { step: 'GUESS', detail: 'A small local model puts a name to each shape and, more usefully, a confidence. What it gets wrong is as informative as what it gets right.' },
      { step: 'SHOW', detail: 'The output is a timeline of a day in the house, reconstructed with nothing decrypted. It is meant to be uncomfortable to look at; that is the whole argument.' },
      { step: 'BLUNT', detail: 'Then padding and batching are turned on, the same day is watched again, and the honest number is reported: how much of the story disappears, and how much bandwidth and latency it cost to erase it.' },
    ],
    tech: ['Python', 'Packet capture', 'Time-series store', 'Local inference', 'Raspberry Pi'],
    guarded:
      'Not built, and scoped on purpose to a network the operator owns. The interesting output is what it proves about your own house — nobody else’s traffic is any of its business.',
  },
];
