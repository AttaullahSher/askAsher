/* providers.js — one code path for every model.
   Everything listed speaks the OpenAI /v1/chat/completions shape, so picking a model is
   really just picking a base URL + a key + a model name. If the chosen one falls over,
   Ask Asher walks down the rest of the chain instead of showing an error. */
const Providers = (() => {

  const usable = p => p.enabled && p.base && p.model && (p.key || p.keyless || p.id === 'ollama');
  const endpoint = (p, path) => `${p.base.replace(/\/$/, '')}${path}`;
  const chatUrl = p => endpoint(p, p.chatPath || '/chat/completions');

  /* Every provider that could answer, best first. */
  function ready() {
    return Store.providers().filter(usable).sort((a, b) => a.rank - b.rank);
  }

  /* The chain, honouring the profile's pinned choice: their pick first, then the rest. */
  function chain() {
    const all = ready();
    const choice = Store.hasUser() ? Store.prefs().modelChoice : null;
    if (!choice?.providerId) return all;
    const pinned = all.find(p => p.id === choice.providerId);
    if (!pinned) return all;
    const head = Object.assign({}, pinned, { model: choice.model || pinned.model, pinned: true });
    return [head, ...all.filter(p => p.id !== pinned.id)];
  }

  /* What the user has pinned, or the head of the chain. */
  function activeLabel() {
    const c = chain();
    if (!c.length) return null;
    return { name: c[0].name, model: c[0].model, pinned: !!c[0].pinned };
  }

  /* Every provider × model pair the user could pick from, for the model sheet. */
  function options() {
    const out = [];
    for (const p of ready()) {
      const models = [...new Set([p.model, ...(p.models || [])])].filter(Boolean);
      for (const m of models) out.push({ providerId: p.id, providerName: p.name, model: m });
    }
    return out;
  }

  const headers = p => {
    const h = { 'Content-Type': 'application/json' };
    if (p.key) h['Authorization'] = `Bearer ${p.key}`;
    if (p.id === 'openrouter') {
      h['HTTP-Referer'] = location.origin;
      h['X-Title'] = 'Ask Asher';
    }
    return h;
  };

  async function readError(res) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.error?.message || j?.message || JSON.stringify(j).slice(0, 200);
    } catch { detail = await res.text().catch(() => '').then(t => t.slice(0, 200)); }
    return `${res.status} — ${detail || res.statusText}`;
  }

  /* fetch() reports a CORS block as a bare TypeError. Say what actually happened. */
  function explain(e, p) {
    if (e instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(e.message || '')) {
      if (p.needsProxy) return 'the browser blocked it — this provider sends no CORS headers, so it needs a proxy in front of it (see proxy/worker.js)';
      if (p.id === 'ollama') return 'could not reach Ollama — start it with OLLAMA_ORIGINS=* ollama serve';
      return 'network or CORS failure — the provider refused the browser, or you are offline';
    }
    return e.message;
  }

  /* Ask one provider. Streams tokens through onToken when given one — unless the provider
     cannot stream (the free tier can't), in which case the whole reply arrives at once and
     onToken is called a single time so the UI still updates the same way. */
  async function callOne(p, messages, opts = {}) {
    const wantsStream = !!opts.onToken && !p.noStream;
    const body = {
      model: p.model,
      messages,
      temperature: opts.temperature ?? Store.prefs().temperature ?? 0.75,
      stream: wantsStream
    };
    if (opts.maxTokens) body.max_tokens = opts.maxTokens;
    if (opts.json) body.response_format = { type: 'json_object' };

    const res = await fetch(chatUrl(p), {
      method: 'POST',
      headers: headers(p),
      body: JSON.stringify(body),
      signal: opts.signal
    });

    if (!res.ok) throw new Error(await readError(res));

    if (!wantsStream) {
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || String(data.error));
      const text = data.choices?.[0]?.message?.content ?? '';
      if (opts.onToken && text) opts.onToken(text, text);
      return text;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '', buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith('data:')) continue;
        const payload = t.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const chunk = JSON.parse(payload);
          const piece = chunk.choices?.[0]?.delta?.content;
          if (piece) { full += piece; opts.onToken(piece, full); }
        } catch { /* half a frame — the next read finishes it */ }
      }
    }
    return full;
  }

  /* Walk the chain until something answers. */
  async function chat(messages, opts = {}) {
    const list = chain();
    if (!list.length) {
      const err = new Error('NO_PROVIDER');
      err.friendly = 'Every model is switched off. Open **Models & keys** and turn the free one back on, or paste a key.';
      throw err;
    }

    const tried = [];
    for (const p of list) {
      const started = Date.now();
      try {
        const text = await callOne(p, messages, opts);
        if (!text || !text.trim()) throw new Error('the provider returned an empty reply');
        return { text, provider: p, ms: Date.now() - started, tried };
      } catch (e) {
        if (e.name === 'AbortError') throw e;
        const why = explain(e, p);
        tried.push({ name: p.name, model: p.model, error: why });
        if (opts.onFallback) opts.onFallback(p, why);
        if (opts.quiet !== true) Store.log('model.fallback', `${p.name} (${p.model}) failed: ${why}`);
        console.warn(`[${p.name}] failed, moving down the chain:`, e.message);
      }
    }

    const err = new Error('ALL_FAILED');
    err.friendly = 'Every model in the chain refused. Here is what each said:\n\n' +
      tried.map(t => `- **${t.name}** (${t.model}): ${t.error}`).join('\n') +
      '\n\nUsually that is a bad or unfunded key, a model name that has been retired (hit **Load** in settings to refresh the list), or a provider that blocks browsers.';
    err.tried = tried;
    throw err;
  }

  /* Ask the provider what it can actually run, so retired model IDs fix themselves. */
  async function listModels(p) {
    let res;
    try { res = await fetch(endpoint(p, '/models'), { headers: headers(p) }); }
    catch (e) { throw new Error(explain(e, p)); }
    if (!res.ok) throw new Error(await readError(res));
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.data || data.models || []);
    const ids = rows.map(m => (typeof m === 'string' ? m : m.id || m.name)).filter(Boolean).sort();
    if (!ids.length) throw new Error('the provider returned no models');
    return ids;
  }

  /* Speech to text through an OpenAI-compatible /audio/transcriptions endpoint.
     Groq runs Whisper large v3 turbo and is the one most people here will have a key for. */
  function sttProvider() {
    return Store.providers()
      .filter(p => p.enabled && p.key && (p.id === 'groq' || p.id === 'custom'))
      .sort((a, b) => a.rank - b.rank)[0] || null;
  }

  async function transcribe(blob, { signal } = {}) {
    const p = sttProvider();
    if (!p) {
      const e = new Error('NO_STT');
      e.friendly = 'Whisper needs a Groq key (or a custom endpoint that does transcription). Switch voice input back to the browser in settings, or add one.';
      throw e;
    }
    const form = new FormData();
    form.append('file', blob, 'speech.webm');
    form.append('model', p.sttModel || 'whisper-large-v3-turbo');
    form.append('response_format', 'json');

    let res;
    try {
      res = await fetch(endpoint(p, '/audio/transcriptions'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${p.key}` },
        body: form,
        signal
      });
    } catch (e) { throw new Error(explain(e, p)); }
    if (!res.ok) throw new Error(await readError(res));
    const data = await res.json();
    return { text: (data.text || '').trim(), provider: p };
  }

  async function test(p) {
    try {
      const text = await callOne(p, [{ role: 'user', content: 'Reply with the single word: ready' }], { maxTokens: 12 });
      return text.trim().slice(0, 40);
    } catch (e) { throw new Error(explain(e, p)); }
  }

  return { chat, callOne, listModels, test, ready, chain, options, activeLabel, transcribe, sttProvider };
})();


/* Polish — rewrite a rough message into something a model can act on, before it gets sent.
   The original is always what you see in the chat; the polished version is what goes out,
   and you can tap the chip to read exactly what was sent. Nothing is silently rewritten. */
const Polish = (() => {

  const SYSTEM = `You rewrite a person's rough message into a clear request for an AI assistant.

Rules:
- Keep their intent, facts, names, numbers and language exactly. Never answer the question.
- Fix typos and broken grammar. Unpack shorthand. Make the ask explicit.
- If they clearly want something produced (text, code, a plan, an image), say what form the answer should take.
- Stay roughly the same length. Never pad, never add requirements they did not imply.
- If the message is already clear, or it is small talk, return it unchanged.
- Output the rewritten message only. No preamble, no quotes, no explanation.`;

  /* Worth polishing? Cheap heuristics — no model call needed to decide. */
  function looksRough(text) {
    const t = text.trim();
    if (t.length < 12) return false;                 // "hi", "thanks" — leave alone
    if (t.length > 1200) return false;               // long and considered already
    if (/^!?\[.*\]\(.*\)$/.test(t)) return false;    // a pasted image
    const words = t.split(/\s+/);
    const noPunct = !/[.?!]/.test(t) && words.length > 8;
    const noCaps = t === t.toLowerCase() && words.length > 6;
    const veryShortAsk = words.length <= 5 && /\?|make|write|fix|build|plan|image|draw|help/i.test(t);
    const runOn = words.length > 45 && (t.match(/[.?!]/g) || []).length < 2;
    const smsy = /\b(pls|plz|u|ur|wud|wd|thnx|bcz|becoz|kese|kaise|abhi|dnt|cant|wont)\b/i.test(t);
    return noPunct || noCaps || veryShortAsk || runOn || smsy;
  }

  function shouldPolish(text) {
    const mode = Store.prefs().polish || 'smart';
    if (mode === 'off') return false;
    if (mode === 'always') return text.trim().length >= 12;
    return looksRough(text);
  }

  /* Returns the text to actually send. Falls back to the original on any failure —
     a polish step must never be the reason a message does not go out. */
  async function run(text, { signal } = {}) {
    if (!shouldPolish(text)) return { sent: text, polished: false };
    try {
      const { text: out } = await Providers.chat([
        { role: 'system', content: SYSTEM },
        { role: 'user', content: text }
      ], { temperature: 0.2, maxTokens: 500, signal, quiet: true });

      const clean = (out || '').trim().replace(/^["']|["']$/g, '');
      if (!clean || clean.length > text.length * 4 + 200) return { sent: text, polished: false };
      if (clean.toLowerCase() === text.trim().toLowerCase()) return { sent: text, polished: false };
      return { sent: clean, polished: true };
    } catch {
      return { sent: text, polished: false };
    }
  }

  /* Same idea, tuned for image prompts. */
  async function image(seed) {
    const { text } = await Providers.chat([
      { role: 'system', content: 'Rewrite the idea as one vivid image-generation prompt. Name the subject, the lighting, the medium or camera, the mood and the palette. Under 60 words. Output the prompt only — no preamble, no quotes.' },
      { role: 'user', content: seed }
    ], { temperature: 0.8, maxTokens: 160 });
    return text.trim().replace(/^["']|["']$/g, '');
  }

  return { run, image, shouldPolish, looksRough };
})();
