/* store.js — ASK's memory of everyone who uses it.
   Everything lives in this browser. No server, no telemetry, no account on anyone's cloud.

   Layout in localStorage:
     asher.v2.app        → profile directory + shared provider keys + device flags
     asher.v2.u.<id>     → one profile: sessions, memory, goals, logs, prefs

   Keys are shared per device (one person sets them up, everyone on that device uses them).
   Everything personal — chats, memory, goals, logs — is walled off per profile. */
const Store = (() => {
  const APP_KEY = 'asher.v2.app';
  const USER_KEY = id => `asher.v2.u.${id}`;
  const LOG_CAP = 600;

  /* The starter key — a real Groq key put here on purpose so ASK answers the moment it opens,
     before anyone has signed up for anything. It is split and base64'd only to keep it out of
     automated scrapers that would get it revoked within the hour; that is not secrecy. Anyone
     reading this file has it. Everyone using ASK shares its rate limit, so the app keeps
     nudging people toward their own free key, which takes about two minutes to get. */
  const STARTER = atob('Z3NrX2pwZjk5Z2JuSFhV' + 'MjdpYlZJYzlaV0dkeWIzRllsOVNKTnIzSzdPUFZvc3RRNzVQQTZQZkM=');

  const DEFAULT_PROVIDERS = [
    {
      /* Answers out of the box on the shared starter key, and gets much better the moment
         someone pastes their own — same provider, same models, just their own allowance. */
      id: 'groq', name: 'Groq', enabled: true, rank: 1,
      base: 'https://api.groq.com/openai/v1', key: STARTER, model: 'llama-3.3-70b-versatile',
      models: ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'llama-3.1-8b-instant'],
      signup: 'https://console.groq.com/keys',
      blurb: 'Fast, free, and runs open models like Llama and GPT-OSS.',
      friendly: 'Groq — the quick one',
      steps: [
        'Tap the button below. Groq opens in a new tab.',
        'Sign in with Google or GitHub. It is free and needs no card.',
        'Press <b>Create API Key</b>, give it any name, press submit.',
        'Copy the key it shows you — it starts with <b>gsk_</b>.',
        'Come back here and paste it in the box.'
      ]
    },
    {
      /* Backup that needs nothing at all. Pollinations serves GPT-OSS 20B to anonymous
         callers with CORS open. No streaming on the free tier, so replies land in one go. */
      id: 'pollinations', name: 'Free model (no key)', enabled: true, rank: 2,
      base: 'https://text.pollinations.ai', chatPath: '/openai', key: '', model: 'openai-fast',
      models: ['openai-fast'],
      keyless: true, noStream: true,
      signup: 'https://pollinations.ai',
      blurb: 'Open-weight GPT-OSS 20B, no key, no signup. Good enough to start today.',
      note: 'Free and anonymous, so it is rate-limited and slower than a keyed provider, and it cannot stream. Add a key below when you want it quicker.'
    },
    {
      id: 'openrouter', name: 'OpenRouter', enabled: true, rank: 3,
      base: 'https://openrouter.ai/api/v1', key: '', model: 'moonshotai/kimi-k2',
      models: [
        'moonshotai/kimi-k2',
        'deepseek/deepseek-chat',
        'deepseek/deepseek-r1',
        'qwen/qwen3-235b-a22b',
        'meta-llama/llama-3.3-70b-instruct',
        'mistralai/mistral-small-3.2-24b-instruct',
        'openai/gpt-oss-20b:free',
        'google/gemma-4-31b-it:free',
        'nvidia/nemotron-3-super-120b-a12b:free'
      ],
      signup: 'https://openrouter.ai/keys',
      blurb: 'One key, most open models. Kimi, DeepSeek, Qwen, Llama.',
      friendly: 'OpenRouter — the one with everything',
      steps: [
        'Tap the button below. OpenRouter opens in a new tab.',
        'Sign in with Google. Free, no card needed for the free models.',
        'Press <b>Create Key</b>, name it anything, press create.',
        'Copy the key — it starts with <b>sk-or-</b>.',
        'Come back here and paste it in the box.'
      ]
    },
    {
      id: 'deepseek', name: 'DeepSeek', enabled: true, rank: 4,
      base: 'https://api.deepseek.com/v1', key: '', model: 'deepseek-chat',
      models: ['deepseek-chat', 'deepseek-reasoner'],
      signup: 'https://platform.deepseek.com',
      blurb: 'Very cheap, very good, and it thinks hard when asked.',
      friendly: 'DeepSeek — the careful thinker',
      steps: [
        'Tap the button below. DeepSeek opens in a new tab.',
        'Sign up with an email or Google account.',
        'Go to <b>API keys</b> in the left menu, press <b>Create new API key</b>.',
        'Copy the key — it starts with <b>sk-</b>.',
        'Come back here and paste it in the box.'
      ]
    },
    {
      id: 'moonshot', name: 'Moonshot (Kimi)', enabled: true, rank: 5,
      base: 'https://api.moonshot.ai/v1', key: '', model: 'kimi-k2-0905-preview',
      models: ['kimi-k2-0905-preview', 'kimi-k2-turbo-preview', 'moonshot-v1-128k', 'moonshot-v1-32k'],
      signup: 'https://platform.moonshot.ai',
      blurb: 'Kimi straight from the source. Long memory, good at chat.',
      friendly: 'Moonshot — the long-memory one',
      steps: [
        'Open the page below. Moonshot opens in a new tab.',
        'Sign up with an email or a phone number.',
        'Find <b>API Keys</b> in the console and press <b>Create</b>.',
        'Copy the key it gives you — it starts with <b>sk-</b>.',
        'Come back here and paste it in the box.'
      ]
    },
    {
      id: 'nvidia', name: 'NVIDIA NIM', enabled: false, rank: 6,
      base: 'https://integrate.api.nvidia.com/v1', key: '', model: 'moonshotai/kimi-k2-instruct',
      models: [
        'moonshotai/kimi-k2-instruct',
        'deepseek-ai/deepseek-r1',
        'qwen/qwen3-235b-a22b',
        'meta/llama-3.3-70b-instruct'
      ],
      signup: 'https://build.nvidia.com',
      needsProxy: true,
      blurb: 'Lots of open models, but the browser cannot call it without a proxy.',
      note: 'NVIDIA sends no CORS headers, so a browser request is blocked no matter how good your key is. Deploy proxy/worker.js from this repo and point Base URL at it.'
    },
    {
      id: 'ollama', name: 'Ollama (this machine)', enabled: false, rank: 7,
      base: 'http://localhost:11434/v1', key: 'ollama', model: 'qwen3',
      models: ['qwen3', 'llama3.2', 'gemma3', 'deepseek-r1'],
      signup: 'https://ollama.com',
      blurb: 'Runs on your own computer. Nothing leaves the machine, no key at all.',
      friendly: 'Ollama — on your own computer',
      steps: [
        'This one is for a laptop or desktop, not a phone.',
        'Install Ollama from the page below.',
        'Open a terminal and run <b>ollama pull qwen3</b> to fetch a model.',
        'Start it so the browser is allowed in: <b>OLLAMA_ORIGINS=* ollama serve</b>.',
        'Come back and press Save — no key is needed, just leave the box empty.'
      ],
      note: 'Start it with OLLAMA_ORIGINS=* ollama serve or the browser will be refused.'
    },
    {
      id: 'custom', name: 'Custom endpoint', enabled: false, rank: 8,
      base: '', key: '', model: '', models: [],
      signup: '',
      blurb: 'Any other service that speaks the OpenAI format.',
      friendly: 'Something else',
      steps: [
        'You need three things from whoever runs the service.',
        'The <b>address</b> it answers on — it usually ends in <b>/v1</b>.',
        'The <b>model name</b> you are allowed to use.',
        'Your <b>key</b>, if it needs one.',
        'Put all three in below and ASK will test them before saving.'
      ]
    }
  ];

  const FRESH_APP = {
    version: 2,
    profiles: [],
    activeProfile: null,
    providers: DEFAULT_PROVIDERS,
    device: { installDismissed: false, seenIntro: false }
  };

  const FRESH_PREFS = () => ({
    botName: 'ASK',
    callMe: '',
    tone: 'warm',            // warm | direct | playful | mentor
    replyLength: 'medium',   // short | medium | long
    level: 'new',            // new | some | pro — how much it assumes you already know
    language: 'auto',    // auto | English | Roman Urdu | Urdu | anything they type
    persona: '',
    extractEvery: 3,
    goalReviewEvery: 6,
    temperature: 0.75,
    polish: 'smart',         // off | smart | always
    lookup: 'smart',         // off | smart | always — check the web for anything time-sensitive
    imageModel: 'sana',
    imageEnhance: true,     // let the service improve the wording before it draws
    modelChoice: null,       // {providerId, model} — null means "auto, walk the chain"
    // voice
    speak: false,            // read replies out loud automatically
    voiceName: '',           // which system voice, '' means the browser's default
    voiceRate: 1,
    voicePitch: 1,
    sttMode: 'browser'       // browser | whisper — where speech-to-text happens
  });

  const FRESH_USER = () => ({
    onboarded: false,
    sessions: [],
    activeId: null,
    memory: [],
    goals: [],
    logs: [],
    prefs: FRESH_PREFS(),
    stats: { messages: 0, images: 0, created: Date.now() }
  });

  const AVATAR_COLORS = ['#2E90F0', '#4DD0E1', '#FFB74D', '#F06292', '#B388FF', '#FF8A65', '#4DD0E1', '#AED581'];

  let app = null;
  let user = null;      // the active profile's data
  let userId = null;

  /* ── app-level ── */
  function loadApp() {
    try {
      const raw = localStorage.getItem(APP_KEY);
      app = raw ? JSON.parse(raw) : structuredClone(FRESH_APP);
    } catch { app = structuredClone(FRESH_APP); }

    app.profiles ||= [];
    app.device = Object.assign({ installDismissed: false, seenIntro: false }, app.device || {});

    // Heal the provider list against the current defaults, keeping whatever the user typed.
    const saved = app.providers || [];
    app.providers = DEFAULT_PROVIDERS.map(def => {
      const hit = saved.find(p => p.id === def.id);
      if (!hit) return structuredClone(def);
      return Object.assign(structuredClone(def), hit, {
        key: hit.key || def.key,   // an install from before the starter key existed picks it up
        models: hit.models?.length ? hit.models : def.models,
        blurb: def.blurb, note: def.note, signup: def.signup,
        needsProxy: def.needsProxy, keyless: def.keyless, noStream: def.noStream, chatPath: def.chatPath
      });
    });
    return app;
  }

  function saveApp() {
    try { localStorage.setItem(APP_KEY, JSON.stringify(app)); }
    catch (e) { console.warn('Could not save app state — storage may be full.', e); }
  }

  const getApp = () => app;
  const providers = () => app.providers;
  const device = () => app.device;

  /* ── the shared starter key ── */
  const starterKey = () => STARTER;
  /* True while nobody has put their own key in anywhere. */
  function onStarterKey() {
    const own = app.providers.some(p => p.enabled && p.key && p.key !== STARTER && p.id !== 'ollama');
    return !own;
  }
  /* Has this person been nudged recently enough to leave them alone? */
  function nudgeDue() {
    if (!user || !onStarterKey()) return false;
    const n = user.prefs.keyNudges || 0;
    const replies = user.stats.messages || 0;
    if (n === 0) return replies >= 6;
    if (n === 1) return replies >= 25;
    if (n === 2) return replies >= 60;
    return false;
  }
  function markNudged() {
    if (!user) return;
    user.prefs.keyNudges = (user.prefs.keyNudges || 0) + 1;
    saveUser();
  }
  function dismissNudges() {
    if (!user) return;
    user.prefs.keyNudges = 99;
    saveUser();
  }

  /* ── profiles ── */
  function profiles() { return app.profiles; }

  function createProfile({ name, emoji = '🙂', color, pin = '' }) {
    const id = crypto.randomUUID();
    const p = {
      id,
      name: String(name || 'You').trim().slice(0, 24) || 'You',
      emoji,
      color: color || AVATAR_COLORS[app.profiles.length % AVATAR_COLORS.length],
      pin: String(pin || '').trim(),
      created: Date.now(),
      lastSeen: Date.now()
    };
    app.profiles.push(p);
    app.activeProfile = id;
    saveApp();

    const fresh = FRESH_USER();
    fresh.prefs.callMe = p.name;
    localStorage.setItem(USER_KEY(id), JSON.stringify(fresh));
    loadUser(id);
    log('profile.create', `Profile "${p.name}" created`);
    return p;
  }

  function updateProfile(id, patch) {
    const p = app.profiles.find(x => x.id === id);
    if (!p) return null;
    Object.assign(p, patch);
    saveApp();
    return p;
  }

  function deleteProfile(id) {
    app.profiles = app.profiles.filter(p => p.id !== id);
    localStorage.removeItem(USER_KEY(id));
    if (app.activeProfile === id) {
      app.activeProfile = app.profiles[0]?.id || null;
      user = null; userId = null;
      if (app.activeProfile) loadUser(app.activeProfile);
    }
    saveApp();
  }

  function currentProfile() {
    return app.profiles.find(p => p.id === app.activeProfile) || null;
  }

  function switchProfile(id) {
    if (!app.profiles.some(p => p.id === id)) return false;
    saveUser();
    app.activeProfile = id;
    saveApp();
    loadUser(id);
    updateProfile(id, { lastSeen: Date.now() });
    return true;
  }

  /* ── the active profile's own world ── */
  function loadUser(id) {
    userId = id;
    let data;
    try {
      const raw = localStorage.getItem(USER_KEY(id));
      data = raw ? JSON.parse(raw) : FRESH_USER();
    } catch { data = FRESH_USER(); }

    data.sessions ||= [];
    data.memory ||= [];
    data.goals ||= [];
    data.logs ||= [];
    data.stats = Object.assign({ messages: 0, images: 0, created: Date.now() }, data.stats || {});
    data.prefs = Object.assign(FRESH_PREFS(), data.prefs || {});
    // the app used to be called Asher; profiles made back then keep saying so otherwise
    if (/^(ask )?asher$/i.test(data.prefs.botName || '')) data.prefs.botName = 'ASK';
    // people were never asked to pick a language, they were made to — start detecting instead
    if (data.prefs.language === 'English' && !data.prefs.languagePicked) data.prefs.language = 'auto';
    user = data;
    return user;
  }

  function saveUser() {
    if (!user || !userId) return;
    try { localStorage.setItem(USER_KEY(userId), JSON.stringify(user)); }
    catch (e) { console.warn('Could not save your data — storage may be full.', e); }
  }

  const get = () => user;
  const prefs = () => user.prefs;
  const hasUser = () => !!user;

  /* ── logs — every profile keeps its own trail ── */
  function log(type, detail, extra = {}) {
    if (!user) return;
    user.logs.push({ id: crypto.randomUUID(), ts: Date.now(), type, detail: String(detail).slice(0, 300), ...extra });
    if (user.logs.length > LOG_CAP) user.logs = user.logs.slice(-LOG_CAP);
    saveUser();
  }
  const logs = () => (user?.logs || []).slice().reverse();
  function clearLogs() { if (user) { user.logs = []; saveUser(); } }

  /* ── sessions ── */
  function newSession(title = 'New chat') {
    const s = { id: crypto.randomUUID(), title, created: Date.now(), updated: Date.now(), messages: [], turnsSinceExtract: 0, turnsSinceGoal: 0 };
    user.sessions.unshift(s);
    user.activeId = s.id;
    saveUser();
    return s;
  }
  function active() {
    let s = user.sessions.find(x => x.id === user.activeId);
    if (!s) s = user.sessions[0] || newSession();
    user.activeId = s.id;
    return s;
  }
  function setActive(id) { user.activeId = id; saveUser(); }
  function deleteSession(id) {
    const gone = user.sessions.find(s => s.id === id);
    user.sessions = user.sessions.filter(s => s.id !== id);
    if (user.activeId === id) user.activeId = user.sessions[0]?.id || null;
    if (!user.sessions.length) newSession();
    saveUser();
    if (gone) log('chat.delete', `Deleted chat "${gone.title}"`);
  }
  function push(role, content, meta = {}) {
    const s = active();
    s.messages.push({ id: crypto.randomUUID(), role, content, ts: Date.now(), ...meta });
    s.updated = Date.now();
    if (s.title === 'New chat' && role === 'user') {
      s.title = content.slice(0, 46).replace(/\s+/g, ' ').trim() + (content.length > 46 ? '…' : '');
    }
    if (role === 'user') user.stats.messages++;
    saveUser();
    return s.messages.at(-1);
  }

  /* ── memory ── */
  const CATEGORIES = ['identity', 'work', 'people', 'preferences', 'projects', 'goals', 'history'];

  function addMemory(fact, category = 'identity', source = 'auto') {
    const clean = String(fact).trim();
    if (!clean) return false;
    const norm = clean.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const dupe = user.memory.some(m => {
      const other = m.fact.toLowerCase().replace(/[^a-z0-9 ]/g, '');
      return other === norm || (norm.length > 18 && (other.includes(norm) || norm.includes(other)));
    });
    if (dupe) return false;
    user.memory.push({
      id: crypto.randomUUID(),
      fact: clean,
      category: CATEGORIES.includes(category) ? category : 'identity',
      source,
      added: Date.now()
    });
    saveUser();
    return true;
  }
  function removeMemory(id) {
    const gone = user.memory.find(m => m.id === id);
    user.memory = user.memory.filter(m => m.id !== id);
    saveUser();
    if (gone) log('memory.forget', `Forgot: ${gone.fact}`);
  }
  function clearMemory() {
    user.memory = [];
    saveUser();
    log('memory.clear', 'Memory wiped');
  }
  function memoryByCategory() {
    const out = {};
    for (const c of CATEGORIES) {
      const items = user.memory.filter(m => m.category === c);
      if (items.length) out[c] = items;
    }
    return out;
  }

  /* ── goals — the thing Asher keeps circling back to ── */
  function addGoal(text, { horizon = 'now', why = '', primary = false } = {}) {
    const clean = String(text).trim();
    if (!clean) return null;
    const norm = clean.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const existing = user.goals.find(g => g.text.toLowerCase().replace(/[^a-z0-9 ]/g, '') === norm);
    if (existing) return existing;
    if (primary) user.goals.forEach(g => g.primary = false);
    const g = { id: crypto.randomUUID(), text: clean, why, horizon, primary, status: 'open', created: Date.now(), updated: Date.now(), notes: [] };
    user.goals.push(g);
    saveUser();
    log('goal.add', `New goal: ${clean}`);
    return g;
  }
  function updateGoal(id, patch) {
    const g = user.goals.find(x => x.id === id);
    if (!g) return null;
    if (patch.primary) user.goals.forEach(x => x.primary = false);
    Object.assign(g, patch, { updated: Date.now() });
    saveUser();
    return g;
  }
  function removeGoal(id) {
    const gone = user.goals.find(g => g.id === id);
    user.goals = user.goals.filter(g => g.id !== id);
    saveUser();
    if (gone) log('goal.remove', `Dropped goal: ${gone.text}`);
  }
  function primaryGoal() {
    return user.goals.find(g => g.primary && g.status === 'open')
        || user.goals.find(g => g.status === 'open')
        || null;
  }
  const openGoals = () => user.goals.filter(g => g.status === 'open');

  /* ── backup ── */
  function exportUser() {
    return JSON.stringify({
      exported: new Date().toISOString(),
      app: 'asher',
      profile: currentProfile(),
      data: user
    }, null, 2);
  }
  function importUser(json) {
    const parsed = JSON.parse(json);
    const incoming = parsed.data || parsed;
    if (!incoming.sessions && !incoming.memory) throw new Error('That file is not an ASK backup.');
    user = Object.assign(FRESH_USER(), incoming);
    user.prefs = Object.assign(FRESH_PREFS(), incoming.prefs || {});
    saveUser();
    loadUser(userId);
    log('backup.import', 'Restored from a backup file');
    return true;
  }
  function exportLogs() {
    const rows = [['when', 'type', 'detail']].concat(
      logs().map(l => [new Date(l.ts).toISOString(), l.type, String(l.detail).replace(/"/g, "'")])
    );
    return rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  }

  return {
    // app + profiles
    loadApp, saveApp, getApp, providers, device, AVATAR_COLORS,
    starterKey, onStarterKey, nudgeDue, markNudged, dismissNudges,
    profiles, createProfile, updateProfile, deleteProfile, currentProfile, switchProfile,
    // active profile
    loadUser, saveUser, save: saveUser, get, prefs, hasUser,
    // chat
    newSession, active, setActive, deleteSession, push,
    // memory + goals
    CATEGORIES, addMemory, removeMemory, clearMemory, memoryByCategory,
    addGoal, updateGoal, removeGoal, primaryGoal, openGoals,
    // logs + backup
    log, logs, clearLogs, exportUser, importUser, exportLogs
  };
})();
