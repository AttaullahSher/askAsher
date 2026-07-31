#!/usr/bin/env node
/* make-icons.js — builds every PWA icon out of assets/brand/logo.png.
   Run it from the repo root:  node tools/make-icons.js

   No image library involved: zlib does the PNG compression, and the decode, crop, resample
   and rounded-tile compositing are all here. Replace assets/brand/logo.png and re-run to
   rebrand the whole app. */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SRC = path.join(__dirname, '..', 'assets', 'brand', 'logo.png');
const OUT = f => path.join(__dirname, '..', 'assets', 'icons', f);

/* The tile the mark sits on. The artwork is dark-on-light, so the tile stays light.
   The logo's own paper is keyed out against this, which is why no crop edge shows. */
const TILE_TOP = [255, 255, 255];
const TILE_BOTTOM = [240, 246, 252];
const KEY_SOFTNESS = 70;   // how far from the paper colour counts as fully ink

/* ── PNG out ── */
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function writePng(file, w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  console.log(`${path.relative(process.cwd(), file)}  ${w}×${h}  ${(png.length / 1024).toFixed(1)}k`);
}

/* ── PNG in (8-bit, non-interlaced, RGB or RGBA) ── */
function readPng(file) {
  const buf = fs.readFileSync(file);
  if (buf.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('not a PNG');

  let w = 0, h = 0, colorType = 0, depth = 0;
  const idat = [];
  let o = 8;
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.slice(o + 4, o + 8).toString('ascii');
    const data = buf.slice(o + 8, o + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      depth = data[8]; colorType = data[9];
      if (depth !== 8 || (colorType !== 2 && colorType !== 6)) {
        throw new Error(`only 8-bit RGB/RGBA PNGs are supported here (got depth ${depth}, colour type ${colorType})`);
      }
      if (data[12] !== 0) throw new Error('interlaced PNGs are not supported');
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    o += 12 + len;
  }

  const bpp = colorType === 6 ? 4 : 3;
  const stride = w * bpp;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(w * h * 4);
  const line = Buffer.alloc(stride);
  const prev = Buffer.alloc(stride);

  for (let y = 0; y < h; y++) {
    const filter = raw[y * (stride + 1)];
    raw.copy(line, 0, y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);

    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      line[i] = v & 0xFF;
    }

    for (let x = 0; x < w; x++) {
      const s = x * bpp, d = (y * w + x) * 4;
      out[d] = line[s]; out[d + 1] = line[s + 1]; out[d + 2] = line[s + 2];
      out[d + 3] = bpp === 4 ? line[s + 3] : 255;
    }
    line.copy(prev);
  }
  return { w, h, px: out };
}

/* ── working with the artwork ── */
const at = (img, x, y) => {
  const i = (y * img.w + x) * 4;
  return [img.px[i], img.px[i + 1], img.px[i + 2], img.px[i + 3]];
};

const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

/* Where the drawing actually is, ignoring the near-white paper around it. */
function inkBox(img, { top = 0, bottom = 1 } = {}) {
  const bg = at(img, 1, 1);
  let x0 = img.w, y0 = img.h, x1 = -1, y1 = -1;
  const yStart = Math.floor(img.h * top), yEnd = Math.floor(img.h * bottom);
  for (let y = yStart; y < yEnd; y++) {
    for (let x = 0; x < img.w; x++) {
      if (dist(at(img, x, y), bg) < 42) continue;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) throw new Error('found nothing but background in the logo');
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/* Average the source box down to one destination pixel — clean at small sizes. */
function sampleBox(img, sx0, sy0, sx1, sy1) {
  let r = 0, g = 0, b = 0, n = 0;
  const x0 = Math.max(0, Math.floor(sx0)), x1 = Math.min(img.w, Math.ceil(sx1));
  const y0 = Math.max(0, Math.floor(sy0)), y1 = Math.min(img.h, Math.ceil(sy1));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const p = at(img, x, y);
      r += p[0]; g += p[1]; b += p[2]; n++;
    }
  }
  return n ? [r / n, g / n, b / n] : [255, 255, 255];
}

const roundedRect = (x, y, cx, cy, hw, hh, rad) => {
  const dx = Math.abs(x - cx) - (hw - rad);
  const dy = Math.abs(y - cy) - (hh - rad);
  const ox = Math.max(dx, 0), oy = Math.max(dy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(dx, dy), 0) - rad;
};

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

/* Draw one square icon: the crop, fitted inside a rounded tile with room to breathe. */
function tile(img, box, S, { inset = 0.11, radiusPct = 0.22 } = {}) {
  const out = Buffer.alloc(S * S * 4);
  const paper = at(img, 1, 1);
  const pad = S * inset;
  const boxW = S - pad * 2;
  const scale = Math.min(boxW / box.w, boxW / box.h);
  const dw = box.w * scale, dh = box.h * scale;
  const dx = (S - dw) / 2, dy = (S - dh) / 2;
  const step = box.w / dw;                 // source pixels per destination pixel
  const SS = 3, sub = 1 / (SS + 1);

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      // rounded tile, with a touch of vertical shading
      let cover = 0;
      for (let sy = 1; sy <= SS; sy++) {
        for (let sx = 1; sx <= SS; sx++) {
          if (roundedRect(x + sx * sub, y + sy * sub, S / 2, S / 2, S / 2, S / 2, S * radiusPct) < 0) cover++;
        }
      }
      cover /= SS * SS;
      let colour = mix(TILE_TOP, TILE_BOTTOM, y / S);

      // the artwork itself, with its paper faded into the tile
      if (x >= dx && x < dx + dw && y >= dy && y < dy + dh) {
        const sx = box.x + (x - dx) * step;
        const sy = box.y + (y - dy) * step;
        const ink = sampleBox(img, sx, sy, sx + step, sy + step);
        colour = mix(colour, ink, Math.min(1, dist(ink, paper) / KEY_SOFTNESS));
      }

      const i = (y * S + x) * 4;
      out[i] = Math.round(colour[0]);
      out[i + 1] = Math.round(colour[1]);
      out[i + 2] = Math.round(colour[2]);
      out[i + 3] = Math.round(cover * 255);
    }
  }
  return out;
}

/* The social card: the whole lockup on a wide light field. */
function card(img, box, W, H) {
  const out = Buffer.alloc(W * H * 4);
  const paper = at(img, 1, 1);
  const scale = Math.min((W * 0.52) / box.w, (H * 0.66) / box.h);
  const dw = box.w * scale, dh = box.h * scale;
  const dx = (W - dw) / 2, dy = (H - dh) / 2;
  const step = box.w / dw;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let colour = mix(TILE_TOP, TILE_BOTTOM, (x / W) * 0.35 + (y / H) * 0.65);
      if (x >= dx && x < dx + dw && y >= dy && y < dy + dh) {
        const sx = box.x + (x - dx) * step;
        const sy = box.y + (y - dy) * step;
        const ink = sampleBox(img, sx, sy, sx + step, sy + step);
        colour = mix(colour, ink, Math.min(1, dist(ink, paper) / KEY_SOFTNESS));
      }
      const i = (y * W + x) * 4;
      out[i] = Math.round(colour[0]);
      out[i + 1] = Math.round(colour[1]);
      out[i + 2] = Math.round(colour[2]);
      out[i + 3] = 255;
    }
  }
  return out;
}

/* The strongest colour in the mark — handy when retuning the palette to a new logo. */
function dominantInk(img, box) {
  const counts = new Map();
  for (let y = box.y; y < box.y + box.h; y += 2) {
    for (let x = box.x; x < box.x + box.w; x += 2) {
      const [r, g, b] = at(img, x, y);
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (max - min < 60 || max > 245) continue;          // skip greys and paper
      const key = `${r >> 4},${g >> 4},${b >> 4}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!best) return null;
  const [r, g, b] = best[0].split(',').map(v => (Number(v) << 4) + 8);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/* ── go ── */
const img = readPng(SRC);
const full = inkBox(img);                      // mark + wordmark
const mark = inkBox(img, { top: 0, bottom: 0.58 });  // just the A and the speech bubble

console.log(`source ${img.w}×${img.h} · mark ${mark.w}×${mark.h} at ${mark.x},${mark.y} · ink ${dominantInk(img, mark)}`);

writePng(OUT('icon-192.png'), 192, 192, tile(img, mark, 192));
writePng(OUT('icon-512.png'), 512, 512, tile(img, mark, 512));
// Maskable: Android crops to a circle of 40% radius, so the mark sits well inside the safe zone.
writePng(OUT('icon-maskable-512.png'), 512, 512, tile(img, mark, 512, { inset: 0.2, radiusPct: 0.5 }));
// iOS rounds the corners itself, so this one is square to the edge.
writePng(OUT('apple-touch-icon.png'), 180, 180, tile(img, mark, 180, { radiusPct: 0 }));
writePng(OUT('favicon-32.png'), 32, 32, tile(img, mark, 32, { inset: 0.06, radiusPct: 0.24 }));
writePng(OUT('og.png'), 1200, 630, card(img, full, 1200, 630));
