/* keys.js — getting a free key, in steps, for someone who has never seen an API key.

   Nothing here fails at anyone. A model refusing is not an error message, it is the start of
   a five-step walkthrough that ends with a working key. The technical detail is still there,
   folded away, for whoever wants it. */
const Keys = (() => {
  const $ = s => document.querySelector(s);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* Everything you can walk someone through, best first. "custom" is last and covers
     anything else that speaks the OpenAI format. */
  const WALKTHROUGH = ['groq', 'openrouter', 'deepseek', 'moonshot', 'ollama', 'custom'];
  const provider = id => Store.providers().find(p => p.id === id);

  /* Opening a link out of an installed app is fussier than it looks. window.open with
     noopener returns null even when it worked, and the attempt spends the tap's user
     activation — so a "did that work?" fallback afterwards is already too late and gets
     blocked. A freshly built anchor, clicked once, is the one thing that reliably opens a
     tab in a browser, an installed PWA and most in-app webviews. Failing everything, the
     address stays on screen to copy by hand. */
  function openLink(url) {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.append(a);
      a.click();
      a.remove();
      return true;
    } catch {
      try { window.open(url, '_blank'); return true; } catch { return false; }
    }
  }

  function linkRow(url) {
    const wrap = el('div', 'link-row');
    const go = el('button', 'btn btn-primary btn-block', `Open ${new URL(url).hostname.replace('www.', '')} ↗`);
    go.onclick = () => openLink(url);
    wrap.append(go);

    const manual = el('div', 'link-manual');
    manual.innerHTML = `<span>Nothing opened? Type this into your browser:</span><code>${esc(url)}</code>`;
    const copy = el('button', 'btn-link', 'copy the address');
    copy.onclick = async () => {
      try { await navigator.clipboard.writeText(url); copy.textContent = 'copied ✓'; }
      catch { copy.textContent = 'select it above and copy'; }
    };
    manual.append(copy);
    wrap.append(manual);
    return wrap;
  }

  let afterSave = null;

  function open({ reason = '', onDone = null } = {}) {
    afterSave = onDone;
    pick(reason);
    $('#keysModal').hidden = false;
  }
  const close = () => { $('#keysModal').hidden = true; };

  /* ── the list ── */
  function pick(reason) {
    const body = $('#keysBody');
    body.innerHTML = '';
    $('#keysTitle').textContent = 'Get your own free key';

    if (reason) body.append(el('div', 'keys-reason', esc(reason)));

    body.append(el('p', 'keys-lede', Store.onStarterKey()
      ? 'ASK is running on a shared key that everybody who opens it uses. That is fine for trying it out, but it gets slow and it runs out. Your own key is free, takes about two minutes, and no card is asked for.'
      : 'You already have your own key in. Add another and ASK will use it as a backup if the first one is busy.'));

    const TIME = { groq: 'about 2 minutes', openrouter: 'about 2 minutes', deepseek: 'about 3 minutes',
                   moonshot: 'about 3 minutes', ollama: 'computer only', custom: 'you bring the details' };

    for (const id of WALKTHROUGH) {
      const p = provider(id);
      if (!p) continue;
      const mine = p.enabled && p.key && p.key !== Store.starterKey();

      const card = el('button', 'keys-card' + (mine ? ' done' : ''));
      card.innerHTML = `
        <span class="keys-card-top">
          <b>${esc(p.friendly || p.name)}</b>
          ${mine ? '<i class="keys-tick">set up ✓</i>' : `<i class="keys-time">${esc(TIME[id] || '')}</i>`}
        </span>
        <span class="keys-card-blurb">${esc(p.blurb || '')}</span>`;
      card.onclick = () => walk(id);
      body.append(card);
    }

    const later = el('button', 'btn btn-ghost btn-block', 'Not now — keep using the shared key');
    later.onclick = () => { Store.markNudged(); close(); };
    body.append(later);

    const advanced = el('button', 'btn-link', 'I know what I am doing — open the full settings');
    advanced.onclick = () => { close(); document.dispatchEvent(new CustomEvent('ask:open-settings', { detail: 'models' })); };
    body.append(advanced);
  }

  /* ── one provider, step by step ── */
  function walk(id) {
    const p = provider(id);
    const body = $('#keysBody');
    body.innerHTML = '';
    $('#keysTitle').textContent = p.friendly || p.name;

    const back = el('button', 'btn-link', '← other options');
    back.onclick = () => pick('');
    body.append(back);

    const steps = el('ol', 'keys-steps');
    (p.steps || [`Open ${p.signup}`, 'Make a key', 'Paste it below']).forEach(s => {
      steps.append(el('li', null, s));
    });
    body.append(steps);

    if (p.signup) body.append(linkRow(p.signup));

    /* "Something else" needs an address and a model name as well as a key. */
    let baseIn = null, modelIn = null;
    if (p.id === 'custom') {
      const bf = el('label', 'field full keys-field');
      bf.append(el('span', null, 'Address it answers on'));
      baseIn = el('input');
      baseIn.placeholder = 'https://…/v1';
      baseIn.value = p.base || '';
      baseIn.spellcheck = false;
      bf.append(baseIn);
      body.append(bf);

      const mf = el('label', 'field full');
      mf.append(el('span', null, 'Model name'));
      modelIn = el('input');
      modelIn.placeholder = 'e.g. llama-3.3-70b';
      modelIn.value = p.model || '';
      modelIn.spellcheck = false;
      mf.append(modelIn);
      body.append(mf);
    }

    const field = el('label', 'field full keys-field');
    field.append(el('span', null, p.id === 'ollama' ? 'Key (leave empty for Ollama)' : 'Paste your key here'));
    const input = el('input');
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = p.id === 'groq' ? 'gsk_…' : (p.id === 'openrouter' ? 'sk-or-…' : (p.id === 'ollama' ? 'not needed' : 'sk-…'));
    field.append(input);
    body.append(field);

    const status = el('p', 'keys-status', '');
    status.hidden = true;
    body.append(status);

    const save = el('button', 'btn btn-primary btn-block', 'Save and check it');
    save.onclick = async () => {
      const key = input.value.trim();
      const needsKey = p.id !== 'ollama';
      if (needsKey && !key) { input.focus(); return; }
      if (baseIn && !baseIn.value.trim()) { baseIn.focus(); return; }
      if (modelIn && !modelIn.value.trim()) { modelIn.focus(); return; }

      save.disabled = true;
      save.textContent = 'Checking…';
      status.hidden = false;
      status.className = 'keys-status';
      status.textContent = 'Trying it out…';

      const previous = { key: p.key, base: p.base, model: p.model };
      p.key = key || (p.id === 'ollama' ? 'ollama' : '');
      if (baseIn) p.base = baseIn.value.trim();
      if (modelIn) p.model = modelIn.value.trim();
      p.enabled = true;
      try {
        await Providers.test(p);
        // their key goes to the front of the queue
        const others = Store.providers().filter(x => x.id !== p.id).sort((a, b) => a.rank - b.rank);
        p.rank = 1;
        others.forEach((x, i) => x.rank = i + 2);
        Store.saveApp();
        Store.log('key.added', `${p.name} key added and working`);
        Store.dismissNudges();

        status.className = 'keys-status ok';
        status.innerHTML = p.id === 'ollama'
          ? `Working. ASK is talking to Ollama on this computer — nothing leaves the machine now.`
          : `Working. ASK is on your own ${esc(p.friendly ? p.name : p.name)} key now — faster, and nobody else is sharing it.`;
        save.textContent = 'Done ✓';
        setTimeout(() => { close(); afterSave?.(); }, 1400);
      } catch (e) {
        Object.assign(p, previous);
        Store.saveApp();
        status.className = 'keys-status bad';
        status.innerHTML = friendlyKeyError(e.message, p);
        save.disabled = false;
        save.textContent = 'Try again';
      }
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') save.click(); });
    body.append(save);

    setTimeout(() => input.focus({ preventScroll: true }), 80);
  }

  /* Provider errors, said the way a person would say them. */
  function friendlyKeyError(msg, p) {
    const m = String(msg).toLowerCase();
    if (/401|unauthor|invalid.*key|no auth/.test(m)) {
      return 'That key was refused. Check you copied the whole thing — they are long, and the copy button on their site is safer than selecting it by hand.';
    }
    if (/402|payment|credit|balance|quota|insufficient/.test(m)) {
      return `The key works, but this account has no credit left. ${esc(p.name)} may need topping up, or try one of the other options.`;
    }
    if (/429|rate/.test(m)) {
      return 'The key works but it is being asked too much right now. Wait a minute and press again.';
    }
    if (/cors|network|failed to fetch|blocked/.test(m)) {
      return 'Could not reach them from this browser. Check you are online — and if you are on a work or school network, it may be blocking them.';
    }
    return `They said: ${esc(msg)}`;
  }

  /* What the chat shows instead of a wall of provider errors. */
  function chatFailure(err) {
    const tried = err.tried || [];
    const wrap = el('div', 'fail-card');

    const starter = Store.onStarterKey();
    wrap.append(el('h4', null, starter ? 'The shared key is busy' : 'No model would answer'));
    wrap.append(el('p', null, starter
      ? 'Everyone using ASK shares one starter key, so it hits its limit sometimes. Your own free key fixes it for good — about two minutes, no card.'
      : 'Every model in your list refused just now. Usually that is a key that ran out, or a connection problem.'));

    const row = el('div', 'fail-actions');
    const fix = el('button', 'btn btn-primary', 'Set up my own key');
    fix.onclick = () => open({ reason: 'Let us get you off the shared key.' });
    row.append(fix);

    const retry = el('button', 'btn', 'Try again');
    retry.onclick = () => document.dispatchEvent(new CustomEvent('ask:retry'));
    row.append(retry);
    wrap.append(row);

    if (tried.length) {
      const toggle = el('button', 'btn-link', 'what exactly went wrong');
      const detail = el('div', 'fail-detail');
      detail.hidden = true;
      detail.innerHTML = tried.map(t => `<div><b>${esc(t.name)}</b> (${esc(t.model)}): ${esc(t.error)}</div>`).join('');
      toggle.onclick = () => { detail.hidden = !detail.hidden; };
      wrap.append(toggle, detail);
    }
    return wrap;
  }

  /* The gentle reminder, shown a few times and then never again. */
  function nudgeCard() {
    const wrap = el('div', 'nudge-card');
    wrap.append(el('b', null, 'You are on the shared key'));
    wrap.append(el('p', null, 'Everyone who opens ASK uses it, so it slows down and runs out. Your own free key takes two minutes and makes ASK noticeably quicker.'));
    const row = el('div', 'fail-actions');
    const go = el('button', 'btn btn-primary sm', 'Show me how');
    go.onclick = () => open({ reason: '' });
    const no = el('button', 'btn btn-ghost sm', 'Not now');
    no.onclick = () => { Store.markNudged(); wrap.remove(); };
    const never = el('button', 'btn-link', 'stop asking');
    never.onclick = () => { Store.dismissNudges(); wrap.remove(); };
    row.append(go, no, never);
    wrap.append(row);
    Store.markNudged();
    return wrap;
  }

  return { open, close, chatFailure, nudgeCard, friendlyKeyError, openLink };
})();
