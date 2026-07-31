/* onboarding.js — the first thirty seconds.
   Install prompt → make a profile → a handful of questions → one key → straight into a chat
   that already knows who it is talking to. Also handles "who's using it?" on later opens. */
const Onboarding = (() => {
  const gate = () => document.getElementById('gate');
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

  const EMOJI = ['🙂', '🧠', '🎸', '🚀', '🌙', '🐦', '☕', '🦊', '🎧', '🌿', '⚡', '🎯'];

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  let installEvent = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; });
  const canPromptInstall = () => !!installEvent;

  let draft = {};
  let onFinish = () => {};

  /* ── shell ── */
  function show(node) {
    const g = gate();
    g.innerHTML = '';
    const card = el('div', 'gate-card');
    card.append(node);
    g.append(card);
    g.hidden = false;
    document.body.classList.add('gated');
    const first = card.querySelector('input, button:not(.ghost)');
    setTimeout(() => first?.focus({ preventScroll: true }), 60);
  }

  function close() {
    const g = gate();
    g.hidden = true;
    g.innerHTML = '';
    document.body.classList.remove('gated');
  }

  function head(step, total, title, sub) {
    const h = el('div', 'gate-head');
    if (total) {
      const dots = el('div', 'gate-dots');
      for (let i = 1; i <= total; i++) dots.append(el('i', i <= step ? 'on' : ''));
      h.append(dots);
    }
    h.append(el('h2', null, title));
    if (sub) h.append(el('p', 'gate-sub', sub));
    return h;
  }

  const mark = () => `<img class="gate-mark" src="assets/icons/icon-192.png" alt="">`;

  /* ── 1. hello ── */
  function stepWelcome() {
    const n = el('div');
    const brand = el('div', 'gate-brand', `${mark()}<div><strong>ASK</strong><span>your own one, not everyone's</span></div>`);
    n.append(brand);
    n.append(el('p', 'gate-lede', 'ASK is your own assistant, teacher and guide. It asks about you, remembers what matters, explains things one step at a time, talks and listens out loud, and makes images. It works straight away on a free open model — no key, no account — and everything stays in this browser.'));

    const row = el('div', 'gate-actions');
    const go = el('button', 'btn btn-primary btn-block', 'Set me up');
    // Whoever set the device up already answered the install question — don't ask the
    // second and third person on it again.
    const skipInstall = standalone || Store.device().installDismissed || Store.profiles().length > 0;
    go.onclick = () => (skipInstall ? stepProfile() : stepInstall());
    row.append(go);
    n.append(row);

    if (Store.profiles().length) {
      const back = el('button', 'btn btn-ghost btn-block sm', 'I already have a profile here');
      back.onclick = pickProfile;
      n.append(back);
    }
    n.append(el('p', 'credit', 'ASK — programmed by Attaullah Sher'));
    return show(n);
  }

  /* ── 2. install ── */
  function stepInstall() {
    const n = el('div');
    n.append(head(1, 4, 'Put it on your home screen', 'It runs full screen, opens offline, and keeps its own icon. Takes ten seconds and it is the difference between a bookmark and an app.'));

    if (isIOS) {
      const steps = el('ol', 'gate-steps');
      steps.innerHTML = `
        <li>Tap <strong>Share</strong> in the Safari bar — the square with an arrow out of it.</li>
        <li>Scroll down, tap <strong>Add to Home Screen</strong>.</li>
        <li>Tap <strong>Add</strong>. Come back here and carry on.</li>`;
      n.append(steps);
      n.append(el('p', 'gate-note', 'iPhone and iPad have no install button — Safari only offers it from that menu. Chrome on iOS cannot do it at all, so use Safari.'));
    } else if (canPromptInstall()) {
      const b = el('button', 'btn btn-primary btn-block', 'Install ASK');
      b.onclick = async () => {
        installEvent.prompt();
        const { outcome } = await installEvent.userChoice;
        installEvent = null;
        if (outcome === 'accepted') b.textContent = 'Installed ✓';
        b.disabled = true;
      };
      n.append(b);
      n.append(el('p', 'gate-note', 'Nothing downloads from a store. The browser just keeps a copy and gives it an icon.'));
    } else {
      n.append(el('p', 'gate-note', 'Your browser has not offered the install prompt yet. Open the browser menu and look for <strong>Install app</strong> or <strong>Add to Home screen</strong> — or skip this, it works fine as a tab and you can install later from the sidebar.'));
    }

    const row = el('div', 'gate-actions');
    const next = el('button', 'btn btn-primary btn-block', 'Done — next');
    next.onclick = stepProfile;
    const skip = el('button', 'btn btn-ghost btn-block sm ghost', 'Skip for now');
    skip.onclick = () => { Store.device().installDismissed = true; Store.saveApp(); stepProfile(); };
    row.append(next, skip);
    n.append(row);
    return show(n);
  }

  /* ── 3. profile ── */
  function stepProfile() {
    draft = { emoji: EMOJI[0], color: Store.AVATAR_COLORS[Store.profiles().length % Store.AVATAR_COLORS.length] };
    const n = el('div');
    n.append(head(2, 4, 'Who are you?', 'This makes your own space — your chats, your memory, your logs. Anyone else on this device gets their own, and the two never mix.'));

    const nameField = el('label', 'field full');
    nameField.append(el('span', null, 'Your name'));
    const nameIn = el('input');
    nameIn.placeholder = 'What should ASK call you?';
    nameIn.maxLength = 24;
    nameIn.autocomplete = 'given-name';
    nameField.append(nameIn);
    n.append(nameField);

    const picks = el('div', 'pick-row');
    EMOJI.forEach((e, i) => {
      const b = el('button', 'pick' + (i === 0 ? ' on' : ''), e);
      b.type = 'button';
      b.onclick = () => {
        picks.querySelectorAll('.pick').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        draft.emoji = e;
      };
      picks.append(b);
    });
    n.append(el('div', 'field-label', 'Pick a face'));
    n.append(picks);

    const colors = el('div', 'pick-row');
    Store.AVATAR_COLORS.forEach((c, i) => {
      const b = el('button', 'pick swatch' + (i === 0 ? ' on' : ''));
      b.type = 'button';
      b.style.background = c;
      b.onclick = () => {
        colors.querySelectorAll('.pick').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        draft.color = c;
      };
      colors.append(b);
    });
    n.append(el('div', 'field-label', 'And a colour'));
    n.append(colors);

    const pinField = el('label', 'field full');
    pinField.append(el('span', null, 'PIN (optional)'));
    const pinIn = el('input');
    pinIn.type = 'tel';
    pinIn.inputMode = 'numeric';
    pinIn.maxLength = 6;
    pinIn.placeholder = '4 digits, or leave blank';
    pinField.append(pinIn);
    n.append(pinField);
    n.append(el('p', 'gate-note', 'A PIN keeps a housemate out of your chats by accident. It is a latch, not a lock — anyone who can open this browser\'s storage can read around it.'));

    const row = el('div', 'gate-actions');
    const next = el('button', 'btn btn-primary btn-block', 'Continue');
    next.onclick = () => {
      const name = nameIn.value.trim();
      if (!name) { nameIn.focus(); nameIn.classList.add('bad'); return; }
      draft.name = name;
      draft.pin = pinIn.value.replace(/\D/g, '');
      stepQuestions();
    };
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') next.click(); });
    row.append(next);
    n.append(row);
    return show(n);
  }

  /* ── 4. the questions ── */
  const QUESTIONS = [
    { key: 'work',    q: 'What do you actually do?',            hint: 'Job, business, studies — a sentence is plenty.', ph: 'e.g. I run a music shop in Abu Dhabi and handle the online side' },
    { key: 'goal',    q: 'What are you working toward right now?', hint: 'The one thing you would be pleased to have moved by next month. ASK keeps coming back to this.', ph: 'e.g. get the online store bringing in real orders' },
    { key: 'context', q: 'Anything ASK should know from the start?', hint: 'People, projects, constraints, things you are sick of explaining.', ph: 'e.g. two kids, no time before 9pm, I write in English and Urdu' }
  ];

  function stepQuestions(i = 0, answers = {}) {
    if (i >= QUESTIONS.length) return stepStyle(answers);
    const item = QUESTIONS[i];
    const n = el('div');
    n.append(head(3, 4, item.q, item.hint));

    const field = el('label', 'field full');
    const ta = el('textarea');
    ta.rows = 3;
    ta.placeholder = item.ph;
    ta.value = answers[item.key] || '';
    field.append(ta);
    n.append(field);

    const row = el('div', 'gate-actions');
    const next = el('button', 'btn btn-primary btn-block', i === QUESTIONS.length - 1 ? 'Nearly there' : 'Next');
    next.onclick = () => { answers[item.key] = ta.value.trim(); stepQuestions(i + 1, answers); };
    const skip = el('button', 'btn btn-ghost btn-block sm ghost', i === 0 ? 'Skip these' : 'Skip this one');
    skip.onclick = () => {
      if (i === 0) return stepStyle(answers);
      answers[item.key] = '';
      stepQuestions(i + 1, answers);
    };
    row.append(next, skip);
    n.append(row);

    if (i > 0) {
      const back = el('button', 'btn-link', '← back');
      back.onclick = () => stepQuestions(i - 1, answers);
      n.append(back);
    }
    return show(n);
  }

  /* ── 5. how it should talk ── */
  function stepStyle(answers) {
    const n = el('div');
    n.append(head(4, 4, 'How should ASK talk to you?', 'Change it any time in settings. Nothing here is permanent.'));

    const tones = [
      ['warm', 'Warm', 'Like a friend who is good at this'],
      ['direct', 'Direct', 'Answer first, no padding'],
      ['playful', 'Playful', 'Light, a bit cheeky'],
      ['mentor', 'Mentor', 'Pushes back, gives reasons']
    ];
    let tone = 'warm';
    const grid = el('div', 'choice-grid');
    tones.forEach(([id, label, blurb], i) => {
      const b = el('button', 'choice' + (i === 0 ? ' on' : ''), `<strong>${label}</strong><span>${blurb}</span>`);
      b.type = 'button';
      b.onclick = () => {
        grid.querySelectorAll('.choice').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        tone = id;
      };
      grid.append(b);
    });
    n.append(grid);

    const langField = el('label', 'field full');
    langField.append(el('span', null, 'Language you mostly write in'));
    const lang = el('select');
    ['English', 'Urdu', 'Pashto', 'Arabic', 'Hindi', 'English + Urdu mix', 'Other'].forEach(l => {
      const o = el('option', null, l); o.value = l; lang.append(o);
    });
    langField.append(lang);
    n.append(langField);

    const row = el('div', 'gate-actions');
    const done = el('button', 'btn btn-primary btn-block', 'Start talking');
    done.onclick = () => finish(answers, { tone, language: lang.value });
    row.append(done);
    n.append(row);
    return show(n);
  }

  /* ── land it ── */
  function finish(answers, style) {
    const p = Store.createProfile(draft);
    const prefs = Store.prefs();
    prefs.callMe = p.name;
    prefs.tone = style.tone;
    prefs.language = style.language;

    if (answers.work) Store.addMemory(answers.work, 'work', 'onboarding');
    if (answers.context) Store.addMemory(answers.context, 'identity', 'onboarding');
    if (answers.goal) {
      Store.addMemory(answers.goal, 'goals', 'onboarding');
      const g = Store.addGoal(answers.goal, { horizon: 'now', primary: true });
      if (g) Store.updateGoal(g.id, { primary: true });
    }

    const u = Store.get();
    u.onboarded = true;
    Store.save();
    Store.log('profile.ready', `${p.name} finished setup`);

    close();
    onFinish({
      profile: p,
      answers: { name: p.name, ...answers, tone: style.tone, language: style.language },
      fresh: true
    });
  }

  /* ── returning: who is using it? ── */
  function pickProfile() {
    const list = Store.profiles();
    if (!list.length) return stepWelcome();

    const n = el('div');
    n.append(el('div', 'gate-brand', `${mark()}<div><strong>ASK</strong><span>who is this?</span></div>`));

    const rows = el('div', 'profile-rows');
    for (const p of list) {
      const b = el('button', 'profile-row');
      b.innerHTML = `<i class="pav" style="background:${p.color}">${p.emoji}</i>
        <span class="pname">${p.name}</span>
        <span class="pmeta">${p.pin ? 'PIN' : 'open'}</span>`;
      b.onclick = () => (p.pin ? askPin(p) : enter(p));
      rows.append(b);
    }
    n.append(rows);

    const add = el('button', 'btn btn-ghost btn-block sm', '+ Someone else');
    add.onclick = stepWelcome;
    n.append(add);
    return show(n);
  }

  function askPin(p) {
    const n = el('div');
    n.append(el('div', 'gate-brand', `<i class="pav big" style="background:${p.color}">${p.emoji}</i><div><strong>${p.name}</strong><span>enter your PIN</span></div>`));

    const field = el('label', 'field full');
    const input = el('input');
    input.type = 'password';
    input.inputMode = 'numeric';
    input.maxLength = 6;
    input.placeholder = '••••';
    field.append(input);
    n.append(field);

    const err = el('p', 'gate-note bad-note', '');
    err.hidden = true;
    n.append(err);

    const row = el('div', 'gate-actions');
    const go = el('button', 'btn btn-primary btn-block', 'Open');
    go.onclick = () => {
      if (input.value.replace(/\D/g, '') === p.pin) return enter(p);
      err.textContent = 'That is not it. Try again.';
      err.hidden = false;
      input.value = '';
      input.focus();
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
    const back = el('button', 'btn btn-ghost btn-block sm ghost', '← someone else');
    back.onclick = pickProfile;
    row.append(go, back);
    n.append(row);
    return show(n);
  }

  function enter(p) {
    Store.switchProfile(p.id);
    Store.log('profile.open', `${p.name} opened ASK`);
    close();
    onFinish({ profile: p, fresh: false });
  }

  /* Decide what to show when the app opens. */
  function boot(cb) {
    onFinish = cb;
    const list = Store.profiles();
    if (!list.length) return stepWelcome();

    const activeId = Store.getApp().activeProfile;
    const known = list.find(p => p.id === activeId);

    // One person, no PIN, seen recently — do not make them tap anything.
    if (list.length === 1 && !list[0].pin) {
      Store.switchProfile(list[0].id);
      return cb({ profile: list[0], fresh: false });
    }
    if (known && !known.pin && Date.now() - (known.lastSeen || 0) < 12 * 3600_000) {
      Store.switchProfile(known.id);
      return cb({ profile: known, fresh: false });
    }
    return pickProfile();
  }

  return { boot, pickProfile, addProfile: stepWelcome, close, isIOS, standalone, canPromptInstall,
           promptInstall: () => installEvent, clearInstallEvent: () => { installEvent = null; } };
})();
