'use client';

import { asset } from './paths';
import { audio as audioConfig } from '@/content/site';

/**
 * Ambient sound for the experience.
 *
 * Two paths, chosen by `audio.track` in `content/site.ts`:
 *
 *   1. A file, if one is configured. If it will not play, we fall through.
 *   2. Otherwise a cinematic drone synthesised in the browser with the Web
 *      Audio API. Original by construction, zero bytes shipped, no licensing
 *      question to answer.
 *
 * Configured rather than probed on purpose: guessing would mean a request for a
 * file that usually is not there, and a 404 in everybody's console.
 *
 * Nothing ever autoplays. Everything starts from the entry gesture.
 */

const MASTER_LEVEL = 0.13;

type Status = 'idle' | 'running' | 'suspended';

export class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private element: HTMLAudioElement | null = null;
  private nodes: AudioScheduledSourceNode[] = [];
  private pulseTimer: number | null = null;
  private windTimer: number | null = null;
  private lowpass: BiquadFilterNode | null = null;
  private hasFile: boolean | null = null;
  private status: Status = 'idle';

  /** Warms the decision so `start()` never stalls on the first gesture. */
  async prepare(): Promise<void> {
    this.hasFile = Boolean(audioConfig.track);
  }

  get isRunning(): boolean {
    return this.status === 'running';
  }

  async start(): Promise<void> {
    if (this.status === 'running') return;

    if (this.status === 'suspended') {
      await this.resume();
      return;
    }

    if (this.hasFile === null) await this.prepare();

    if (this.hasFile && audioConfig.track) {
      this.startFile();
    } else {
      this.startSynth();
    }
    this.status = 'running';
  }

  private startFile() {
    const el = new Audio(asset(audioConfig.track ?? ''));
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0;
    this.element = el;
    void el.play().catch(() => {
      // Autoplay policy or a corrupt file — fall back rather than go silent.
      this.element = null;
      this.startSynth();
    });
    this.fadeElement(0.45, 2600);
  }

  private fadeElement(to: number, ms: number) {
    const el = this.element;
    if (!el) return;
    const from = el.volume;
    const t0 = performance.now();
    const step = () => {
      if (!this.element) return;
      const k = Math.min((performance.now() - t0) / ms, 1);
      el.volume = from + (to - from) * k;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------------ synth */

  private startSynth() {
    type Ctor = typeof AudioContext;
    const Ctx: Ctor | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(MASTER_LEVEL, ctx.currentTime + 3.5);
    master.connect(ctx.destination);
    this.master = master;

    // --- sub: three near-unison sines an octave lower than before, beating
    // slowly against each other. This is the floor the whole thing sits on.
    for (const f of [36.7, 36.95, 55]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.value = f < 40 ? 0.62 : 0.34;
      o.connect(g).connect(master);
      o.start();
      this.nodes.push(o);
    }

    // --- pad: detuned saws through a slowly swept lowpass (A minor)
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    lp.Q.value = 3;
    lp.connect(master);
    this.lowpass = lp;

    const padGain = ctx.createGain();
    padGain.gain.value = 0.055;
    padGain.connect(lp);

    // Minor second stacked under the fifth — the interval that will not settle.
    for (const [freq, detune] of [
      [110, -7],
      [164.81, 5],
      [233.08, -4],
      [246.94, 6],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      o.detune.value = detune;
      o.connect(padGain);
      o.start();
      this.nodes.push(o);
    }

    // LFO on the cutoff — this is what stops it sounding like a test tone.
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.031;
    lfoDepth.gain.value = 190;
    lfo.connect(lfoDepth).connect(lp.frequency);
    lfo.start();
    this.nodes.push(lfo);

    // --- wind: band-passed noise with a slow random walk on its level
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoise(ctx, 3);
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 620;
    bp.Q.value = 0.6;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.026;
    noise.connect(bp).connect(windGain).connect(master);
    noise.start();
    this.nodes.push(noise);

    this.windTimer = window.setInterval(() => {
      if (!this.ctx) return;
      const target = 0.012 + Math.random() * 0.03;
      windGain.gain.setTargetAtTime(target, this.ctx.currentTime, 2.2);
      bp.frequency.setTargetAtTime(520 + Math.random() * 620, this.ctx.currentTime, 3);
    }, 4200);

    // --- metal: a sparse, far-off struck tone. The one thing in the mix with
    // a transient, so the ear keeps waiting for the next one.
    const strike = () => {
      if (!this.ctx || !this.master) return;
      const t = this.ctx.currentTime;
      const bp2 = this.ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.frequency.value = 1400 + Math.random() * 1400;
      bp2.Q.value = 12;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      const src = this.ctx.createBufferSource();
      src.buffer = makeNoise(this.ctx, 0.4);
      src.connect(bp2).connect(g).connect(this.master);
      src.start(t);
      src.stop(t + 2.7);
    };

    // --- pulse: a two-beat heartbeat rather than a single thump, and it
    // tightens as it goes. Tension without a melody to get bored of.
    let beat = 0;
    const schedulePulse = () => {
      if (!this.ctx || !this.master) return;
      const t = this.ctx.currentTime;

      const thump = (at: number, level: number) => {
        if (!this.ctx || !this.master) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(64, at);
        o.frequency.exponentialRampToValueAtTime(30, at + 0.55);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(level, at + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 1.3);
        o.connect(g).connect(this.master);
        o.start(at);
        o.stop(at + 1.4);
      };

      thump(t, 0.3);
      thump(t + 0.34, 0.18);

      beat += 1;
      if (beat % 3 === 0) strike();
      if (this.lowpass) {
        // Breathe the pad open on every fourth beat.
        const open = beat % 4 === 0;
        this.lowpass.frequency.setTargetAtTime(open ? 520 : 300, t, 1.6);
      }
    };

    schedulePulse();
    this.pulseTimer = window.setInterval(schedulePulse, 4600);
  }

  /* ---------------------------------------------------------------- control */

  async resume(): Promise<void> {
    if (this.ctx) {
      await this.ctx.resume().catch(() => {});
      if (this.master) {
        this.master.gain.setTargetAtTime(MASTER_LEVEL, this.ctx.currentTime, 0.6);
      }
    }
    if (this.element) {
      await this.element.play().catch(() => {});
      this.fadeElement(0.45, 900);
    }
    this.status = 'running';
  }

  suspend(): void {
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.35);
      window.setTimeout(() => this.ctx?.suspend().catch(() => {}), 700);
    }
    if (this.element) {
      this.fadeElement(0, 500);
      window.setTimeout(() => this.element?.pause(), 550);
    }
    if (this.status === 'running') this.status = 'suspended';
  }

  /** Overdrive opens the filter and leans on the pad. */
  setIntensity(hot: boolean): void {
    if (!this.ctx || !this.lowpass) return;
    this.lowpass.frequency.setTargetAtTime(hot ? 900 : 320, this.ctx.currentTime, 1.2);
  }

  dispose(): void {
    if (this.pulseTimer) window.clearInterval(this.pulseTimer);
    if (this.windTimer) window.clearInterval(this.windTimer);
    for (const n of this.nodes) {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
    }
    this.nodes = [];
    this.element?.pause();
    this.element = null;
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.master = null;
    this.status = 'idle';
  }
}

function makeNoise(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  // Brownish noise — softer and less hissy than white.
  let last = 0;
  for (let i = 0; i < len; i += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  return buf;
}

let singleton: Ambient | null = null;

export function getAmbient(): Ambient {
  if (!singleton) singleton = new Ambient();
  return singleton;
}
