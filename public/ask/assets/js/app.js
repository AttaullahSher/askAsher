/* app.js — the wiring. */
(() => {
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

let busy = false;
let controller = null;
let studioMode = 'image';
let logFilter = 'all';
let lastAsked = '';      // kept so "Try again" after a failure can resend it

/* ── markdown (escaped first) ── */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function md(src) {
  const blocks = [];
  let t = esc(src).replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    blocks.push(`<pre><code>${code.replace(/\n$/, '')}</code></pre>`);
    return `\u0000${blocks.length - 1}\u0000`;
  });

  t = t.replace(/`([^`\n]+)`/g, '<code>$1</code>')
       .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
       .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
       .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
       .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
       .replace(/^### (.+)$/gm, '<h3>$1</h3>')
       .replace(/^## (.+)$/gm, '<h2>$1</h2>')
       .replace(/^# (.+)$/gm, '<h1>$1</h1>')
       .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  const lines = t.split('\n');
  let out = '', list = null;
  for (const line of lines) {
    const ul = line.match(/^\s*[-•]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      const want = ul ? 'ul' : 'ol';
      if (list !== want) { if (list) out += `</${list}>`; out += `<${want}>`; list = want; }
      out += `<li>${(ul || ol)[1]}</li>`;
    } else {
      if (list) { out += `</${list}>`; list = null; }
      if (/^\s*<(h\d|pre|blockquote|img)/.test(line) || /^\u0000\d+\u0000$/.test(line.trim())) out += line;
      else if (line.trim()) out += `<p>${line}</p>`;
    }
  }
  if (list) out += `</${list}>`;
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => blocks[i]);
}

let toastTimer;
function toast(msg, ms = 2800) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.hidden = true, ms);
}

const when = ts => {
  const d = new Date(ts);
  return new Date().toDateString() === d.toDateString()
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

/* ── sessions ── */
function renderSessions() {
  const list = $('#sessionList');
  const st = Store.get();
  list.innerHTML = '';
  $('#sessionCount').textContent = st.sessions.length;

  for (const s of st.sessions) {
    const node = el('div', 'session' + (s.id === st.activeId ? ' active' : ''));
    const body = el('div', 's-body');
    body.append(el('span', 's-name', esc(s.title)));
    body.append(el('span', 's-meta', `${s.messages.length} msg · ${when(s.updated)}`));
    node.append(body);

    const del = el('button', 'icon-btn sm s-del', '✕');
    del.title = 'Delete this chat';
    del.onclick = e => {
      e.stopPropagation();
      if (!confirm(`Delete "${s.title}"? What ASK learned from it stays.`)) return;
      Store.deleteSession(s.id);
      renderAll();
    };
    node.append(del);
    node.onclick = () => { Store.setActive(s.id); renderAll(); closeRails(); };
    list.append(node);
  }
}

/* ── the "you" rail ── */
function renderGoals() {
  const card = $('#goalCard');
  const goals = Store.openGoals();
  const primary = Store.primaryGoal();

  if (!goals.length) {
    card.innerHTML = `<div class="goal-empty">
      <b>No goal set</b>
      <p class="muted">Tell ASK what you are working toward and it keeps steering back to it.</p>
    </div>`;
    const add = el('button', 'btn btn-ghost btn-block sm', '+ Set one');
    add.onclick = askGoal;
    card.append(add);
    return;
  }

  card.innerHTML = `<div class="goal-label">Working toward</div>`;
  const head = el('div', 'goal-primary');
  head.append(el('p', null, esc(primary?.text || goals[0].text)));
  card.append(head);

  const rest = goals.filter(g => g !== primary);
  if (rest.length) {
    const ul = el('div', 'goal-rest');
    for (const g of rest) {
      const row = el('div', 'goal-row');
      row.append(el('span', null, esc(g.text)));
      const done = el('button', 'x', '✓');
      done.title = 'Done with this';
      done.onclick = () => { Store.updateGoal(g.id, { status: 'done' }); renderGoals(); toast('Marked done.'); };
      row.append(done);
      ul.append(row);
    }
    card.append(ul);
  }

  const nudge = Store.prefs().nudge;
  if (nudge) card.append(el('p', 'goal-nudge', esc(nudge)));

  const row = el('div', 'goal-actions');
  const edit = el('button', 'btn-link', 'change');
  edit.onclick = askGoal;
  const drop = el('button', 'btn-link', 'clear');
  drop.onclick = () => {
    if (!confirm('Drop every goal on record?')) return;
    Store.get().goals = [];
    Store.save();
    renderGoals();
  };
  row.append(edit, drop);
  card.append(row);
}

function askGoal() {
  const current = Store.primaryGoal()?.text || '';
  const text = prompt('What are you working toward right now?', current);
  if (text === null) return;
  const clean = text.trim();
  if (!clean) return;
  const g = Store.addGoal(clean, { horizon: 'now', primary: true });
  if (g) Store.updateGoal(g.id, { primary: true, status: 'open' });
  renderGoals();
  toast('Noted — it will keep coming back to that.');
}

function renderMemory() {
  const { rows, pct } = Memory.coverage();
  $('#gaugeRows').innerHTML = rows.map(r => `
    <div class="grow-row">
      <b>${r.label}</b>
      <div class="bar"><i style="width:${r.pct}%"></i></div>
      <s>${r.have}</s>
    </div>`).join('');
  $('#gaugePct').textContent = pct + '%';

  const groups = Store.memoryByCategory();
  const list = $('#memList');
  const count = Store.get().memory.length;
  $('#memCountLabel').textContent = `${count} remembered`;

  if (!count) {
    list.innerHTML = `<div class="mem-empty">
      <p>Nothing pinned yet.</p>
      <p class="muted">Just talk. Anything durable you mention lands here and gets carried into every future chat — and you can delete any of it.</p>
    </div>`;
    return;
  }

  list.innerHTML = '';
  for (const [cat, items] of Object.entries(groups)) {
    const g = el('div', 'mem-group');
    g.append(el('h4', null, Memory.COVERAGE[cat]?.label || cat));
    for (const m of items) {
      const item = el('div', 'mem-item', esc(m.fact));
      const x = el('button', 'x', '✕');
      x.title = 'Forget this';
      x.onclick = () => { Store.removeMemory(m.id); renderMemory(); toast('Forgotten.'); };
      item.append(x);
      g.append(item);
    }
    list.append(g);
  }
}

/* ── chat stream ── */
function renderStream() {
  const s = Store.active();
  const stream = $('#stream');
  stream.innerHTML = '';

  $('#chatTitle').textContent = s.title;
  $('#chatSub').textContent = s.messages.length
    ? `${s.messages.length} messages · ${when(s.created)}`
    : 'Say anything.';

  if (!s.messages.length) { renderWelcome(stream); return; }
  for (const m of s.messages) stream.append(bubble(m));
  stream.scrollTop = stream.scrollHeight;
}

function renderWelcome(stream) {
  const name = Store.prefs().callMe || Store.currentProfile()?.name || '';
  const w = el('div', 'welcome');
  w.innerHTML = `
    <h2>${name ? `Hello again, ${esc(name)}.` : 'Start talking.'}</h2>
    <p>Type it, or tap the microphone and say it. Whatever matters gets kept.</p>
    <div class="welcome-grid">
      <button class="wcard" data-act="teach"><strong>Teach me something</strong><span>Step by step, nothing assumed</span></button>
      <button class="wcard" data-act="interview"><strong>Get to know me</strong><span>It asks, you answer</span></button>
      <button class="wcard" data-act="image"><strong>Make an image</strong><span>No key needed</span></button>
      <button class="wcard" data-act="recall"><strong>What do you know?</strong><span>Read back the picture so far</span></button>
    </div>`;
  w.querySelectorAll('[data-act]').forEach(b => b.onclick = () => quickAction(b.dataset.act));
  stream.append(w);
}

function bubble(m) {
  const isUser = m.role === 'user';
  const node = el('div', `msg ${isUser ? 'user' : 'bot'}${m.error ? ' err' : ''}`);
  const p = Store.currentProfile();
  const av = el('div', 'avatar', isUser ? (p?.emoji || 'YOU') : '◆');
  if (isUser && p) av.style.background = p.color + '22', av.style.color = p.color;
  node.append(av);

  const b = el('div', 'bubble');
  const who = el('div', 'who');
  who.append(el('span', null, isUser ? (Store.prefs().callMe || 'You') : (Store.prefs().botName || 'ASK')));
  if (m.via) who.append(el('span', 'via', `via ${esc(m.via)}`));
  b.append(who);
  b.append(el('div', 'body', md(m.content)));

  if (m.polished) {
    const chip = el('button', 'polish-chip', m.brief ? 'what was actually asked' : 'tidied before sending');
    const shown = el('div', 'polish-text', esc(m.polished));
    shown.hidden = true;
    chip.onclick = () => { shown.hidden = !shown.hidden; chip.classList.toggle('open', !shown.hidden); };
    b.append(chip, shown);
  }

  if (m.sources?.length) b.append(sourceList(m.sources));
  if (!isUser && !m.error) b.append(msgActions(m));

  node.append(b);
  return node;
}

/* Where a fresh answer came from. */
function sourceList(sources) {
  const wrap = el('div', 'sources');
  wrap.append(el('div', 'sources-label', 'Checked just now'));
  for (const s of sources.slice(0, 5)) {
    const a = el('a', 'source');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `<b>${esc(s.from)}</b> ${esc(s.title)}${s.when ? ` <s>${esc(s.when)}</s>` : ''}`;
    wrap.append(a);
  }
  return wrap;
}

/* Read it out, or ask for it again in plainer words. */
function msgActions(m) {
  const row = el('div', 'msg-actions');

  if (Voice.canSpeak()) {
    const speak = el('button', 'msg-act', '🔊 Read aloud');
    speak.onclick = () => {
      if (Voice.isSpeaking()) { Voice.stopSpeaking(); speak.textContent = '🔊 Read aloud'; return; }
      Voice.unlock();
      Voice.speak(m.content, { onEnd: () => { speak.textContent = '🔊 Read aloud'; } });
      speak.textContent = '■ Stop';
      Store.log('voice.speak', m.content.slice(0, 60));
    };
    row.append(speak);
  }

  const simpler = el('button', 'msg-act', 'Explain simpler');
  simpler.onclick = () => send('That was over my head — simpler please.', {
    skipPolish: true, sendAs: Memory.simplerPrompt()
  });
  row.append(simpler);

  const copy = el('button', 'msg-act', 'Copy');
  copy.onclick = async () => {
    try { await navigator.clipboard.writeText(m.content); toast('Copied.'); }
    catch { toast('The browser would not let me copy that.'); }
  };
  row.append(copy);

  return row;
}

function renderStatus() {
  const chain = Providers.chain();
  const dot = $('#statusDot'), text = $('#statusText');
  const label = Providers.activeLabel();
  const shared = Store.onStarterKey();

  if (!chain.length) {
    dot.className = 'dot warn';
    $('#pillDot').className = 'dot sm warn';
    text.textContent = 'No model switched on';
    $('#activeModelLabel').textContent = 'no model';
  } else {
    dot.className = 'dot on';
    $('#pillDot').className = 'dot sm on';
    text.textContent = shared ? 'Ready — on the shared key' : 'Ready — on your own key';
    $('#activeModelLabel').textContent = modelName(label.model).split(' — ')[0];
    $('#btnModel').title = `${label.name} · ${label.model}${label.pinned ? ' (your pick)' : ' (first in line)'}`;
  }
  // the amber button only matters while they are still on the shared key
  $('#btnGetKey').classList.toggle('hide', !shared);
}

function renderProfileChip() {
  const p = Store.currentProfile();
  if (!p) return;
  $('#profileAvatar').textContent = p.emoji;
  $('#profileAvatar').style.background = p.color;
  $('#profileName').textContent = p.name;
  $('#brandSub').textContent = `${p.name}'s`;
}

function renderAll() {
  renderSessions();
  renderStream();
  renderMemory();
  renderGoals();
  renderStatus();
  renderProfileChip();
}

/* ── sending ── */
/* text        — what shows in the chat
   opts.sendAs — what the model actually receives instead (used by the quick actions,
                 so "Get to know me." on screen carries a full interview brief underneath)
   opts.silent — send without showing anything, for the first-hello */
async function send(text, { silent = false, skipPolish = false, sendAs = null } = {}) {
  if (busy) return;
  const raw = String(text || '').trim();
  if (!raw) return;

  $('#input').value = '';
  autosize();

  busy = true;
  $('#btnSend').disabled = true;
  $('#btnSend').classList.add('stop');
  const stream = $('#stream');
  if (stream.querySelector('.welcome')) stream.innerHTML = '';

  let sendText = raw;
  let polishedWith = null;
  let userMsg = null;

  let userNode = null;
  if (!silent) {
    userMsg = Store.push('user', raw, sendAs ? { polished: sendAs, brief: true } : {});
    userNode = bubble(userMsg);
    stream.append(userNode);
    stream.scrollTop = stream.scrollHeight;
    renderSessions();
  }

  const holder = el('div', 'msg bot');
  holder.append(el('div', 'avatar', '◆'));
  const b = el('div', 'bubble');
  const who = el('div', 'who');
  who.append(el('span', null, Store.prefs().botName || 'ASK'));
  const via = el('span', 'via', '');
  who.append(via);
  b.append(who);
  const body = el('div', 'body', '<div class="typing"><i></i><i></i><i></i></div>');
  b.append(body);
  holder.append(b);
  stream.append(holder);
  stream.scrollTop = stream.scrollHeight;

  controller = new AbortController();
  let acc = '';

  try {
    // Tidy the message before it goes out — the original is what stays on screen.
    if (!silent && !skipPolish && !sendAs && Providers.chain().length) {
      via.textContent = 'reading it back…';
      const res = await Polish.run(raw, { signal: controller.signal });
      if (res.polished) {
        sendText = res.sent;
        polishedWith = res.sent;
        if (userMsg) {
          userMsg.polished = res.sent;
          Store.save();
          const fresh = bubble(userMsg);
          userNode?.replaceWith(fresh);
          userNode = fresh;
        }
        Store.log('prompt.polish', `Sent instead: ${res.sent.slice(0, 160)}`);
      }
      via.textContent = '';
    }

    /* Anything time-sensitive gets checked against the open web first, so the answer is not
       just whatever the model remembers from training. */
    let found = null;
    if (!silent && Lookup.needed(sendText)) {
      via.textContent = 'checking the web…';
      found = await Lookup.run(sendText);
      via.textContent = '';
    }

    /* What the model sees: the polished wording where there is one, the original otherwise.
       The stored message keeps both, so the chat still shows what was actually typed. */
    const s = Store.active();
    const history = s.messages.slice(-24).map(m => ({
      role: m.role,
      content: m.role === 'user' && m.polished ? m.polished : m.content
    }));
    const messages = [
      { role: 'system', content: Memory.systemPrompt() },
      ...(found ? [{ role: 'system', content: found.context }] : []),
      ...history,
      ...(silent ? [{ role: 'user', content: sendText }] : [])
    ];

    const { text: reply, provider, ms } = await Providers.chat(messages, {
      signal: controller.signal,
      onToken: (_, full) => {
        acc = full;
        body.innerHTML = md(full);
        const nearBottom = stream.scrollHeight - stream.scrollTop - stream.clientHeight < 160;
        if (nearBottom) stream.scrollTop = stream.scrollHeight;
      },
      onFallback: (p, why) => { via.textContent = `${p.name} wouldn't answer, trying the next…`; }
    });

    via.textContent = `via ${provider.name}`;
    body.innerHTML = md(reply);
    const stored = Store.push('assistant', reply, {
      via: provider.name, model: provider.model,
      ...(found ? { sources: found.sources.slice(0, 5) } : {})
    });
    Store.log('chat.reply', `${provider.name} · ${provider.model} · ${(ms / 1000).toFixed(1)}s`);

    // swap the live bubble for the stored one so sources and the action row appear
    holder.replaceWith(bubble(stored));
    stream.scrollTop = stream.scrollHeight;

    // read it out if they asked for that, or if we are mid voice-chat
    if (Voice.isHandsFree()) Voice.handsFreeReply(reply);
    else if (Store.prefs().speak) Voice.speak(reply);

    s.turnsSinceExtract = (s.turnsSinceExtract || 0) + 1;
    s.turnsSinceGoal = (s.turnsSinceGoal || 0) + 1;
    Store.save();
    afterTurn(s);

  } catch (e) {
    if (e.name === 'AbortError') {
      body.innerHTML = md(acc + '\n\n*(stopped)*');
      if (acc) Store.push('assistant', acc);
    } else {
      // Not a wall of provider errors — a card that offers to fix it in five steps.
      Store.log('chat.error', (e.friendly || e.message).slice(0, 200));
      lastAsked = sendText;
      holder.replaceWith(Keys.chatFailure(e));
      stream.scrollTop = stream.scrollHeight;
    }
  } finally {
    busy = false;
    $('#btnSend').disabled = false;
    $('#btnSend').classList.remove('stop');
    controller = null;
    renderSessions();
    renderStatus();
  }
  return polishedWith;
}

/* Memory and goals both refresh in the background after a reply. */
async function afterTurn(session) {
  const p = Store.prefs();

  // Every so often, point out that the shared key is not the good version of this.
  if (Store.nudgeDue()) {
    $('#stream').append(Keys.nudgeCard());
    $('#stream').scrollTop = $('#stream').scrollHeight;
  }

  const every = Number(p.extractEvery) || 0;
  if (every && (session.turnsSinceExtract || 0) >= every) {
    session.turnsSinceExtract = 0;
    Store.save();
    const added = await Memory.extract(session);
    if (added.length) {
      renderMemory();
      flash(`Pinned: ${added.map(esc).join(' · ')}`);
    }
  }

  // Wait for an actual conversation before asking what they are aiming at — otherwise the
  // counter resets on a two-message session and the next look-in is another six turns away.
  const goalEvery = Number(p.goalReviewEvery) || 0;
  if (goalEvery && (session.turnsSinceGoal || 0) >= goalEvery && session.messages.length >= 4) {
    session.turnsSinceGoal = 0;
    Store.save();
    const res = await Memory.reviewGoals(session);
    if (res && (res.count || res.primary)) {
      renderGoals();
      if (res.primary) flash(`Now steering toward: ${esc(res.primary)}`);
    }
  }
}

function flash(html) {
  const stream = $('#stream');
  stream.append(el('div', 'mem-flash', html));
  stream.scrollTop = stream.scrollHeight;
}

/* ── quick actions ── */
function quickAction(act) {
  if (act === 'teach') {
    const topic = prompt('What do you want to be walked through?\n\nAnything — a tool, a skill, a word you keep hearing.', '');
    if (topic === null) return;
    const clean = topic.trim();
    return send(clean ? `Teach me about ${clean}, from scratch.` : 'Walk me through that from scratch.', {
      skipPolish: true, sendAs: Memory.teachPrompt(clean)
    });
  }
  if (act === 'interview') return send('Get to know me — ask me things.', { skipPolish: true, sendAs: Memory.interviewKickoff() });
  if (act === 'recall') {
    if (!Store.get().memory.length) return toast('Nothing remembered yet — try "Get to know me".');
    return send('What do you know about me?', {
      skipPolish: true,
      sendAs: 'Tell me what you know about me so far. Group it, keep it tight, and finish with the two biggest blanks you still have.'
    });
  }
  if (act === 'image' || act === 'banner') return openStudio(act);
}

/* Plain-English names for the models people will actually meet. Everything here is
   open-weights — anyone can download and run these. */
const MODEL_NAMES = {
  'llama-3.3-70b-versatile': 'Llama 3.3 70B — quick and good at most things',
  'openai/gpt-oss-120b': 'GPT-OSS 120B — the strongest here',
  'openai/gpt-oss-20b': 'GPT-OSS 20B — lighter and faster',
  'openai/gpt-oss-20b:free': 'GPT-OSS 20B — free, lighter and faster',
  'qwen/qwen3.6-27b': 'Qwen 3.6 27B — strong at other languages',
  'llama-3.1-8b-instant': 'Llama 3.1 8B — fastest, simplest answers',
  'openai-fast': 'GPT-OSS 20B — the no-key one',
  'moonshotai/kimi-k2': 'Kimi K2 — long memory, natural writing',
  'kimi-k2-0905-preview': 'Kimi K2 — long memory, natural writing',
  'kimi-k2-turbo-preview': 'Kimi K2 Turbo — same, quicker',
  'deepseek/deepseek-chat': 'DeepSeek V3 — careful and cheap',
  'deepseek-chat': 'DeepSeek V3 — careful and cheap',
  'deepseek/deepseek-r1': 'DeepSeek R1 — thinks before it answers',
  'deepseek-reasoner': 'DeepSeek R1 — thinks before it answers',
  'qwen/qwen3-235b-a22b': 'Qwen 3 235B — big, strong at languages',
  'meta-llama/llama-3.3-70b-instruct': 'Llama 3.3 70B — quick and good at most things',
  'mistralai/mistral-small-3.2-24b-instruct': 'Mistral Small 3.2 — tidy and efficient',
  'google/gemma-4-31b-it:free': 'Gemma 4 31B — free, good at explaining',
  'nvidia/nemotron-3-super-120b-a12b:free': 'Nemotron 3 Super — free, very capable'
};
const modelName = id => MODEL_NAMES[id] || id;

/* ── model picker ── */
function openModelSheet() {
  const wrap = $('#modelOptions');
  wrap.innerHTML = '';
  const opts = Providers.options();
  const choice = Store.prefs().modelChoice;

  if (!opts.length) {
    wrap.innerHTML = `<p class="note">No model is connected yet. Add one key in <strong>Models &amp; keys</strong> and everything here fills in.</p>`;
    $('#modelModal').hidden = false;
    return;
  }

  const auto = el('button', 'model-opt' + (!choice ? ' on' : ''),
    `<strong>Auto</strong><span>Whatever is top of the chain — ${esc(Providers.ready()[0]?.name || '')}</span>`);
  auto.onclick = () => { Store.prefs().modelChoice = null; Store.save(); renderStatus(); openModelSheet(); toast('Back to automatic.'); };
  wrap.append(auto);

  let lastProvider = '';
  for (const o of opts) {
    if (o.providerName !== lastProvider) {
      wrap.append(el('div', 'model-group', esc(o.providerName)));
      lastProvider = o.providerName;
    }
    const on = choice && choice.providerId === o.providerId && choice.model === o.model;
    const pretty = modelName(o.model);
    const b = el('button', 'model-opt' + (on ? ' on' : ''),
      pretty === o.model ? `<strong>${esc(o.model)}</strong>` : `<strong>${esc(pretty)}</strong><span>${esc(o.model)}</span>`);
    b.onclick = () => {
      Store.prefs().modelChoice = { providerId: o.providerId, model: o.model };
      Store.save();
      Store.log('model.pick', `${o.providerName} · ${o.model}`);
      renderStatus();
      $('#modelModal').hidden = true;
      toast(`${o.model} it is.`);
    };
    wrap.append(b);
  }
  $('#modelModal').hidden = false;
}

/* ── settings ── */
function renderProviders() {
  const wrap = $('#providerList');
  wrap.innerHTML = '';

  /* The way in, at the top, where it cannot be missed. Everything technical is folded
     away inside each card, so this page reads as a list of services and their state. */
  const lead = el('div', 'setup-lead');
  lead.innerHTML = `<b>Add a model, step by step</b>
    <p>Five short steps and ASK checks it works before saving. No technical knowledge needed.</p>`;
  const leadBtn = el('button', 'btn btn-primary btn-block', 'Show me how');
  leadBtn.onclick = () => { $('#settingsModal').hidden = true; Keys.open({ onDone: () => { renderStatus(); openSettings('models'); } }); };
  lead.append(leadBtn);
  wrap.append(lead);

  const list = [...Store.providers()].sort((a, b) => a.rank - b.rank);

  list.forEach((p, i) => {
    const own = p.key && p.key !== Store.starterKey();
    const ready = p.enabled && p.base && p.model && (p.key || p.keyless || p.id === 'ollama');
    const card = el('div', 'provider' + (ready ? ' enabled' : ''));

    /* ── the plain part ── */
    const headRow = el('div', 'p-head');
    headRow.append(el('div', 'p-rank', String(i + 1)));

    const nm = el('div', 'p-name');
    nm.append(el('strong', null, esc(p.friendly || p.name)));
    nm.append(el('span', null, esc(p.blurb || 'Any OpenAI-compatible service')));
    headRow.append(nm);

    const sw = el('label', 'switch');
    sw.title = p.enabled ? 'On — ASK may use this' : 'Off — ASK will skip this';
    const cb = el('input'); cb.type = 'checkbox'; cb.checked = !!p.enabled;
    cb.onchange = () => { p.enabled = cb.checked; Store.saveApp(); renderProviders(); renderStatus(); };
    sw.append(cb, el('i'));
    headRow.append(sw);
    card.append(headRow);

    const state = el('div', 'p-state');
    let chip, chipClass, line;
    if (!p.enabled) { chip = 'Off'; chipClass = 'off'; line = 'Switched off. Turn it on to use it.'; }
    else if (p.keyless) { chip = 'Ready'; chipClass = 'ok'; line = 'Works with no key at all.'; }
    else if (p.id === 'ollama') { chip = p.base ? 'Ready' : 'Needs setting up'; chipClass = 'ok'; line = 'Runs on your own computer.'; }
    else if (own) { chip = 'Your key'; chipClass = 'ok'; line = 'Using your own key — nobody else shares it.'; }
    else if (p.key) { chip = 'Shared key'; chipClass = 'warn'; line = 'On the key that ships with ASK. Add your own to make it quicker.'; }
    else { chip = 'No key yet'; chipClass = 'warn'; line = 'Add a key and ASK will use this too.'; }
    state.innerHTML = `<i class="p-chip ${chipClass}">${chip}</i><span>${esc(line)}</span>`;
    card.append(state);

    const actions = el('div', 'p-actions');
    if (!p.keyless) {
      const setup = el('button', 'btn' + (own ? '' : ' btn-primary'), own ? 'Change key' : 'Set this up');
      setup.onclick = () => { $('#settingsModal').hidden = true; Keys.open({ onDone: () => { renderStatus(); openSettings('models'); } }); };
      actions.append(setup);
    }
    const check = el('button', 'btn', 'Check it works');
    check.onclick = async () => {
      check.textContent = 'Checking…';
      check.disabled = true;
      try {
        const reply = await Providers.test(p);
        setStatusLine(card, 'ok', `Working — it answered "${reply}"`);
        Store.log('model.test', `${p.name} ok`);
      } catch (err) {
        setStatusLine(card, 'bad', Keys.friendlyKeyError(err.message, p).replace(/<[^>]+>/g, ''));
        Store.log('model.test', `${p.name} failed: ${err.message}`.slice(0, 200));
      } finally { check.textContent = 'Check it works'; check.disabled = false; }
    };
    actions.append(check);
    card.append(actions);
    card.append(el('div', 'p-test', ''));

    /* ── the technical part, folded away ── */
    const details = el('details', 'p-advanced');
    const summary = el('summary', null, 'Advanced — address, model name, order');
    details.append(summary);

    const bodyEl = el('div', 'p-body');

    if (p.note) {
      const warn = el('div', 'field full');
      warn.innerHTML = `<span class="${p.needsProxy ? 'alarm' : ''}">${p.needsProxy ? 'Needs a proxy' : 'Worth knowing'}</span>
        <p class="note sm" style="margin:0">${esc(p.note)}</p>`;
      bodyEl.append(warn);
    }

    const keyField = el('label', 'field full');
    keyField.append(el('span', null, 'Key'));
    const keyIn = el('input');
    keyIn.type = 'password';
    keyIn.value = p.key || '';
    keyIn.placeholder = p.id === 'ollama' ? 'not needed locally' : 'sk-…';
    keyIn.oninput = () => { p.key = keyIn.value.trim(); Store.saveApp(); renderStatus(); };
    keyField.append(keyIn);
    bodyEl.append(keyField);

    const baseField = el('label', 'field');
    baseField.append(el('span', null, 'Address'));
    const baseIn = el('input');
    baseIn.value = p.base || '';
    baseIn.placeholder = 'https://…/v1';
    baseIn.oninput = () => { p.base = baseIn.value.trim(); Store.saveApp(); renderStatus(); };
    baseField.append(baseIn);
    bodyEl.append(baseField);

    const modelField = el('label', 'field');
    modelField.append(el('span', null, 'Model name'));
    const row = el('div', 'with-btn');
    const modelIn = el('input');
    modelIn.value = p.model || '';
    modelIn.setAttribute('list', `dl-${p.id}`);
    modelIn.oninput = () => { p.model = modelIn.value.trim(); Store.saveApp(); renderStatus(); };
    const dl = el('datalist'); dl.id = `dl-${p.id}`;
    dl.innerHTML = (p.models || []).map(m => `<option value="${esc(m)}">`).join('');
    const loadBtn = el('button', 'btn sm', 'Refresh list');
    loadBtn.title = 'Ask the provider which models this key can run';
    loadBtn.onclick = async e => {
      e.preventDefault();
      loadBtn.textContent = '…';
      try {
        p.models = await Providers.listModels(p);
        Store.saveApp();
        renderProviders();
        toast(`${p.models.length} models found.`);
      } catch (err) {
        loadBtn.textContent = 'Refresh list';
        setStatusLine(card, 'bad', `Could not fetch the list: ${err.message}`);
      }
    };
    row.append(modelIn, dl, loadBtn);
    modelField.append(row);
    bodyEl.append(modelField);

    const order = el('div', 'field full');
    order.append(el('span', null, 'Order in the queue'));
    const orderRow = el('div', 'p-move');
    const up = el('button', 'btn sm', '↑ earlier');
    up.disabled = i === 0;
    up.onclick = e => { e.preventDefault(); swapRank(p.id, list[i - 1].id); };
    const down = el('button', 'btn sm', '↓ later');
    down.disabled = i === list.length - 1;
    down.onclick = e => { e.preventDefault(); swapRank(p.id, list[i + 1].id); };
    orderRow.append(up, down);
    order.append(orderRow);
    bodyEl.append(order);

    if (p.signup) {
      const help = el('div', 'field full p-help');
      const site = el('button', 'btn sm', 'Open their site ↗');
      site.onclick = e => { e.preventDefault(); Keys.openLink(p.signup); };
      help.append(site);
      bodyEl.append(help);
    }

    details.append(bodyEl);
    card.append(details);
    wrap.append(card);
  });
}

function setStatusLine(card, cls, msg) {
  const line = card.querySelector('.p-test');
  line.className = `p-test ${cls}`;
  line.textContent = msg;
}

function swapRank(idA, idB) {
  const ps = Store.providers();
  const a = ps.find(p => p.id === idA), b = ps.find(p => p.id === idB);
  [a.rank, b.rank] = [b.rank, a.rank];
  Store.saveApp();
  renderProviders();
  renderStatus();
}

function renderDataTab() {
  const u = Store.get();
  const p = Store.currentProfile();
  const rows = $('#dataRows');
  const size = new Blob([localStorage.getItem(`asher.v2.u.${p?.id}`) || '']).size;
  rows.innerHTML = `
    <div class="stat"><b>${u.sessions.length}</b><span>chats</span></div>
    <div class="stat"><b>${u.stats.messages}</b><span>messages sent</span></div>
    <div class="stat"><b>${u.memory.length}</b><span>things remembered</span></div>
    <div class="stat"><b>${u.stats.images}</b><span>images made</span></div>
    <div class="stat"><b>${u.logs.length}</b><span>log entries</span></div>
    <div class="stat"><b>${(size / 1024).toFixed(0)}k</b><span>of storage</span></div>`;

  const manage = $('#profileManage');
  manage.innerHTML = '';
  for (const prof of Store.profiles()) {
    const row = el('div', 'pm-row' + (prof.id === p?.id ? ' me' : ''));
    row.innerHTML = `<i class="pav" style="background:${prof.color}">${prof.emoji}</i>
      <span class="pname">${esc(prof.name)}</span>
      <span class="pmeta">${prof.pin ? 'PIN set' : 'no PIN'} · last open ${when(prof.lastSeen || prof.created)}</span>`;
    if (prof.id !== p?.id) {
      const go = el('button', 'btn-link', 'switch to');
      go.onclick = () => { $('#settingsModal').hidden = true; Onboarding.pickProfile(); };
      row.append(go);
    }
    manage.append(row);
  }
  const add = el('button', 'btn btn-ghost btn-block sm', '+ Add someone else');
  add.onclick = () => { $('#settingsModal').hidden = true; Onboarding.addProfile(); };
  manage.append(add);
}

function fillPrefs() {
  const p = Store.prefs();
  $('#setCallMe').value = p.callMe || '';
  $('#setBotName').value = p.botName || 'ASK';
  $('#setTone').value = p.tone || 'warm';
  $('#setLevel').value = p.level || 'new';
  $('#setLookup').value = p.lookup || 'smart';
  $('#setLength').value = p.replyLength || 'medium';
  $('#setLanguage').value = p.language || 'auto';
  renderLangHint();
  $('#setPolish').value = p.polish || 'smart';
  $('#setExtractEvery').value = String(p.extractEvery ?? 3);
  $('#setGoalEvery').value = String(p.goalReviewEvery ?? 6);
  $('#setTemp').value = p.temperature ?? 0.75;
  $('#setPersona').value = p.persona || '';
  $('#setImageEnhance').value = p.imageEnhance === false ? 'off' : 'on';
  fillVoicePrefs();
}

function readPrefs() {
  const p = Store.prefs();
  p.callMe = $('#setCallMe').value.trim();
  p.botName = $('#setBotName').value.trim() || 'ASK';
  p.tone = $('#setTone').value;
  p.level = $('#setLevel').value;
  p.lookup = $('#setLookup').value;
  p.replyLength = $('#setLength').value;
  p.language = $('#setLanguage').value;
  p.languagePicked = p.language !== 'auto';
  renderLangHint();
  p.polish = $('#setPolish').value;
  p.extractEvery = Number($('#setExtractEvery').value);
  p.goalReviewEvery = Number($('#setGoalEvery').value);
  p.temperature = Number($('#setTemp').value);
  p.persona = $('#setPersona').value.trim();
  p.imageEnhance = $('#setImageEnhance').value === 'on';
  p.speak = $('#setSpeak').value === 'on';
  const voiceChoice = $('#setVoiceName').value;
  if (voiceChoice === '__all') {
    // they asked for the long list — show it, keep whatever was set
    const sel = $('#setVoiceName');
    sel.innerHTML = '<option value=\'\'>Standard — whatever this device uses</option>' +
      Voice.list().map(v => `<option value="${esc(v.name)}">${esc(v.name)} — ${esc(v.lang)}</option>`).join('');
    sel.value = p.voiceName || '';
  } else {
    p.voiceName = voiceChoice;
  }
  p.voiceRate = Number($('#setVoiceRate').value);
  p.voicePitch = Number($('#setVoicePitch').value);
  p.sttMode = $('#setSttMode').value;
  Store.save();
}

function renderLangHint() {
  const hint = $('#langHint');
  if (!hint) return;
  const p = Store.prefs();
  if (p.language && p.language !== 'auto') { hint.textContent = `Pinned: every reply comes back in ${p.language}.`; return; }
  const code = Lang.ofSession(Store.active(), null);
  hint.textContent = code
    ? `Right now it is answering in ${Lang.label(code)} — because that is what you have been writing.`
    : 'It will match whatever you write in — English, Roman Urdu or Urdu.';
}

/* ── voice ── */
function fillVoicePrefs() {
  const p = Store.prefs();
  $('#setSpeak').value = p.speak ? 'on' : 'off';
  $('#setVoiceRate').value = p.voiceRate ?? 1;
  $('#setVoicePitch').value = p.voicePitch ?? 1;
  $('#setSttMode').value = p.sttMode || 'browser';

  /* Two picks and a default, rather than the forty-odd voices a device actually has —
     the full list is still reachable through "every voice on this device". */
  const sel = $('#setVoiceName');
  const picks = Voice.shortlist();
  const options = [
    `<option value="">Standard — whatever this device uses</option>`,
    ...picks.map((v, i) => `<option value="${esc(v.name)}">${i === 0 ? 'Warm' : 'Clear'} — ${esc(v.label)}</option>`)
  ];
  if (p.voiceName && !picks.some(v => v.name === p.voiceName)) {
    options.push(`<option value="${esc(p.voiceName)}">${esc(p.voiceName)}</option>`);
  }
  options.push(`<option value="__all">Show me every voice on this device…</option>`);
  sel.innerHTML = options.join('');
  sel.value = p.voiceName || '';
  $('#voiceHint').textContent = Voice.canSpeak()
    ? 'Tap “Say something” to hear it.'
    : 'This browser cannot read text out loud.';

  const bits = [];
  bits.push(Voice.canSpeak() ? 'Reading out loud: works here.' : 'Reading out loud: this browser cannot.');
  if (window.SpeechRecognition || window.webkitSpeechRecognition) bits.push('Listening: works here, no key.');
  else if (Voice.canRecord()) bits.push('Listening: this browser has no built-in recognition, so it needs the Whisper option and a Groq key.');
  else bits.push('Listening: not available in this browser.');
  if (Providers.sttProvider()) bits.push(`Whisper available through ${Providers.sttProvider().name}.`);
  $('#voiceSupport').innerHTML = bits.map(b => `<p class="note sm" style="margin:2px 0">${esc(b)}</p>`).join('');
}

function setVoiceState(state) {
  const bar = $('#voiceBar');
  const label = { listening: 'Listening…', transcribing: 'Writing that down…', speaking: 'Speaking…', thinking: 'Thinking…' }[state];
  if (!label) { bar.hidden = true; return; }
  $('#voiceState').textContent = label;
  bar.hidden = false;
}

function micTap() {
  Voice.unlock();
  if (Voice.isListening()) return Voice.stopListening();
  $('#btnMic').classList.add('on');
  setVoiceState('listening');
  Voice.startListening({
    onPartial: text => { $('#input').value = text; autosize(); },
    onFinal: text => {
      $('#btnMic').classList.remove('on');
      setVoiceState(null);
      if (!text) return;
      $('#input').value = text;
      autosize();
      Store.log('voice.heard', text.slice(0, 100));
      send(text);
    },
    onError: e => {
      $('#btnMic').classList.remove('on');
      setVoiceState(null);
      toast(e.message);
    },
    onState: setVoiceState
  });
}

function toggleHandsFree() {
  if (Voice.isHandsFree()) {
    Voice.stopHandsFree();
    return;
  }
  if (!Voice.canListen()) return toast('This browser cannot listen. Chrome, Edge or Safari can.');
  Voice.unlock();
  toast('Voice chat on — talk, and it answers out loud. Tap again to stop.');
  Voice.startHandsFree({
    onPartial: text => { $('#input').value = text; autosize(); },
    onTranscript: text => {
      $('#input').value = '';
      autosize();
      setVoiceState('thinking');
      send(text);
    },
    onError: e => { toast(e.message); setVoiceState(null); },
    onState: setVoiceState
  });
}

function renderVoiceChrome() {
  const on = Voice.isHandsFree();
  $('#btnHandsFree').classList.toggle('on', on);
  $('#handsFreeLabel').textContent = on ? 'Voice chat on' : 'Voice chat';
  $('#btnMic').classList.toggle('on', Voice.isListening());
  if (!on && !Voice.isListening() && !Voice.isSpeaking()) setVoiceState(null);
}

function openSettings(tab = 'models') {
  fillPrefs();
  renderProviders();
  renderDataTab();
  showTab(tab);
  $('#settingsModal').hidden = false;
}

function showTab(name) {
  $$('#settingsTabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === name));
  $$('.tab-panel').forEach(p => p.classList.toggle('on', p.dataset.panel === name));
}

/* ── studio ── */
function openStudio(mode) {
  studioMode = mode;
  $('#studioTitle').textContent = mode === 'banner' ? 'Banner studio' : 'Image studio';
  $('#bannerFields').classList.toggle('hide', mode !== 'banner');
  if (mode === 'banner' && !$('#imgSize').value.startsWith('1500')) $('#imgSize').value = '1500x500';
  $('#imgEnhance').checked = Store.prefs().imageEnhance !== false;
  $('#studioModal').hidden = false;
}

async function runGenerate() {
  const prompt = $('#imgPrompt').value.trim();
  if (!prompt) return toast('Describe what it should show first.');

  const [w, h] = $('#imgSize').value.split('x').map(Number);
  const seedRaw = $('#imgSeed').value.trim();
  const seed = seedRaw ? Number(seedRaw) : undefined;
  const enhance = $('#imgEnhance').checked;

  const btn = $('#btnGenerate');
  btn.disabled = true; btn.textContent = 'Drawing…';
  $('#canvasEmpty').textContent = 'Drawing…';
  $('#canvasEmpty').hidden = false;
  $('#bannerCanvas').hidden = true;

  try {
    const canvas = studioMode === 'banner'
      ? await Images.banner({
          prompt, w, h, seed,
          enhance,
          headline: $('#banHead').value.trim(),
          sub: $('#banSub').value.trim(),
          pos: $('#banPos').value,
          scrim: Number($('#banScrim').value)
        })
      : await Images.toCanvas(prompt, { w, h, seed, enhance });

    const target = $('#bannerCanvas');
    target.width = canvas.width; target.height = canvas.height;
    target.getContext('2d').drawImage(canvas, 0, 0);
    target.hidden = false;
    $('#canvasEmpty').hidden = true;
    $('#btnDownloadImg').disabled = false;
    $('#btnSendToChat').disabled = false;
  } catch (e) {
    $('#canvasEmpty').textContent = e.message;
    $('#canvasEmpty').hidden = false;
  } finally {
    btn.disabled = false; btn.textContent = 'Generate';
  }
}

async function improvePrompt() {
  const seed = $('#imgPrompt').value.trim();
  if (!seed) return toast('Write a rough idea first — it will sharpen it.');
  if (!Providers.chain().length) return toast('That needs a model key. Images themselves do not.');
  const btn = $('#btnImprovePrompt');
  btn.disabled = true; btn.textContent = 'Thinking…';
  try {
    $('#imgPrompt').value = await Polish.image(seed);
  } catch (e) {
    toast(e.friendly || e.message);
  } finally { btn.disabled = false; btn.textContent = 'Sharpen the prompt'; }
}

/* ── logs ── */
const LOG_LABELS = {
  'chat.reply': 'Replies', 'chat.error': 'Errors', 'chat.delete': 'Chats',
  'memory.add': 'Memory', 'memory.forget': 'Memory', 'memory.clear': 'Memory',
  'goal.add': 'Goals', 'goal.review': 'Goals', 'goal.remove': 'Goals',
  'image.generate': 'Images', 'image.fallback': 'Images',
  'model.fallback': 'Models', 'model.pick': 'Models', 'model.test': 'Models',
  'prompt.polish': 'Polish', 'profile.create': 'Profile', 'profile.open': 'Profile',
  'profile.ready': 'Profile', 'backup.import': 'Profile'
};

function openLogs() {
  renderLogs();
  $('#logsModal').hidden = false;
}

function renderLogs() {
  const all = Store.logs();
  const groups = [...new Set(Object.values(LOG_LABELS))];
  const filter = $('#logFilter');
  filter.innerHTML = '';
  ['all', ...groups].forEach(g => {
    const b = el('button', 'chip sm' + (logFilter === g ? ' chip-accent' : ''), g === 'all' ? 'Everything' : g);
    b.onclick = () => { logFilter = g; renderLogs(); };
    filter.append(b);
  });

  const rows = all.filter(l => logFilter === 'all' || LOG_LABELS[l.type] === logFilter);
  const list = $('#logList');
  if (!rows.length) {
    list.innerHTML = `<p class="note">Nothing logged in this slice yet.</p>`;
    return;
  }
  list.innerHTML = rows.slice(0, 250).map(l => `
    <div class="log-row">
      <span class="log-when">${new Date(l.ts).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
      <span class="log-type">${esc(LOG_LABELS[l.type] || l.type)}</span>
      <span class="log-detail">${esc(l.detail)}</span>
    </div>`).join('');
}

/* ── misc ── */
function autosize() {
  const t = $('#input');
  t.style.height = 'auto';
  t.style.height = Math.min(t.scrollHeight, 200) + 'px';
}

let scrim;
function ensureScrim() {
  if (scrim) return scrim;
  scrim = el('div', 'scrim');
  scrim.addEventListener('click', closeRails);
  document.body.append(scrim);
  return scrim;
}
function syncScrim() {
  const open = $('#railLeft').classList.contains('open') || $('#railRight').classList.contains('open');
  ensureScrim().classList.toggle('on', open);
}
function closeRails() {
  $('#railLeft').classList.remove('open');
  $('#railRight').classList.remove('open');
  syncScrim();
}
function toggleRail(sel) {
  const rail = $(sel);
  const wasOpen = rail.classList.contains('open');
  closeRails();
  if (!wasOpen) rail.classList.add('open');
  syncScrim();
}

function exportChat() {
  const s = Store.active();
  const meName = Store.prefs().callMe || 'Me';
  const botName = Store.prefs().botName || 'ASK';
  const body = `# ${s.title}\n\n_${new Date(s.created).toLocaleString()}_\n\n` +
    s.messages.map(m => `**${m.role === 'user' ? meName : botName}:**\n\n${m.content}`).join('\n\n---\n\n');
  const blob = new Blob([body], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${s.title.replace(/[^\w\s-]/g, '').slice(0, 40) || 'chat'}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadText(text, name, type) {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── events ── */
function wire() {
  $('#btnNewChat').onclick = () => { Store.newSession(); renderAll(); closeRails(); $('#input').focus(); };
  $('#btnSettings').onclick = () => openSettings('models');
  $('#btnExportChat').onclick = exportChat;
  $('#btnToggleLeft').onclick = () => toggleRail('#railLeft');
  $('#btnToggleRight').onclick = () => toggleRail('#railRight');
  $('#btnSend').onclick = () => busy ? controller?.abort() : send($('#input').value);
  $('#btnModel').onclick = openModelSheet;
  $('#btnStudio').onclick = () => openStudio('image');
  $('#btnLogs').onclick = openLogs;
  $('#btnProfile').onclick = () => Onboarding.pickProfile();
  $('#btnOpenSettingsFromModel').onclick = () => { $('#modelModal').hidden = true; openSettings('models'); };

  $('#btnExtractNow').onclick = async () => {
    const btn = $('#btnExtractNow');
    btn.textContent = 'Reading…'; btn.disabled = true;
    const added = await Memory.extract(Store.active());
    const goals = await Memory.reviewGoals(Store.active());
    btn.textContent = 'Pull memory from this chat'; btn.disabled = false;
    renderMemory(); renderGoals();
    toast(added.length ? `Pinned ${added.length} new thing${added.length === 1 ? '' : 's'}.` : (goals ? 'Goals refreshed.' : 'Nothing new worth keeping.'));
  };

  $('#btnMemMenu').onclick = () => {
    if (!Store.get().memory.length) return toast('Memory is already empty.');
    if (confirm('Forget everything ASK knows about you? Your chats stay, the memory panel empties.')) {
      Store.clearMemory(); renderMemory(); toast('Memory cleared.');
    }
  };

  $('#input').addEventListener('input', autosize);
  $('#input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send($('#input').value); }
  });
  $('#quickRow').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (b) quickAction(b.dataset.act);
  });

  $('#settingsTabs').addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if (t) showTab(t.dataset.tab);
  });

  document.addEventListener('click', e => {
    if (e.target.hasAttribute('data-close') || e.target.classList.contains('modal')) {
      e.target.closest('.modal').hidden = true;
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.modal:not([hidden])').forEach(m => m.hidden = true);
  });

  ['setCallMe', 'setBotName', 'setTone', 'setLevel', 'setLookup', 'setLength', 'setLanguage',
   'setPolish', 'setExtractEvery', 'setGoalEvery', 'setTemp', 'setPersona', 'setImageEnhance',
   'setSpeak', 'setVoiceName', 'setVoiceRate', 'setVoicePitch', 'setSttMode']
    .forEach(id => $('#' + id).addEventListener('input', () => { readPrefs(); renderProfileChip(); }));

  $('#btnHelp').onclick = () => Help.open();
  $('#imgEnhance').addEventListener('change', () => { Store.prefs().imageEnhance = $('#imgEnhance').checked; Store.save(); });
  $('#btnGetKey').onclick = () => Keys.open({ onDone: () => { renderStatus(); renderProviders(); } });
  document.addEventListener('ask:open-settings', e => openSettings(e.detail || 'models'));
  document.addEventListener('ask:retry', () => {
    if (!lastAsked) return toast('Type it again and I will have another go.');
    const again = lastAsked;
    lastAsked = '';
    send(again, { silent: true, skipPolish: true });
  });

  $('#btnMic').onclick = micTap;
  $('#btnHandsFree').onclick = toggleHandsFree;
  $('#btnVoiceStop').onclick = () => {
    Voice.stopHandsFree();
    Voice.stopListening();
    Voice.stopSpeaking();
    setVoiceState(null);
  };
  $('#btnTestVoice').onclick = e => {
    e.preventDefault();
    Voice.unlock();
    const name = Store.prefs().callMe || 'there';
    if (!Voice.speak(`Hello ${name}. This is how I'll sound when I read things out.`)) {
      toast('This browser has no speech built in.');
    }
  };
  Voice.onChange(renderVoiceChrome);

  $('#btnGenerate').onclick = runGenerate;
  $('#btnImprovePrompt').onclick = improvePrompt;
  $('#btnDownloadImg').onclick = () => Images.download(studioMode === 'banner' ? 'asher-banner.png' : 'asher-image.png');
  $('#btnSendToChat').onclick = () => {
    const data = Images.dataUrl();
    if (!data) return;
    const label = $('#banHead').value.trim() || $('#imgPrompt').value.trim().slice(0, 60);
    Store.push('assistant', `![${label}](${data})`);
    $('#studioModal').hidden = true;
    renderStream();
    toast('Added to the chat.');
  };

  $('#btnExportAll').onclick = () =>
    downloadText(Store.exportUser(), `asher-${(Store.currentProfile()?.name || 'me').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  $('#btnImportAll').onclick = () => $('#fileImport').click();
  $('#fileImport').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      Store.importUser(await file.text());
      renderAll(); renderProviders(); renderDataTab(); fillPrefs();
      toast('Backup restored.');
    } catch (err) { toast(err.message); }
    e.target.value = '';
  };

  $('#btnExportLogs').onclick = () =>
    downloadText(Store.exportLogs(), `asher-log-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  $('#btnClearLogs').onclick = () => {
    if (!confirm('Clear your activity log? Chats and memory stay.')) return;
    Store.clearLogs(); renderLogs(); toast('Log cleared.');
  };

  $('#btnDeleteProfile').onclick = () => {
    const p = Store.currentProfile();
    if (!p) return;
    if (!confirm(`Delete "${p.name}" — every chat, every memory, every log? This cannot be undone.`)) return;
    if (!confirm('Really? There is no backup unless you exported one.')) return;
    Store.deleteProfile(p.id);
    location.reload();
  };

  $('#btnInstall').onclick = async () => {
    const ev = Onboarding.promptInstall();
    if (ev) {
      ev.prompt();
      const { outcome } = await ev.userChoice;
      Onboarding.clearInstallEvent();
      if (outcome === 'accepted') $('#btnInstall').hidden = true;
      return;
    }
    // No browser prompt on offer — show the steps for whatever they are actually holding.
    Help.open('install');
  };
}

/* ── PWA plumbing ── */
function pwa() {
  window.addEventListener('appinstalled', () => {
    $('#btnInstall').hidden = true;
    toast('Installed. Open it from your home screen from now on.');
  });
  if (!Onboarding.standalone) $('#btnInstall').hidden = false;

  const syncOnline = () => { $('#offlineBar').hidden = navigator.onLine; };
  window.addEventListener('online', () => { syncOnline(); toast('Back online.'); });
  window.addEventListener('offline', syncOnline);
  syncOnline();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          const fresh = reg.installing;
          fresh?.addEventListener('statechange', () => {
            if (fresh.state === 'installed' && navigator.serviceWorker.controller) {
              toast('New version ready — reopen ASK to load it.', 5000);
            }
          });
        });
      }).catch(err => console.warn('[sw] registration failed', err));
    });
  }

  // Keep the composer above the on-screen keyboard.
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const fit = () => {
      const hidden = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--kb', hidden + 'px');
      if (hidden > 120) $('#stream').scrollTop = $('#stream').scrollHeight;
    };
    vv.addEventListener('resize', fit);
    vv.addEventListener('scroll', fit);
  }
}

/* ── boot ── */
function fillSelects() {
  $('#imgSize').innerHTML = Images.SIZES.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
  $('#imgSize').value = '1024x1024';
}

function startFor({ profile, answers, fresh }) {
  renderProfileChip();
  if (!Store.get().sessions.length) Store.newSession();
  fillPrefs();
  renderAll();
  autosize();

  const params = new URLSearchParams(location.search);
  if (params.get('new') === '1') { Store.newSession(); renderAll(); }
  if (params.toString()) history.replaceState(null, '', location.pathname);

  if (fresh) {
    // A brand new profile: say hello properly, using what they just told us.
    if (Providers.chain().length) {
      send(Memory.greetingPrompt(answers || {}), { silent: true, skipPolish: true });
    } else {
      Keys.open({ reason: 'Every model is switched off at the moment.' });
      toast('Turn a model back on and ASK can talk. Images already work.');
    }
  } else if (params.get('action') === 'interview') {
    setTimeout(() => quickAction('interview'), 300);
  } else if (params.get('action') === 'voice') {
    setTimeout(toggleHandsFree, 400);
  } else if (!Providers.chain().length) {
    setTimeout(() => Keys.open({ reason: 'Every model is switched off at the moment.' }), 600);
  }
}

Store.loadApp();
fillSelects();
wire();
pwa();
Onboarding.boot(ctx => {
  Store.updateProfile(ctx.profile.id, { lastSeen: Date.now() });
  startFor(ctx);
});
})();
