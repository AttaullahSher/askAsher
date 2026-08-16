/**
 * Generates the favicon set and the Open Graph card from SVG sources.
 *
 * Run with `npm run assets`. Output is committed, so a normal build and a
 * normal deploy never need sharp or a network round trip.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const VOID = '#04060a';
const SIGNAL = '#ff8a1f';
const BONE = '#e8eaed';

/**
 * The mark: a stencilled A built from three strokes — two legs and a crossbar
 * that overshoots on the right, so it reads as a chevron/waypoint at 16px and
 * as a letter at 512px.
 */
function markSvg(size, { bleed = 0.16 } = {}) {
  const s = size;
  const inset = s * bleed;
  const w = s - inset * 2;
  const stroke = Math.max(1, w * 0.145);
  const top = inset + w * 0.06;
  const bottom = inset + w * 0.94;
  const cx = s / 2;
  const spread = w * 0.36;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="${VOID}"/>
  <g fill="none" stroke="${BONE}" stroke-width="${stroke}" stroke-linecap="square">
    <path d="M ${cx - spread} ${bottom} L ${cx} ${top} L ${cx + spread} ${bottom}"/>
  </g>
  <rect x="${cx - spread * 0.58}" y="${inset + w * 0.605}" width="${spread * 1.5}" height="${stroke * 0.74}" fill="${SIGNAL}"/>
</svg>`;
}

/** The share card. Deliberately simple: it is read at thumbnail size. */
function ogSvg() {
  const W = 1200;
  const H = 630;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#03050a"/>
      <stop offset="0.55" stop-color="#0b1420"/>
      <stop offset="1" stop-color="#05080e"/>
    </linearGradient>
    <radialGradient id="moon" cx="0.78" cy="0.22" r="0.6">
      <stop offset="0" stop-color="#96b4d7" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#96b4d7" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ember" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${SIGNAL}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${SIGNAL}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.4" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.72"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#moon)"/>

  <!-- skyline -->
  <g fill="#04070c" opacity="0.95">
    ${skyline(W, H)}
  </g>

  <!-- ground haze -->
  <ellipse cx="600" cy="470" rx="620" ry="120" fill="url(#ember)" opacity="0.5"/>

  <!-- receding grid -->
  <g stroke="#8fc4e8" stroke-opacity="0.09" stroke-width="1">
    ${Array.from({ length: 9 }, (_, i) => {
      const k = (i + 1) / 9;
      const y = 430 + 200 * k * k;
      return `<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}"/>`;
    }).join('\n    ')}
    ${Array.from({ length: 13 }, (_, i) => {
      const k = i / 12 - 0.5;
      return `<line x1="${(600 + k * 420).toFixed(1)}" y1="430" x2="${(600 + k * 2600).toFixed(1)}" y2="${H}"/>`;
    }).join('\n    ')}
  </g>

  <rect width="${W}" height="${H}" fill="url(#vig)"/>

  <!-- type -->
  <text x="600" y="330" text-anchor="middle"
        font-family="Archivo, 'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        font-size="196" font-weight="800" letter-spacing="12" fill="${BONE}">ASHER</text>

  <text x="600" y="392" text-anchor="middle"
        font-family="'JetBrains Mono', 'DejaVu Sans Mono', monospace"
        font-size="23" letter-spacing="11" fill="#8a949f">CODE · CREATE · AUTOMATE · PLAY</text>

  <rect x="536" y="424" width="128" height="2" fill="${SIGNAL}"/>

  <text x="600" y="480" text-anchor="middle"
        font-family="'JetBrains Mono', 'DejaVu Sans Mono', monospace"
        font-size="17" letter-spacing="3" fill="#5d6874">an interactive introduction</text>

  <!-- corner ticks -->
  <g stroke="#3a4655" stroke-width="2" fill="none">
    <path d="M46 46 h34 M46 46 v34"/>
    <path d="M1154 46 h-34 M1154 46 v34"/>
    <path d="M46 584 h34 M46 584 v-34"/>
    <path d="M1154 584 h-34 M1154 584 v-34"/>
  </g>
</svg>`;
}

/** Deterministic skyline so re-running the script does not churn the file. */
function skyline(W, H) {
  let s = 20240914;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const base = H * 0.72;
  const out = [];
  let x = -40;
  while (x < W + 40) {
    const bw = 34 + rnd() * 128;
    const bh = 30 + rnd() * 190;
    out.push(`<rect x="${x.toFixed(0)}" y="${(base - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}"/>`);
    if (rnd() > 0.8) {
      out.push(
        `<rect x="${(x + bw * 0.4).toFixed(0)}" y="${(base - bh - 58).toFixed(0)}" width="4" height="58"/>`,
      );
    }
    x += bw + rnd() * 26;
  }
  return out.join('\n    ');
}

async function png(svg, size, file) {
  await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
  console.log('·', file.replace(root + '/', ''));
}

async function main() {
  await mkdir(join(pub, 'icons'), { recursive: true });

  await writeFile(join(pub, 'icons', 'mark.svg'), markSvg(512));

  await png(markSvg(512), 32, join(pub, 'icons', 'favicon-32.png'));
  await png(markSvg(512), 180, join(pub, 'icons', 'apple-touch-icon.png'));
  await png(markSvg(512), 192, join(pub, 'icons', 'icon-192.png'));
  await png(markSvg(512), 512, join(pub, 'icons', 'icon-512.png'));
  await png(markSvg(512, { bleed: 0.26 }), 512, join(pub, 'icons', 'icon-maskable-512.png'));

  await sharp(Buffer.from(ogSvg()))
    .png({ compressionLevel: 9 })
    .toFile(join(pub, 'og.png'));
  console.log('· public/og.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
