# ASHER

An interactive personal microsite for Asher — business transformation,
automation and AI, written so somebody who has never read a line of code
understands every sentence. A character introduction, not a portfolio: built to
be opened from a phone, from an Instagram bio link, and to make the visitor
curious rather than informed.

**Live:** https://attaullahsher.github.io/askAsher/

---

## What it is

A single dark, cinematic page:

- **Entry gate.** Nothing animates and nothing makes a sound until the visitor
  chooses to enter. The scene is already alive behind the gate, so it reads as a
  held frame rather than a loading screen.
- **Opening.** A slow camera push into a night drop zone, three lines of type,
  then the standing title. Skippable from the first beat.
- **Five sectors, all passive.** `01 CODE` (a field map that scans itself) ·
  `02 AUTOMATION` (a request handed from app to app) · `03 AI` (a core that
  boots as you reach it) · `04 SECURITY` (four lines and no method) ·
  `05 PLAYER` (a loadout, no invented stats). Nothing in the descent asks to
  be tapped — it plays while you scroll.
- **Two doors at the end.** `WHO I AM` opens the personal file; `THE WORK`
  opens the project index. All interaction on the page lives here, on purpose.
- **Hidden things.** Four of them. The console will point you at the first.

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
| `site.ts` | Name, tagline, the on-page line, the plain-language summary used for search and link previews, the hero (eyebrow, lead, sub), canonical URL, outbound links, the five sector titles |
| `profile.ts` | The personal file behind the first door — roles, the long version, the closing line |
| `projects.ts` | The work behind the second door, written in the first person — what it is, why it exists, what it does, what it is built with |
| `stack.ts` | Technologies in sector 01, their positions in the field map and the edges between them |
| `automation.ts` | The relay: which apps the request is handed through, and what each one passes on |
| `ai.ts` | The AI modules and the core boot log |
| `security.ts` | The four lines, the principles list, the one rule, and the closing note. Deliberately contains no method |
| `player.ts` | The loadout slots, the games, and the tag on the scoreboard |

**Links.** In `site.ts`, a link with an empty `href` simply does not render —
there are no dead placeholder URLs on the page. Add your Instagram or an email
by uncommenting and filling in the relevant line.

**Projects.** The rule is written at the top of `projects.ts`: no invented
metrics, no awards, no client logos, and nothing that exposes a business's
internals or a technique somebody could follow. Say what is true about the
capability; never publish the method. Where a system is deliberately held at arm's length, say so
on the page — the `guarded` field renders that note. Anything that has not
actually been built carries `status: 'CONCEPT'` and says so in `guarded`; a
design is worth reading, but it never wears a shipped system's clothes.

**Stack.** `stack.ts` is a claim about what you can be asked about in a room
with no internet. Prune anything that is not true rather than softening it.

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
trace. Without it, the skyline sits behind every heading and each sector reads
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
  resolves the reveals and removes the gate.
- Text uses `16px` inputs so iOS does not zoom the page on focus, and honours
  `text-size-adjust` so Instagram's browser does not reflow it.

---

## Structure

```
src/
  app/           layout (fonts, metadata, OG), page, globals.css, robots, sitemap
  components/    Gate, Hero, Manifest, Section shell, Hud, Terminal,
                 BuildDialog, EasterEggs, Toast, Atmosphere
    sectors/     one component per sector
  content/       all copy and data — see the table above
  lib/           scene (the canvas engine), audio, hooks, experience context, paths
public/
  ask/           the previous site, kept live at /ask/ so a real build is reachable
  icons/         generated favicon set
  og.png         generated share card
  sw.js          kill-switch for the old service worker (see below)
scripts/
  generate-assets.mjs   builds the icons and the OG card from SVG
```

**Theme.** Every colour, font and easing is a token in the `@theme` block at the
top of `src/app/globals.css`. Sector accents are one level of indirection on top
of that (`--accent-code`, `--accent-security`, …), so a sector can be re-skinned
in one line, and the canvas reads the same values.

---

## Two notes on what was already here

**`/ask/`.** The previous occupant of this repo — a browser-only assistant with
durable memory and voice — is preserved at `/ask/` and linked from sector 05, so
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
