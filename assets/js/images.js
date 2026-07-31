/* images.js — image generation with no key required, plus a canvas compositor for banners.
   Pollinations serves several open image models over a plain GET, so this works the moment
   the page loads. If the chosen model stalls or 404s, it retries down a fallback list. */
const Images = (() => {

  const ACCENT = '#4DA9F5';
  const INK = '14,20,28';

  const MODELS = [
    { id: 'flux',      label: 'Flux',           blurb: 'The all-rounder. Best first choice.' },
    { id: 'turbo',     label: 'Turbo',          blurb: 'Fastest, a little rougher.' },
    { id: 'kontext',   label: 'Kontext',        blurb: 'Better at text and layout inside the image.' },
    { id: 'nanobanana',label: 'Nano Banana',    blurb: 'Stylised, good for posters and covers.' }
  ];

  const SIZES = [
    { id: '1024x1024', label: 'Square 1:1' },
    { id: '1280x720',  label: 'Wide 16:9' },
    { id: '1080x1350', label: 'Portrait 4:5' },
    { id: '1500x500',  label: 'Banner 3:1' },
    { id: '1200x630',  label: 'Link preview' }
  ];

  let lastCanvas = null;
  let lastMeta = null;

  function url(prompt, { w = 1280, h = 720, seed, model = 'flux' } = {}) {
    const s = seed ?? Math.floor(Math.random() * 1e6);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
           `?width=${w}&height=${h}&seed=${s}&nologo=true&model=${encodeURIComponent(model)}`;
  }

  function loadImage(src, timeout = 75_000) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        img.src = '';
        reject(new Error('the image service took too long'));
      }, timeout);
      img.crossOrigin = 'anonymous';
      img.onload = () => { if (done) return; done = true; clearTimeout(timer); resolve(img); };
      img.onerror = () => { if (done) return; done = true; clearTimeout(timer); reject(new Error('the image service refused that request')); };
      img.src = src;
    });
  }

  /* Try the picked model, then the others, before giving up. */
  async function generate(prompt, opts = {}) {
    const first = opts.model || Store.prefs().imageModel || 'flux';
    const order = [first, ...MODELS.map(m => m.id).filter(m => m !== first)];
    const tried = [];

    for (const model of order) {
      const src = url(prompt, { ...opts, model });
      try {
        const img = await loadImage(src);
        if (model !== first) Store.log('image.fallback', `${first} failed, ${model} drew it instead`);
        return { img, src, model };
      } catch (e) {
        tried.push(`${model}: ${e.message}`);
      }
    }
    throw new Error(`No image model would draw that.\n\n${tried.join('\n')}\n\nTry rewording it, or check you are online.`);
  }

  /* ── canvas helpers ── */
  function wrap(ctx, text, maxWidth) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  /* Plain image, drawn to a canvas so download and banner share one path. */
  async function toCanvas(prompt, opts = {}) {
    const { w, h } = opts;
    const { img, model } = await generate(prompt, opts);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    lastCanvas = canvas;
    lastMeta = { prompt, model, w, h };
    Store.log('image.generate', `${model} · ${w}×${h} · ${prompt.slice(0, 120)}`);
    Store.get().stats.images++;
    Store.save();
    return canvas;
  }

  /* Artwork + headline + sub-line, composited. */
  async function banner({ prompt, w, h, seed, model, headline, sub, pos = 'left', scrim = 0.55 }) {
    const { img, model: used } = await generate(prompt, { w, h, seed, model });
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');

    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

    const pad = Math.round(Math.min(w, h) * 0.075);
    const headSize = Math.round(h * (pos === 'bottom' ? 0.11 : 0.135));
    const subSize = Math.round(headSize * 0.36);

    if (scrim > 0) {
      if (pos === 'bottom') {
        const bandH = h * 0.30;
        const g = ctx.createLinearGradient(0, h - bandH, 0, h);
        g.addColorStop(0, `rgba(${INK},0)`);
        g.addColorStop(1, `rgba(${INK},${Math.min(1, scrim + 0.35)})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, h - bandH, w, bandH);
      } else if (pos === 'center') {
        ctx.fillStyle = `rgba(${INK},${scrim})`;
        ctx.fillRect(0, 0, w, h);
      } else {
        const g = ctx.createLinearGradient(0, 0, w * 0.85, 0);
        g.addColorStop(0, `rgba(${INK},${Math.min(1, scrim + 0.3)})`);
        g.addColorStop(1, `rgba(${INK},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    }

    const maxTextW = pos === 'center' ? w - pad * 2 : w * 0.62;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = pos === 'center' ? 'center' : 'left';
    const x = pos === 'center' ? w / 2 : pad;

    ctx.font = `800 ${headSize}px "Plus Jakarta Sans", Georgia, serif`;
    const headLines = headline ? wrap(ctx, headline, maxTextW) : [];
    ctx.font = `500 ${subSize}px "Public Sans", system-ui, sans-serif`;
    const subLines = sub ? wrap(ctx, sub, maxTextW) : [];

    const headBlock = headLines.length * headSize * 1.08;
    const subBlock = subLines.length * subSize * 1.4;
    const gap = subLines.length ? headSize * 0.42 : 0;
    const total = headBlock + gap + subBlock;

    let y = pos === 'bottom'
      ? h - pad - total + headSize
      : (h - total) / 2 + headSize;

    ctx.shadowColor = 'rgba(0,0,0,.55)';
    ctx.shadowBlur = Math.round(headSize * 0.35);
    ctx.fillStyle = '#F2F7F5';
    ctx.font = `800 ${headSize}px "Plus Jakarta Sans", Georgia, serif`;
    for (const line of headLines) { ctx.fillText(line, x, y); y += headSize * 1.08; }

    if (subLines.length) {
      y += gap;
      ctx.font = `500 ${subSize}px "Public Sans", system-ui, sans-serif`;
      ctx.fillStyle = ACCENT;
      for (const line of subLines) { ctx.fillText(line, x, y); y += subSize * 1.4; }
    }
    ctx.shadowBlur = 0;

    if (pos === 'left' && headLines.length) {
      ctx.fillStyle = ACCENT;
      ctx.fillRect(pad, y + subSize * 0.5, Math.round(w * 0.09), Math.max(2, Math.round(h * 0.006)));
    }

    lastCanvas = canvas;
    lastMeta = { prompt, model: used, w, h, headline };
    Store.log('image.generate', `banner · ${used} · ${w}×${h} · ${headline || prompt.slice(0, 80)}`);
    Store.get().stats.images++;
    Store.save();
    return canvas;
  }

  function download(name) {
    if (!lastCanvas) return;
    const a = document.createElement('a');
    a.download = name || `asher-${Date.now()}.png`;
    a.href = lastCanvas.toDataURL('image/png');
    a.click();
  }

  const dataUrl = () => lastCanvas ? lastCanvas.toDataURL('image/png') : null;
  const meta = () => lastMeta;

  return { generate, toCanvas, banner, download, dataUrl, meta, url, MODELS, SIZES };
})();
