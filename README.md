# ASHER

The personal site of Attaullah Sher (Asher): operations, procurement and the
business systems he builds through AI-assisted software development. Dark and
cinematic, but a portfolio first — a recruiter gets the work in the first
screen, and anyone who keeps scrolling finds out who he is.

**Live:** https://attaullahsher.github.io/askAsher/

---

## What it is

One dark page, no gate, professional first:

- **Hero.** Name, one line on what he does, two doors (the work, the console)
  and four checkable numbers. Visible the instant the page opens.
- **01 Work.** The six systems a real business runs on (POS, CRM, store, AI
  assistant, documents, inventory) and Hkula. Internal systems are described,
  never linked — a public page should not point at admin sign-ins.
- **02 Trade.** Procurement, tenders, sourcing, order-to-cash, and the
  institutions supplied. Engagements, never employers.
- **03 Record.** The career on one line, newest first.
- **04 Lab.** After hours, kept apart from the professional work: the
  experiments, the security creed, and **a live readout of the visitor's own
  device** — see below.
- **05 Person.** Roles, the modes, the off-the-record promises.
- **06 Contact.** The console, Instagram, email, GitHub.
- **Hidden things.** The backtick opens a terminal; there is an old cheat code.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Static export into `out/` |
| `npm run start` | Serve the built `out/` locally |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run assets` | Regenerate the favicons and the Open Graph card |

Node 20+ is required. Node 22 is what CI uses.

---

## Deploying

The site is a fully static export (`output: 'export'`), so it will sit on any
file host with no server behind it.

### GitHub Pages (what this repo is set up for)

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
One-time setup: **Settings → Pages → Build and deployment → Source → GitHub
Actions**.

`.github/workflows/ci.yml` runs lint, typecheck and a base-path build on every
pull request and every non-`main` branch, so a regression fails there rather
than in production.

The workflow sets `NEXT_PUBLIC_BASE_PATH` to `/<repo-name>` because project
pages are served from a subdirectory. Everything in the app resolves asset and
link URLs through `src/lib/paths.ts`, so there is nothing else to change.

### A custom domain, Vercel, Netlify, or any static host

Build with no base path and upload `out/`:

```bash
npm run build        # NEXT_PUBLIC_BASE_PATH unset → root deploy
```

On Vercel, the default settings work as-is.

---

## Editing the content

No component hard-codes a sentence. Everything a human would want to change
lives in `src/content/`:

| File | What is in it |
| --- | --- |
| `site.ts` | Name, summary used for search and link previews, the section list the nav reads, the hero, the closing copy, canonical URL |
| `work.ts` | **The professional half.** The six systems, Hkula, the trade (tenders, sourcing, engagements) and the career record |
| `lab.ts` | **The lab.** After-hours projects, written short, with status and links |
| `profile.ts` | The person — roles, the long version, the modes, off the record, contact links, and the relay endpoint |
| `answers.ts` | **The console corpus.** Every question the console can answer, and the copy around a miss |
| `security.ts` | The creed, the one rule, and the readout copy. Deliberately contains no method |
| `stack.ts`, `player.ts` | Read by the hidden terminal |

**Work.** Every figure in `work.ts` is one he has stated and can defend in an
interview. No invented metrics, no money, no headcount, and named
organisations are supply and project engagements, never employers.

**Links.** In `site.ts`, a link with an empty `href` simply does not render —
there are no dead placeholder URLs on the page. Add your Instagram or an email
by uncommenting and filling in the relevant line.

**Lab.** The rules are written at the top of `lab.ts`: no invented
metrics, no awards, no client logos, and nothing that exposes a business's
internals or a technique somebody could follow. Say what is true about the
capability; never publish the method. And no jargon — the reader has never
written a line of code and never wants to, so `made` carries one human line
about what it took instead of a list of technology names.

**No disclaimers.** `status` never comments on whether something shipped:
`LIVE` means you can open it, `PRIVATE` means it runs for real people who are
not you, `CLOSED` means it is not published. All three are true of every entry
carrying them and none of them is a confession. `guarded` survives on exactly
one entry, where a real client's internals are the reason — that reads as
discretion. Scope is stated once for the whole site in `securityScope`, not
re-apologised for at the bottom of every file. An entry states what is true and
then stops.

**And no claimed operation.** Nothing says a thing was pointed at a person,
because it was not, and because it is weaker than what is there. Authority
comes from knowing exactly how something works and declining to dress it up.

**Short.** Declaratives, full stops instead of commas, under fifteen words where
it will go. Every field here used to run sixty to a hundred words; nobody reads
that on a phone at midnight, and length itself reads as arguing a case.

**And the research entries are written about the reader, not the author.** "I
know what a room gives away" is a claim somebody has to take on trust; "your
phone is talking right now" is a fact they can check, and it does not require
the writer to have done anything to anybody. The subject is frightening on its
own — it has never needed help.

**Stack.** `stack.ts` is a claim about what you can be asked about in a room
with no internet. Prune anything that is not true rather than softening it.

---

## The console

`ASK ASHER` is the front door. It opens from the button under the hero, the
first control in the HUD, the third door at the end, and `ask` in the hidden
shell.

It is **not a model, and it must never pretend to be one.** `src/lib/ask.ts`
scores what the visitor typed against the `match` keys in
`src/content/answers.ts` and prints the winning `reply`. No request, no key, no
generation — the site already tells the visitor that nothing is running on
this page, and a console that implied otherwise would make a liar of that line
for the sake of a party trick.

**A miss is the point, not a failure.** Anything with no written answer offers
to carry the question to his phone through the same FormSubmit relay
(`relay.endpoint` in `profile.ts`). A question worth answering twice then
becomes a new entry in `answers.ts` on the next deploy, so the console gets
sharper every time somebody uses it and the site stops being a thing you
finish.

Longer phrases win decisively — the score is the square of the word count — so
list both the distinctive phrasing *and* the bare keyword on an entry. The one
list to keep deliberately over-broad is the refusal (`hack-for-me`): an
over-broad refusal costs a slightly odd reply, an under-broad one costs a great
deal more.

---

## The readout in the Lab

The Lab reads the visitor's own device in front of them and then
throws every value away. `src/lib/readout.ts` holds the rules, and they are not
negotiable:

1. **Read-only.** Nothing is transmitted and nothing is written — no
   `localStorage`, no cookie, no retained fingerprint. Every value lives inside
   one React render. The page says it kept nothing because it kept nothing; if
   that stops being true the whole section has to come out, because the claim
   *is* the section.
2. **No permission is ever requested.** No geolocation, camera, microphone or
   clipboard. Only values the browser hands to every site unprompted. A section
   about being read without your knowledge cannot open by asking permission.
3. **Nothing is ever faked.** Every field is feature-detected and an
   unavailable one is simply absent. A reader who catches one invented value
   correctly stops believing the other nine.

Values are read after mount, never during render — this is a static export, and
anything device-specific written on the first pass would disagree with the
prerendered HTML.

---

## Sound

Nothing autoplays. The visitor either chooses **Enter experience** (with sound)
or **Enter without sound**, and a control in the corner toggles it at any time.

Two paths, selected by `audio.track` in `src/content/site.ts`:

1. **`track: null`** — the default, and what the repo ships with. A cinematic
   drone is synthesised in the browser with the Web Audio API: sub, a
   slowly-filtered minor pad, wind, and a low pulse. Original by construction,
   zero bytes shipped, no licensing question to answer. It sounds intentional,
   not like a placeholder.
2. **`track: 'audio/ambient.mp3'`** — put a file at `public/audio/`, point this
   at it, and it is used instead. Use something you own or something licensed
   for the purpose. If it will not play, the drone takes over rather than the
   page going silently broken.

The choice is configured rather than sniffed at runtime: probing for a file that
is usually not there would put a 404 in every visitor's console.

---

## Performance and the choices behind it

The primary visitor arrives from Instagram's in-app browser, on a phone, over
mobile data. Everything below follows from that.

**Canvas 2D, not WebGL.** The atmosphere is layered 2D parallax — sky, stars,
three procedural silhouette ridges, drifting fog, an airdrop, a receding ground
grid, embers. It holds 60fps on hardware where a shader-based fog volume does
not, costs a few kilobytes instead of a 3D runtime, and needs no fallback path:
if the 2D context is unavailable, a CSS gradient carries the page and nothing
else changes.

**No animation library.** No GSAP, no Framer Motion. Reveals are two CSS classes
(`.reveal`, `.reveal-wipe`) plus a delay variable, driven by a small
`IntersectionObserver` hook. That is the entire motion system, and it is why the
JavaScript payload is what it is.

**Work is scoped to what is on screen.** The render loop pauses when the tab is
hidden. The pipeline and the security run only animate while their section is
visible. Canvas resolution and particle counts scale to a coarse device tier.
The build dossier and the hidden terminal are lazily loaded and only ever
fetched after a deliberate tap.

**The scene recedes.** After the opening, a scrim brings the drop zone down to a
trace. Without it, the skyline sits behind every heading and each section reads
as text pasted over a photograph.

**The grade is deliberate.** Warm lifted blacks, drifting dust, heavier grain
and a heavy vignette — faded stock rather than clean digital. The lift is kept
small: a neutral lift at any real strength just reads as haze and takes the
contrast with it.

---

## Accessibility

- `prefers-reduced-motion` is honoured, and there is a manual toggle in the
  corner that persists. In reduced mode the cinematic is skipped entirely, the
  pipeline and posture run show their finished state, and nothing is hidden —
  reveals simply resolve at once.
- Every interactive element is a real button or link, reachable by keyboard,
  with a visible focus ring. The build dossier and the terminal trap focus and
  close on `Escape`.
- With JavaScript disabled the page is still readable: a `<noscript>` style
  resolves the reveals.
- Text uses `16px` inputs so iOS does not zoom the page on focus, and honours
  `text-size-adjust` so Instagram's browser does not reflow it.

---

## Structure

```
src/
  app/           layout (fonts, metadata, OG), page, globals.css, robots, sitemap
  components/    Hero, Atmosphere, Readout (the device snapshot),
                 ConsoleShell — the frame Terminal and AskConsole share,
                 Terminal (hidden), AskConsole (the front door), EasterEggs, Toast
    site/        Nav, Work, Trade + Record, Lab, Person + Contact, and ui.tsx
                 (Band, Heading, Reveal, Tag, Status — the shared primitives)
  content/       all copy and data — see the table above
  lib/           scene (the canvas engine), audio, hooks, experience context,
                 ask (the matcher), readout (the device snapshot), paths
public/
  ask/           the previous site, kept live at /ask/ so a real build is reachable
  icons/         generated favicon set
  og.png         generated share card
  sw.js          kill-switch for the old service worker (see below)
scripts/
  generate-assets.mjs   builds the icons and the OG card from SVG
```

**Theme.** Every colour, font and easing is a token in the `@theme` block at the
top of `src/app/globals.css`. Each section sets `--accent` once on its `Band` (signal orange for the work, ice for
the trade, alert red for the lab, gold for the person), so a section can be
re-skinned in one line, and the canvas reads the same tokens.

---

## Two notes on what was already here

**`/ask/`.** The previous occupant of this repo — a browser-only assistant with
durable memory and voice — is preserved at `/ask/` and linked from the Lab, so
the site can point at something real and working rather than describing it.

**`public/sw.js`.** That older site registered a caching service worker at the
root of this URL, and browsers that still have it installed would keep serving
its cached shell. The file now at that path is a kill-switch: it drops those
caches, unregisters itself, and reloads the window. Safe to delete once the old
install base has aged out.

---

## Licence

MIT — see [LICENSE](LICENSE). The name, the copy and the visual identity are
personal; the code is yours to learn from.
