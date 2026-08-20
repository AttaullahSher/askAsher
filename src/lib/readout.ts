'use client';

/**
 * What this page can read off you without asking.
 *
 * The SECURITY sector used to end with a hundred words of the author
 * explaining his own restraint. This replaces it: the same argument, made on
 * the reader's own device, in about four milliseconds, and then dropped.
 *
 * ---
 *
 * **The rules this file lives under. None of them are negotiable.**
 *
 * 1. **Read-only.** Nothing here is transmitted, and nothing is written —
 *    no `localStorage`, no cookie, no retained fingerprint hash. Every value
 *    exists inside one React render and dies with it. The page says it kept
 *    nothing because it kept nothing; if that ever stops being true, this
 *    whole section has to come out, because the claim is the entire point.
 *
 * 2. **No permission is ever requested.** Nothing in here touches geolocation,
 *    the camera, the microphone, the clipboard, contacts, or any other API
 *    that raises a dialog. If a value needs consent to read, it does not
 *    belong on this page — a section about being watched without your
 *    knowledge cannot open by asking your permission.
 *
 * 3. **Nothing is ever faked.** Every field is feature-detected and an
 *    unavailable one is simply absent from the list. A readout that invents a
 *    line to look impressive is the same sin as the counter that seeded itself
 *    at 257, and a reader who catches one invented value correctly stops
 *    believing the other nine.
 *
 * Everything below is a value the browser hands to every site you open,
 * unprompted, before a single line of the page has rendered. That is the
 * unsettling part, and it does not need any help from me.
 */

export interface ReadoutLine {
  /** Short label, rendered in the HUD face. */
  k: string;
  /** The value read off this device. */
  v: string;
  /**
   * Marks a line most people do not expect a web page to know. Rendered in the
   * accent colour rather than in bone.
   */
  sting?: boolean;
}

/* ------------------------------------------------------------------ helpers */

const has = (o: unknown, key: string): boolean =>
  typeof o === 'object' && o !== null && key in o;

/** Crude on purpose. A precise UA parser would be a dependency and a lie. */
function deviceName(ua: string): string | null {
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android phone';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac';
  if (/Windows NT/i.test(ua)) return 'Windows PC';
  if (/Linux/i.test(ua)) return 'Linux machine';
  return null;
}

/**
 * The in-app browsers. This is the line that lands hardest, because most
 * people genuinely do not think of the Instagram viewer as a browser at all —
 * and it is where the majority of this site's traffic arrives from.
 */
function browserContext(ua: string): ReadoutLine | null {
  if (/Instagram/i.test(ua)) {
    return { k: 'Not a browser', v: 'You opened this inside Instagram', sting: true };
  }
  if (/FBAN|FBAV/i.test(ua)) {
    return { k: 'Not a browser', v: 'You opened this inside Facebook', sting: true };
  }
  if (/Line\//i.test(ua)) {
    return { k: 'Not a browser', v: 'You opened this inside LINE', sting: true };
  }
  if (/Edg\//i.test(ua)) return { k: 'Browser', v: 'Edge' };
  if (/OPR\//i.test(ua)) return { k: 'Browser', v: 'Opera' };
  if (/Firefox\//i.test(ua)) return { k: 'Browser', v: 'Firefox' };
  if (/Chrome\//i.test(ua)) return { k: 'Browser', v: 'Chrome' };
  if (/Safari\//i.test(ua)) return { k: 'Browser', v: 'Safari' };
  return null;
}

/** `Asia/Karachi` → `Karachi`. The city, from a value nobody thinks of as one. */
function placeFromZone(zone: string): string | null {
  const tail = zone.split('/').pop();
  if (!tail || tail === zone) return null;
  return tail.replace(/_/g, ' ');
}

/* -------------------------------------------------------------------- reads */

/**
 * The snapshot. Safe to call during a client render; returns an empty list on
 * the server so the prerendered HTML and the first client paint agree.
 */
export function readVisitor(): ReadoutLine[] {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return [];

  const lines: ReadoutLine[] = [];
  const nav = navigator;
  const ua = nav.userAgent ?? '';

  // --- time and place, from a setting nobody thinks of as either -------------
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone) {
      const now = new Date();
      lines.push({
        k: 'Your clock',
        v: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      const place = placeFromZone(zone);
      if (place) lines.push({ k: 'Which puts you near', v: place, sting: true });
      else lines.push({ k: 'Timezone', v: zone });
    }
  } catch {
    /* Intl unavailable — the line is simply absent */
  }

  // --- who, roughly ---------------------------------------------------------
  const langs = nav.languages?.length ? [...nav.languages] : nav.language ? [nav.language] : [];
  if (langs.length > 0) {
    lines.push({ k: 'Reads', v: langs.slice(0, 3).join(' · ') });
  }

  // --- what you are holding -------------------------------------------------
  const device = deviceName(ua);
  if (device) lines.push({ k: 'In your hand', v: device });

  const ctx = browserContext(ua);
  if (ctx) lines.push(ctx);

  if (typeof screen !== 'undefined' && screen.width && screen.height) {
    const dpr = window.devicePixelRatio || 1;
    lines.push({
      k: 'Screen',
      v: `${screen.width} × ${screen.height}${dpr !== 1 ? ` @ ${dpr.toFixed(1)}×` : ''}`,
    });
  }

  const cores = nav.hardwareConcurrency;
  if (typeof cores === 'number' && cores > 0) {
    lines.push({ k: 'Processors', v: `${cores}` });
  }

  // deviceMemory is Chromium-only and deliberately coarse. Absent elsewhere.
  if (has(nav, 'deviceMemory')) {
    const mem = (nav as Navigator & { deviceMemory?: number }).deviceMemory;
    if (typeof mem === 'number' && mem > 0) {
      lines.push({ k: 'Memory', v: `about ${mem} GB` });
    }
  }

  // --- how you got here -----------------------------------------------------
  if (has(nav, 'connection')) {
    const conn = (nav as Navigator & {
      connection?: { effectiveType?: string; downlink?: number };
    }).connection;
    if (conn?.effectiveType) {
      const speed = typeof conn.downlink === 'number' ? ` · ${conn.downlink} Mbps` : '';
      lines.push({ k: 'Connection', v: `${conn.effectiveType.toUpperCase()}${speed}` });
    }
  }

  // --- preferences you set months ago and forgot ----------------------------
  try {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    lines.push({ k: 'Input', v: coarse ? 'Touch' : 'Mouse and keyboard' });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lines.push({ k: 'You asked for', v: 'Less movement. This page listened' });
    }
  } catch {
    /* matchMedia unavailable */
  }

  return lines;
}

/**
 * Battery, read separately because the API is a promise — and because it is
 * gone from Firefox and Safari entirely. Resolves to `null` wherever it is not
 * available, and the line is then simply never rendered.
 */
export async function readBattery(): Promise<ReadoutLine | null> {
  if (typeof navigator === 'undefined' || !has(navigator, 'getBattery')) return null;
  try {
    const get = (navigator as Navigator & {
      getBattery?: () => Promise<{ level: number; charging: boolean }>;
    }).getBattery;
    if (!get) return null;
    const b = await get.call(navigator);
    if (typeof b?.level !== 'number') return null;
    const pct = Math.round(b.level * 100);
    return {
      k: 'Your battery',
      v: `${pct}%${b.charging ? ' · charging' : ''}`,
      sting: true,
    };
  } catch {
    return null;
  }
}

/**
 * How long they have been here. Live rather than snapshotted, because a number
 * that visibly moves while you read it is doing something no static line can.
 */
export function dwellLine(sinceMs: number): ReadoutLine {
  const s = Math.max(0, Math.round((Date.now() - sinceMs) / 1000));
  const v = s < 60 ? `${s} seconds` : `${Math.floor(s / 60)}m ${s % 60}s`;
  return { k: 'On this page', v };
}
