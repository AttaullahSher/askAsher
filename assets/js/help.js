/* help.js — "how do I…", answered in steps rather than in paragraphs.

   The install instructions are the important ones: Android and iPhone do it completely
   differently, Chrome only offers its own prompt sometimes, and an in-app browser cannot do
   it at all. So ASK works out which of those you are on and shows only that. */
const Help = (() => {
  const $ = s => document.querySelector(s);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  /* Facebook, Instagram and WhatsApp open links in their own browser, which cannot install
     anything. Worth saying out loud, because otherwise the buttons just seem broken. */
  const inAppBrowser = /FBAN|FBAV|Instagram|Line\/|Twitter|WhatsApp|WebView/i.test(ua) ||
                       (/Android/i.test(ua) && /; wv\)/i.test(ua));
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  /* Steps for whichever thing the person is holding. */
  function installSteps() {
    if (standalone) {
      return { title: 'Already installed', steps: ['You are running the installed app right now — it is on your home screen.'] };
    }
    if (inAppBrowser) {
      return {
        title: 'Open this in your real browser first',
        steps: [
          'You opened ASK inside another app (Facebook, Instagram or WhatsApp), and those cannot install anything.',
          'Tap the <b>⋮</b> or <b>…</b> in the corner of this window.',
          'Choose <b>Open in Chrome</b>, <b>Open in browser</b>, or <b>Open in Safari</b>.',
          'Once ASK is in the real browser, come back to this screen and it will show you the install steps.'
        ]
      };
    }
    if (isAndroid) {
      return {
        title: 'Put ASK on your Android home screen',
        steps: [
          'Tap the <b>⋮</b> three dots at the top right of Chrome.',
          'Tap <b>Add to Home screen</b> — on newer phones it says <b>Install app</b>.',
          'A little box appears. Tap <b>Install</b> or <b>Add</b>.',
          'Tap <b>Add automatically</b> if it asks where to put it.',
          'Close Chrome. The ASK icon is now on your home screen with your other apps.'
        ],
        note: 'It opens full screen after that, with no address bar, and it still works when the signal drops.'
      };
    }
    if (isIOS) {
      return {
        title: 'Put ASK on your iPhone home screen',
        steps: [
          isSafari ? 'You are in Safari — good, this only works there.'
                   : 'First open this page in <b>Safari</b>. Chrome on iPhone cannot install apps.',
          'Tap the <b>Share</b> button — the square with an arrow pointing up, at the bottom of the screen.',
          'Scroll down the list and tap <b>Add to Home Screen</b>.',
          'Tap <b>Add</b> at the top right.',
          'Go to your home screen. The ASK icon is there with your other apps.'
        ],
        note: 'iPhone has no install button anywhere — Apple only allows it through that Share menu.'
      };
    }
    return {
      title: 'Install ASK on this computer',
      steps: [
        'Look at the right-hand end of the address bar for a small <b>install</b> icon (a screen with an arrow).',
        'If it is not there, open the browser menu (<b>⋮</b>) and look for <b>Install ASK</b> or <b>Create shortcut</b>.',
        'Confirm, and ASK opens in its own window from then on.'
      ]
    };
  }

  const TOPICS = [
    {
      id: 'install',
      q: 'Put ASK on my home screen',
      build: () => installSteps()
    },
    {
      id: 'key',
      q: 'Make it faster with my own free key',
      build: () => ({
        title: 'Your own key, in two minutes',
        steps: [
          'ASK comes with a shared key that everybody uses, so it slows down and sometimes refuses.',
          'Tap <b>Get a free key</b> in the left panel — or the button below.',
          'Pick one of the services. Groq is the quickest to set up.',
          'It walks you through signing in, making the key, and pasting it back here.',
          'ASK tests it before saving. Once it is green, you are on your own allowance.'
        ],
        action: { label: 'Show me the key setup', run: () => { close(); Keys.open({ reason: '' }); } }
      })
    },
    {
      id: 'voice',
      q: 'Talk to it instead of typing',
      build: () => ({
        title: 'Talking and listening',
        steps: [
          'Tap the <b>microphone</b> next to the message box and just talk. It types what you say and sends it.',
          'Under any answer, tap <b>Read aloud</b> to hear it.',
          'Tap <b>Voice chat</b> under the message box for hands-free: it listens, answers out loud, then listens again.',
          'Tap <b>Stop</b> in the blue bar to end it.'
        ],
        note: 'On iPhone this has to be Safari, and the first tap on Read aloud is what wakes the voice up.'
      })
    },
    {
      id: 'image',
      q: 'Make a picture or a banner',
      build: () => ({
        title: 'Pictures',
        steps: [
          'Tap the <b>picture button</b> on the left of the message box.',
          'Describe what you want — plain words are fine, it tidies them up for you.',
          'Pick a shape. Press <b>Generate</b> and wait a few seconds.',
          'Press <b>Download PNG</b> to save it, or <b>Put it in the chat</b> to keep it in the conversation.',
          'For a banner with words on it, use <b>Make a banner</b> above the message box instead.'
        ],
        note: 'Pictures need no key at all. The service is free and busy, so if it refuses, press Generate again.'
      })
    },
    {
      id: 'people',
      q: 'Let someone else use this phone',
      build: () => ({
        title: 'More than one person',
        steps: [
          'Tap your name at the bottom of the left panel.',
          'Tap <b>+ Someone else</b> and let them set themselves up.',
          'They get their own chats, their own memory and their own log. Yours stay private to you.',
          'Tap your name again any time to switch back.'
        ],
        note: 'A PIN keeps a housemate out by accident. It is a latch, not a lock — do not treat it as security.'
      })
    },
    {
      id: 'memory',
      q: 'Change or delete what it remembers',
      build: () => ({
        title: 'What it knows about you',
        steps: [
          'Open the right-hand panel — on a phone, the <b>◐</b> button at the top right.',
          'Everything it has learned is listed there, grouped.',
          'Tap the <b>✕</b> on anything you would rather it forgot. That is permanent.',
          'The <b>⋯</b> at the top of that panel clears the lot.'
        ]
      })
    }
  ];

  function open(topicId) {
    render(topicId);
    $('#helpModal').hidden = false;
  }
  const close = () => { $('#helpModal').hidden = true; };

  function render(topicId) {
    const body = $('#helpBody');
    body.innerHTML = '';

    if (!topicId) {
      $('#helpTitle').textContent = 'How do I…';
      for (const t of TOPICS) {
        const b = el('button', 'help-row', `<span>${esc(t.q)}</span><i>›</i>`);
        b.onclick = () => render(t.id);
        body.append(b);
      }
      const credit = el('p', 'credit', 'ASK — programmed by Attaullah Sher');
      body.append(credit);
      return;
    }

    const topic = TOPICS.find(t => t.id === topicId);
    const built = topic.build();
    $('#helpTitle').textContent = built.title;

    const back = el('button', 'btn-link', '← all the how-tos');
    back.onclick = () => render(null);
    body.append(back);

    const ol = el('ol', 'keys-steps');
    built.steps.forEach(s => ol.append(el('li', null, s)));
    body.append(ol);

    if (built.note) body.append(el('p', 'note', built.note));

    if (built.action) {
      const b = el('button', 'btn btn-primary btn-block', built.action.label);
      b.onclick = built.action.run;
      body.append(b);
    }
    const done = el('button', 'btn btn-ghost btn-block', 'Got it');
    done.onclick = close;
    body.append(done);
  }

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return { open, close, installSteps, isAndroid, isIOS, inAppBrowser, standalone };
})();
