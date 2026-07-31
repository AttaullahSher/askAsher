/* voice.js — talking and listening.

   Speaking uses the browser's own speech synthesis: no key, no upload, works on Android,
   iOS, Windows and Mac. Listening uses the browser's speech recognition where it exists
   (Chrome, Edge, Safari), and can instead record a clip and send it to Whisper through any
   OpenAI-compatible /audio/transcriptions endpoint when the person has a key for one.

   Hands-free mode strings the two together: listen → send → speak the reply → listen again,
   until it is switched off. */
const Voice = (() => {

  const synth = window.speechSynthesis || null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const canSpeak = () => !!synth;
  const canListen = () => !!SR || canRecord();
  const canRecord = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

  /* iOS only lets a page speak after a real tap, and only once it has been "unlocked". */
  let unlocked = false;
  function unlock() {
    if (unlocked || !synth) return;
    try {
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      synth.speak(u);
      unlocked = true;
    } catch { /* nothing to do */ }
  }

  /* ── voices ── */
  let voices = [];
  function loadVoices() {
    if (!synth) return [];
    voices = synth.getVoices() || [];
    return voices;
  }
  if (synth) {
    loadVoices();
    synth.addEventListener?.('voiceschanged', loadVoices);
  }
  const list = () => (voices.length ? voices : loadVoices());

  const LANG_HINT = {
    English: 'en', 'English + Urdu mix': 'en', Urdu: 'ur', Pashto: 'ps',
    Arabic: 'ar', Hindi: 'hi', Other: ''
  };

  function preferredLang() {
    const hint = LANG_HINT[Store.prefs().language];
    return hint || (navigator.language || 'en').slice(0, 2);
  }

  /* Two good ones for this device and language, so nobody has to read a list of forty.
     The first is the warmest-sounding local voice, the second the clearest fallback. */
  function shortlist() {
    const lang = preferredLang();
    const all = list().filter(v => v.lang?.toLowerCase().startsWith(lang));
    const pool = all.length ? all : list();
    if (!pool.length) return [];

    const nice = /google|natural|neural|siri|samantha|karen|daniel|aria|enhanced|premium/i;
    const sorted = [...pool].sort((a, b) => (nice.test(b.name) ? 1 : 0) - (nice.test(a.name) ? 1 : 0));
    const two = sorted.slice(0, 2);
    return two.map(v => ({ name: v.name, label: v.name.replace(/^(Microsoft|Google|Apple)\s+/i, '').slice(0, 28) }));
  }

  function pickVoice() {
    const all = list();
    if (!all.length) return null;
    const wanted = Store.prefs().voiceName;
    if (wanted) {
      const hit = all.find(v => v.name === wanted);
      if (hit) return hit;
    }
    const lang = preferredLang();
    return all.find(v => v.lang?.toLowerCase().startsWith(lang))
        || all.find(v => v.default)
        || all[0];
  }

  /* ── speaking ── */
  let speaking = false;
  const listeners = new Set();
  const emit = ev => listeners.forEach(fn => fn(ev));
  const onChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };

  /* Strip the things that sound terrible read aloud. */
  function forSpeech(md) {
    return String(md)
      .replace(/```[\s\S]*?```/g, ' — code block, look at the screen for it — ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' — image — ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`#>]/g, '')
      .replace(/^\s*[-•]\s+/gm, ', ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000);
  }

  function speak(text, { onEnd } = {}) {
    if (!synth) return false;
    const clean = forSpeech(text);
    if (!clean) return false;
    stopSpeaking();

    const p = Store.prefs();
    const u = new SpeechSynthesisUtterance(clean);
    const v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang; }
    else u.lang = preferredLang();
    u.rate = Number(p.voiceRate) || 1;
    u.pitch = Number(p.voicePitch) || 1;

    u.onstart = () => { speaking = true; emit({ type: 'speak-start' }); };
    u.onend = () => { speaking = false; emit({ type: 'speak-end' }); onEnd?.(); };
    u.onerror = () => { speaking = false; emit({ type: 'speak-end' }); onEnd?.(); };

    // Chrome drops long utterances that were queued while paused.
    synth.resume();
    synth.speak(u);
    return true;
  }

  function stopSpeaking() {
    if (!synth) return;
    try { synth.cancel(); } catch {}
    if (speaking) { speaking = false; emit({ type: 'speak-end' }); }
  }
  const isSpeaking = () => speaking;

  /* ── listening: the browser's own recogniser ── */
  let recog = null;
  let listening = false;
  let handlers = {};

  function startBrowserSTT({ onPartial, onFinal, onError }) {
    if (!SR) { onError?.(new Error('This browser has no speech recognition. Try Chrome, Edge or Safari.')); return false; }
    stopListening();

    recog = new SR();
    recog.lang = navigator.language || 'en-US';
    const hint = LANG_HINT[Store.prefs().language];
    if (hint === 'ur') recog.lang = 'ur-PK';
    else if (hint === 'ar') recog.lang = 'ar-AE';
    else if (hint === 'hi') recog.lang = 'hi-IN';
    recog.interimResults = true;
    recog.continuous = false;
    recog.maxAlternatives = 1;

    let finalText = '';
    recog.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk;
        else interim += chunk;
      }
      onPartial?.((finalText + ' ' + interim).trim());
    };
    recog.onerror = e => {
      listening = false;
      emit({ type: 'listen-end' });
      const map = {
        'not-allowed': 'Microphone permission was refused. Allow it in the browser\'s site settings.',
        'service-not-allowed': 'The browser blocked speech recognition on this page.',
        'no-speech': 'Did not catch anything.',
        'audio-capture': 'No microphone found.',
        'network': 'Speech recognition needs a connection and could not reach the service.'
      };
      onError?.(new Error(map[e.error] || `Speech recognition failed (${e.error}).`));
    };
    recog.onend = () => {
      listening = false;
      emit({ type: 'listen-end' });
      onFinal?.(finalText.trim());
    };

    try {
      recog.start();
      listening = true;
      emit({ type: 'listen-start' });
      return true;
    } catch (e) {
      onError?.(new Error('Could not start the microphone.'));
      return false;
    }
  }

  /* ── listening: record a clip, send it to Whisper ── */
  let recorder = null;
  let chunks = [];

  async function startWhisperSTT({ onFinal, onError, onState }) {
    if (!canRecord()) { onError?.(new Error('This browser cannot record audio.')); return false; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        listening = false;
        emit({ type: 'listen-end' });
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        chunks = [];
        if (blob.size < 1200) return onFinal?.('');
        onState?.('transcribing');
        try {
          const { text, provider } = await Providers.transcribe(blob);
          Store.log('voice.transcribe', `${provider.name} · ${text.slice(0, 80)}`);
          onFinal?.(text);
        } catch (e) {
          onError?.(new Error(e.friendly || e.message));
        }
      };
      recorder.start();
      listening = true;
      emit({ type: 'listen-start' });
      return true;
    } catch (e) {
      onError?.(new Error('Microphone permission was refused.'));
      return false;
    }
  }

  function startListening(opts = {}) {
    handlers = opts;
    unlock();
    const mode = Store.prefs().sttMode || 'browser';
    if (mode === 'whisper' && Providers.sttProvider()) return startWhisperSTT(opts);
    if (SR) return startBrowserSTT(opts);
    if (canRecord() && Providers.sttProvider()) return startWhisperSTT(opts);
    opts.onError?.(new Error('No way to listen here — this browser has no speech recognition, and Whisper needs a Groq key.'));
    return false;
  }

  function stopListening() {
    if (recog) { try { recog.stop(); } catch {} recog = null; }
    if (recorder && recorder.state === 'recording') { try { recorder.stop(); } catch {} }
    recorder = null;
  }

  const isListening = () => listening;

  /* ── hands-free ── */
  let handsFree = false;
  let loop = {};

  function startHandsFree({ onPartial, onTranscript, onError, onState }) {
    handsFree = true;
    loop = { onPartial, onTranscript, onError, onState };
    emit({ type: 'handsfree', on: true });
    listenTurn();
  }

  function listenTurn() {
    if (!handsFree) return;
    loop.onState?.('listening');
    startListening({
      onPartial: loop.onPartial,
      onFinal: text => {
        if (!handsFree) return;
        if (!text) { loop.onState?.('idle'); return listenTurn(); }
        loop.onTranscript?.(text);
      },
      onError: e => {
        if (!handsFree) return loop.onError?.(e);
        // "no speech" just means silence — go round again rather than nagging.
        if (/did not catch/i.test(e.message)) return setTimeout(listenTurn, 400);
        stopHandsFree();
        loop.onError?.(e);
      },
      onState: loop.onState
    });
  }

  /* Called by the app once a reply is on screen: read it, then listen again. */
  function handsFreeReply(text) {
    if (!handsFree) return;
    loop.onState?.('speaking');
    const started = speak(text, { onEnd: () => setTimeout(listenTurn, 250) });
    if (!started) setTimeout(listenTurn, 250);
  }

  function stopHandsFree() {
    handsFree = false;
    stopListening();
    stopSpeaking();
    loop.onState?.('off');
    emit({ type: 'handsfree', on: false });
  }

  const isHandsFree = () => handsFree;

  return {
    canSpeak, canListen, canRecord, unlock, list, shortlist, pickVoice,
    speak, stopSpeaking, isSpeaking,
    startListening, stopListening, isListening,
    startHandsFree, stopHandsFree, handsFreeReply, isHandsFree,
    onChange, forSpeech
  };
})();
