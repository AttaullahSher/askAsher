#!/usr/bin/env node
/* make-icons.js — draws every PWA icon from scratch, no image library needed.
   Run it from the repo root:  node tools/make-icons.js

   Everything is rasterised with signed-distance functions and 3× supersampling,
   then written out as PNG by hand (zlib does the compression). */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const INK = [11, 17, 23];        // #0B1117
const PANEL = [17, 26, 34];      // #111A22
const ACCENT = [36, 224, 140];   // #24E08C

/* ── PNG writer ── */
function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
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
    raw[y * (w * 4 + 1)] = 0; // no filter
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  console.log(`${file}  ${w}×${h}  ${(png.length / 1024).toFixed(1)}k`);
}

/* ── distance fields ── */
const roundedRect = (x, y, cx, cy, hw, hh, r) => {
  const dx = Math.abs(x - cx) - (hw - r);
  const dy = Math.abs(y - cy) - (hh - r);
  const ox = Math.max(dx, 0), oy = Math.max(dy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(dx, dy), 0) - r;
};

const capsule = (px, py, ax, ay, bx, by, r) => {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy)));
  return Math.hypot(wx - vx * t, wy - vy * t) - r;
};

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

/* The Asher mark: an A with the crossbar carrying through, drawn from three capsules. */
function glyph(px, py, S, inset) {
  const pad = S * inset;
  const box = S - pad * 2;
  const x = v => pad + v * box;
  const y = v => pad + v * box;
  const r = box * 0.075;
  return Math.min(
    capsule(px, py, x(0.16), y(0.90), x(0.50), y(0.10), r),
    capsule(px, py, x(0.50), y(0.10), x(0.84), y(0.90), r),
    capsule(px, py, x(0.30), y(0.64), x(0.70), y(0.64), r * 0.85)
  );
}

function draw(S, { inset = 0.20, bg = true, radiusPct = 0.22, transparent = false } = {}) {
  const buf = Buffer.alloc(S * S * 4);
  const SS = 3, step = 1 / (SS + 1);

  for (let py = 0; py < S; py++) {
    for (let px = 0; px < S; px++) {
      let bgHit = 0, fgHit = 0;
      for (let sy = 1; sy <= SS; sy++) {
        for (let sx = 1; sx <= SS; sx++) {
          const x = px + sx * step, y = py + sy * step;
          if (bg && roundedRect(x, y, S / 2, S / 2, S / 2, S / 2, S * radiusPct) < 0) bgHit++;
          if (glyph(x, y, S, inset) < 0) fgHit++;
        }
      }
      const n = SS * SS;
      const bgA = bgHit / n, fgA = fgHit / n;

      // A soft vertical lift so the tile is not flat.
      const lift = py / S;
      const plate = mix(PANEL, INK, lift);
      let colour = plate;
      let alpha = bg ? bgA : 0;

      if (fgA > 0) {
        colour = mix(colour, ACCENT, fgA);
        alpha = Math.max(alpha, fgA);
      }
      if (transparent && !bg) alpha = fgA;

      const i = (py * S + px) * 4;
      buf[i] = colour[0]; buf[i + 1] = colour[1]; buf[i + 2] = colour[2];
      buf[i + 3] = Math.round(alpha * 255);
    }
  }
  return buf;
}

/* Wide social card: mark on the left, accent rule under it. */
function drawOg(W, H) {
  const buf = Buffer.alloc(W * H * 4);
  const markS = 190;
  const mx = 96, my = H / 2 - markS / 2;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      // background wash
      const t = (px / W) * 0.6 + (py / H) * 0.4;
      let colour = mix(PANEL, INK, t);

      // a soft accent glow top-left
      const g = Math.max(0, 1 - Math.hypot(px - W * 0.12, py + H * 0.1) / (W * 0.55));
      colour = mix(colour, ACCENT, g * g * 0.14);

      // the mark
      const gx = px - mx, gy = py - my;
      if (gx >= 0 && gx < markS && gy >= 0 && gy < markS) {
        if (roundedRect(gx, gy, markS / 2, markS / 2, markS / 2, markS / 2, markS * 0.22) < 0) {
          colour = mix(colour, INK, 0.65);
        }
        if (glyph(gx, gy, markS, 0.2) < 0) colour = ACCENT;
      }

      // accent rule under the mark
      if (py > my + markS + 40 && py < my + markS + 46 && px > mx && px < mx + 120) colour = ACCENT;

      const i = (py * W + px) * 4;
      buf[i] = colour[0]; buf[i + 1] = colour[1]; buf[i + 2] = colour[2]; buf[i + 3] = 255;
    }
  }
  return buf;
}

const out = f => path.join(__dirname, '..', 'assets', 'icons', f);

writePng(out('icon-192.png'), 192, 192, draw(192));
writePng(out('icon-512.png'), 512, 512, draw(512));
// Maskable: the glyph must survive a 40% radius crop, so it sits well inside the safe zone.
writePng(out('icon-maskable-512.png'), 512, 512, draw(512, { inset: 0.30, radiusPct: 0.5 }));
writePng(out('apple-touch-icon.png'), 180, 180, draw(180, { radiusPct: 0.0 }));
writePng(out('favicon-32.png'), 32, 32, draw(32, { inset: 0.16, radiusPct: 0.24 }));
writePng(out('og.png'), 1200, 630, drawOg(1200, 630));
