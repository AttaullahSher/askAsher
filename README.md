# ASK

A personal assistant, teacher and guide that belongs to whoever opens it. It asks about you,
keeps a durable memory of what matters, tracks what you are actually working toward, explains
things one step at a time, talks and listens out loud, makes images, and runs on open models —
with an automatic fallback chain when one of them refuses.

**It works the moment you open it.** No key, no signup, no account — it ships with a shared starter
key and a keyless backup model. Getting your own free key takes about two minutes and ASK walks you
through it in five steps.

No backend, no build step, no npm install. Plain HTML, CSS and JavaScript. Open `index.html`
and it runs. Everything — chats, memory, goals, logs, keys — lives in the browser's local
storage on the device. Nothing is sent anywhere except directly to the model provider you pick.

**Live:** https://attaullahsher.github.io/askAsher/

---

## What it does

**Sets itself up the first time you open it.** Offers to install as an app, makes you a profile,
asks three questions about who you are and what you are working toward, asks how you want to be
spoken to, then opens a chat that already knows the answers.

**One profile per person.** Three to five people can share a device and each gets their own chats,
their own memory, their own goals and their own activity log. Nothing crosses between them.
A profile can carry an optional PIN — a latch to stop accidental snooping, not real security
(see [Where your data lives](#where-your-data-lives)).

**Remembers you.** Every few replies it re-reads the conversation and pins anything durable —
"Runs a music shop in Abu Dhabi", "Prefers short replies", "Writes in English and Urdu" —
sorted into seven categories with a coverage meter showing how filled-in the picture is.
Everything is visible in the right-hand rail and deletable with one tap.

**Keeps your goal in view.** Separately from the facts, it tracks what you are trying to achieve,
picks a primary goal, and works out one line on how to be more useful to you next. That goes into
every system prompt, so answers keep getting pointed back at the thing that matters — without the
bot announcing that it is doing so. Goals you finish drop off on their own.

**Tidies your messages before sending them.** Set to *only when they're rough* by default: a short,
typo-heavy or vague message gets rewritten into a clear request before it goes to the model. The
chat still shows exactly what you typed, with a small **tidied before sending** chip that reveals
what was actually sent. Set it to never or always in settings.

**Teaches, rather than just answering.** The default setting assumes you are new to whatever
you are asking about: the answer first in one plain sentence, then numbered steps with one action
each, what you should see after each one, and every technical word explained where it appears.
Every reply carries an **Explain simpler** button that redoes it from scratch for a beginner, and
**Teach me something** walks you through any topic from nothing. Set the level to comfortable or
expert in settings and it drops the scaffolding.

**Talks and listens.** Tap the microphone and speak instead of typing. Tap **Read aloud** under any
reply to hear it. Turn on **Voice chat** and it goes hands-free: it listens, answers out loud, then
listens again until you stop it. All of that is the browser's own speech engine — no key, nothing
uploaded, works offline once the page is cached. If you have a Groq key you can switch listening to
Whisper instead, which copes better with accents and mixed languages.

**Knows it can be out of date.** Today's date goes into every prompt, and anything that sounds
time-sensitive — latest, current, price, release, news, this year — gets checked against Wikipedia,
Hacker News and DuckDuckGo before it answers, with the sources listed under the reply. Those three
allow direct browser calls and need no key. It is not a full search engine; it is enough to stop
confident nonsense about things that changed after the model was trained.

**Makes images.** No key needed — the open-weights SANA model through Pollinations, in five
aspect ratios, with an optional seed for repeating a picture. Banner mode composites artwork,
a scrim, a headline and a sub-line onto a canvas and hands you a PNG. There is also a
*sharpen the prompt* button that rewrites a rough idea into a proper image prompt.

**Falls back.** Pick any model from the pill under the composer. If it errors — bad key, rate
limit, retired model ID, provider down — it walks down the rest of the chain instead of
showing you a failure, and tells you underneath the reply which one actually answered.

---

## Models

Everything below speaks the OpenAI `/v1/chat/completions` shape, which is why one code path
covers all of it. The first one needs no key at all; everything after it is optional.

| # | Provider | Base URL | Default model | Key from |
|---|---|---|---|---|
| 1 | **Free model** | `https://text.pollinations.ai` | `openai-fast` (GPT-OSS 20B) | **none needed** |
| 2 | OpenRouter | `https://openrouter.ai/api/v1` | `moonshotai/kimi-k2` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| 3 | Moonshot (Kimi) | `https://api.moonshot.ai/v1` | `kimi-k2-0905-preview` | [platform.moonshot.ai](https://platform.moonshot.ai) |
| 4 | DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` | [platform.deepseek.com](https://platform.deepseek.com) |
| 5 | Groq | `https://api.groq.com/openai/v1` | `openai/gpt-oss-120b` | [console.groq.com/keys](https://console.groq.com/keys) |
| 6 | NVIDIA NIM | `https://integrate.api.nvidia.com/v1` | `moonshotai/kimi-k2-instruct` | [build.nvidia.com](https://build.nvidia.com) — **needs a proxy** |
| 7 | Ollama (local) | `http://localhost:11434/v1` | your choice | no key |
| 8 | Custom | anything you like | anything you like | — |

The free one is [Pollinations](https://pollinations.ai) serving GPT-OSS 20B to anonymous callers.
It is rate-limited, slower, and cannot stream — replies land in one piece rather than word by word —
but it means the app is useful before anyone has signed up for anything.

**Want it faster?** Groq's free tier is the quickest, or OpenRouter — one key and you have Kimi,
DeepSeek, Qwen, Llama and the rest behind it. A Groq key also unlocks Whisper for voice input.

Model IDs get retired regularly. Every provider card has a **Load** button that asks the provider
what your key can actually run and repopulates the list, so a stale default fixes itself.
**Test this connection** reports either the reply or the exact error.

### The NVIDIA caveat

NVIDIA NIM sends no `Access-Control-Allow-Origin` header, so a browser request is blocked no matter
how valid your key is. `proxy/worker.js` in this repo is a Cloudflare Worker that forwards to
`https://integrate.api.nvidia.com`, adds the CORS headers, and streams the response body straight
through so token-by-token replies still work:

```bash
npm i -g wrangler
wrangler deploy proxy/worker.js --name asher-nim-proxy --compatibility-date 2024-11-01
```

Then set NVIDIA's Base URL to `https://asher-nim-proxy.<your-subdomain>.workers.dev/v1`.

Groq, OpenRouter, Moonshot and DeepSeek all send CORS headers correctly and need no proxy.
Ollama needs starting with `OLLAMA_ORIGINS=* ollama serve` or the browser gets refused.

### Images

Images come from [Pollinations](https://pollinations.ai) over a plain GET, so they work before
you have added any key at all.

Anonymous callers get exactly one model there: **SANA**, NVIDIA's open-weights image model. The
old `flux` and `turbo` names still answer but hand back the same picture, and `kontext` and
`nanobanana` now fail outright — they moved behind an account. So ASK offers one honest option
instead of a menu of four, plus a wording enhancer that measurably improves the result, and it
retries with a fresh seed when the free service drops a request.

---

## Installing it

**Android / Chrome / Edge:** the setup flow offers an install button, and there is one in the left
rail afterwards. Nothing downloads from a store — the browser keeps a copy and gives it an icon.

**iPhone / iPad:** Safari never fires the install event, so there is no button. Tap **Share** →
**Add to Home Screen** → **Add**. It has to be Safari; Chrome on iOS cannot install web apps.
ASK detects iOS and shows those steps instead of a dead button.

Once installed it opens full screen, works offline (the shell is cached; models obviously still
need a connection), and keeps the same storage as the tab you set it up in.

---

## Where your data lives

In `localStorage` on the device, and nowhere else:

- `asher.v2.app` — the profile directory, provider settings and API keys
- `asher.v2.u.<profile-id>` — one entry per person: chats, memory, goals, activity log, preferences

There is no server in this project. Nothing is uploaded, nothing is analysed, no account exists.
The only outbound traffic is HTTPS straight from your browser to the model provider you chose,
and to Pollinations when you generate an image or use the free model — plus Wikipedia, Hacker News
and DuckDuckGo when a question needs checking. Speech in and out never leaves the device at all,
unless you switch listening to Whisper, in which case the audio clip goes to Groq.

Two things to be honest about:

- **API keys in browser storage are readable by anything running script on the page.** Use a
  spend-capped key. This is fine for a personal app on your own device; it is not fine for a key
  with a large balance behind it.
- **The profile PIN is a latch, not a lock.** It stops a housemate opening your chats by accident.
  It does not encrypt anything, and anyone who can open the browser's developer tools can read
  around it. Profiles are for separation, not security.

Export your data any time from **Models & keys → Your data** (JSON, restorable on another device)
and your activity log as CSV.

---

## Layout

```
index.html
manifest.webmanifest
sw.js                     app-shell cache; never caches model or image traffic
assets/css/app.css
assets/js/store.js        profiles, chats, memory, goals, logs — all localStorage
assets/js/providers.js    OpenAI-compatible calls, SSE streaming, fallback chain, prompt polish
assets/js/memory.js       fact extraction, goal review, system-prompt assembly, coverage meter
assets/js/lookup.js       keyless web check — Wikipedia, Hacker News, DuckDuckGo
assets/js/keys.js         the step-by-step walkthrough to a free key
assets/js/help.js         how-do-I sheet, with device-specific install steps
assets/js/voice.js        speech in and out, plus hands-free voice chat
assets/js/images.js       image generation with model fallback + canvas banner compositor
assets/js/onboarding.js   first-run flow and the profile picker
assets/js/app.js          UI wiring
assets/brand/logo.png     the logo everything else is built from
assets/icons/             192, 512, maskable-512, apple-touch-180, favicon-32, og
tools/make-icons.js       rebuilds every icon from the logo — node tools/make-icons.js
proxy/worker.js           Cloudflare Worker CORS proxy for NVIDIA NIM
```

## Running it locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

A plain `file://` open works too, except the service worker — browsers only register one over
HTTP(S).

## Voice, honestly

Reading aloud uses `speechSynthesis`, which every current browser has. Listening uses
`SpeechRecognition`, which Chrome, Edge and Safari have and Firefox does not — on Firefox the
microphone button explains that and the Whisper option still works if you have a Groq key.
On iPhone it has to be Safari, and iOS will not speak until you have tapped something first,
which is why the first tap on **Read aloud** is what unlocks it.

## Rebranding it

Every icon is generated from `assets/brand/logo.png` by `tools/make-icons.js` — pure Node, no
image library, no design tool. Drop in a different logo and re-run it:

```bash
node tools/make-icons.js
```

It finds the mark inside the artwork, keys out the paper so no crop edge shows, and writes all six
sizes. It also prints the strongest colour it found, which is what `--accent` in
`assets/css/app.css` is tuned to — change that one variable and the whole interface follows.

## Adding a model

**Get a free key — 2 min** in the sidebar opens a walkthrough covering Groq, OpenRouter, DeepSeek,
Moonshot, Ollama on your own computer, and *Something else* for any other OpenAI-compatible
service. Each one is five numbered steps — tap the link, sign in, press Create Key, copy, paste —
and ASK tests the key before it saves it. A key that works goes to the front of the chain.

Links open through a freshly-built anchor rather than `window.open`. `window.open` with
`noopener` returns null even when it worked *and* spends the tap's user activation, so the
"did that work?" fallback after it is already too late to fire — which is why the buttons used to
do nothing. The address is also printed on screen with a copy button, for the in-app browsers that
refuse to open anything at all.

Everything on offer is open-weights: Llama 3.3, GPT-OSS, Qwen 3, DeepSeek V3 and R1, Kimi K2,
Gemma 4, Nemotron, Mistral Small. The picker says what each one is good at rather than showing
its ID.

## How do I…

A help sheet in the sidebar answers the six things people actually get stuck on, in steps: putting
ASK on the home screen, getting a free key, talking to it, making a picture, letting someone else
use the phone, and deleting what it remembers.

The install steps are worked out from the device — Android gets the Chrome menu route, iPhone gets
the Safari share-sheet route, a desktop gets the address-bar icon. And if ASK was opened inside
Facebook, Instagram or WhatsApp it says so first, because those in-app browsers cannot install
anything at all.

## The shared starter key

ASK ships with a real Groq key so that opening it for the first time just works. It is in
`assets/js/store.js`, base64'd and split — which keeps automated scrapers from getting it revoked
within the hour, and is **not** secrecy. Assume it is public, because it is.

What that means in practice:

- Everyone who opens ASK shares its rate limit, so it slows down and sometimes refuses.
- It may be revoked or replaced at any time.
- The app knows this: a soft reminder appears after a few messages, the sidebar carries a
  **Get a free key — 2 min** button, and any failure turns into the same five-step walkthrough
  instead of an error message.

Your own key goes to the top of the chain the moment it tests green, and the reminders stop.
To swap the shipped one, replace the two base64 halves in `store.js`.

## Credit

ASK — programmed by **Attaullah Sher**.

## Licence

MIT. See `LICENSE`.
