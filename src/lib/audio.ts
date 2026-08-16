'use client';

import { asset } from './paths';
import { audio as audioConfig } from '@/content/site';

/**
 * Music for the experience.
 *
 * Two paths, chosen by `audio.track` in `content/site.ts`:
 *
 *   1. A file, if one is configured. If it will not play, we fall through.
 *   2. Otherwise a cinematic score is synthesised in the browser with the Web
 *      Audio API. Original by construction, zero bytes shipped, no licensing
 *      question to answer.
 *
 * Configured rather than probed on purpose: guessing would mean a request for a
 * file that usually is not there, and a 404 in everybody's console.
 *
 * The synthesised version is written as a trailer cue rather than a drone: a
 * sixteen-second phrase of pulse, riser and impact over a held bed, alternating
 * heavy and light so the loop has somewhere to go. Drama needs a shape — a
 * texture that never resolves just becomes wallpaper.
 *
 * Nothing ever autoplays. Everything starts from the entry gesture.
 */

const MASTER_LEVEL = 0.26;
/** Seconds. One full phrase: build, rise, hit, decay. */
const PHRASE = 16;

type Status = 'idle' | 'running' | 'suspended';

export class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private element: HTMLAudioElement | null = null;
  private nodes: AudioScheduledSourceNode[] = [];
  private timers: number[] = [];
  private lowpass: BiquadFilterNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private phrase = 0;
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

  /* ------------------------------------------------------------------- file */

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

  /* ------------------------------------------------------------------ voices */

  /** A low drum. Pitch drops fast — that fall is what reads as weight. */
  private kick(at: number, level: number, from = 110, to = 34) {
    const ctx = this.ctx;
    const bus = this.bus;
    if (!ctx || !bus) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(from, at);
    o.frequency.exponentialRampToValueAtTime(to, at + 0.16);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(level, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
    o.connect(g).connect(bus);
    o.start(at);
    o.stop(at + 1);
  }

  /** Noise climbing through a bandpass. The three seconds before the hit. */
  private riser(at: number, dur: number) {
    const ctx = this.ctx;
    const bus = this.bus;
    if (!ctx || !bus || !this.noiseBuf) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 4;
    bp.frequency.setValueAtTime(240, at);
    bp.frequency.exponentialRampToValueAtTime(5200, at + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.085, at + dur * 0.92);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.12);
    src.connect(bp).connect(g).connect(bus);
    src.start(at);
    src.stop(at + dur + 0.2);
  }

  /** The hit. Sub drop, a wide noise slam, and a brass-ish stab on top. */
  private impact(at: number) {
    const ctx = this.ctx;
    const bus = this.bus;
    if (!ctx || !bus || !this.noiseBuf) return;

    this.kick(at, 0.62, 150, 26);

    // Slam.
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(4200, at);
    lp.frequency.exponentialRampToValueAtTime(320, at + 1.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.16, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 2.2);
    src.connect(lp).connect(g).connect(bus);
    src.start(at);
    src.stop(at + 2.3);

    // Stab — detuned saws through a fast filter envelope. Reads as brass.
    const sg = ctx.createGain();
    const sf = ctx.createBiquadFilter();
    sf.type = 'lowpass';
    sf.Q.value = 6;
    sf.frequency.setValueAtTime(340, at);
    sf.frequency.exponentialRampToValueAtTime(1900, at + 0.09);
    sf.frequency.exponentialRampToValueAtTime(380, at + 1.5);
    sg.gain.setValueAtTime(0.0001, at);
    sg.gain.exponentialRampToValueAtTime(0.075, at + 0.05);
    sg.gain.exponentialRampToValueAtTime(0.0001, at + 1.9);
    sf.connect(sg).connect(bus);

    for (const [f, d] of [
      [55, -6],
      [82.41, 4],
      [110, -9],
      [164.81, 7],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = d;
      o.connect(sf);
      o.start(at);
      o.stop(at + 2);
    }
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
    this.noiseBuf = makeNoise(ctx, 3);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(MASTER_LEVEL, ctx.currentTime + 3);
    master.connect(ctx.destination);
    this.master = master;

    // Everything goes through a limiter-ish compressor so the impacts have
    // somewhere to land without the bed ducking out of existence.
    const comp = ctx.createDynamicsCompressor();
    // Loose on purpose: tight compression is what turns a trailer hit into a
    // polite bump. This catches the peaks and otherwise stays out of the way.
    comp.threshold.value = -10;
    comp.knee.value = 8;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.006;
    comp.release.value = 0.3;
    comp.connect(master);

    const bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(comp);
    this.bus = bus;

    // --- bed: sub, and a minor-second pad that refuses to settle
    for (const [f, level] of [
      [36.7, 0.5],
      [36.95, 0.42],
      [55, 0.26],
    ] as const) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.value = level;
      o.connect(g).connect(bus);
      o.start();
      this.nodes.push(o);
    }

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 300;
    lp.Q.value = 3;
    lp.connect(bus);
    this.lowpass = lp;

    const pad = ctx.createGain();
    pad.gain.value = 0.05;
    pad.connect(lp);

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
      o.connect(pad);
      o.start();
      this.nodes.push(o);
    }

    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.031;
    lfoDepth.gain.value = 170;
    lfo.connect(lfoDepth).connect(lp.frequency);
    lfo.start();
    this.nodes.push(lfo);

    // --- wind, well under everything
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 620;
    bp.Q.value = 0.6;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.02;
    noise.connect(bp).connect(windGain).connect(bus);
    noise.start();
    this.nodes.push(noise);

    // --- the cue itself, scheduled a phrase at a time
    const runPhrase = () => {
      if (!this.ctx || !this.bus) return;
      const t = this.ctx.currentTime + 0.05;
      const heavy = this.phrase % 2 === 0;
      this.phrase += 1;

      // Pulse: four on the floor, doubling up in the back half of a heavy bar.
      const beat = PHRASE / 8;
      for (let i = 0; i < 8; i += 1) {
        const at = t + i * beat;
        if (i % 2 === 0) this.kick(at, heavy ? 0.34 : 0.2);
        else if (heavy && i > 3) this.kick(at + beat * 0.5, 0.12, 90, 40);
      }

      if (heavy) {
        this.riser(t + PHRASE * 0.55, PHRASE * 0.28);
        this.impact(t + PHRASE * 0.84);
        // Open the pad up into the hit, then let it close again.
        this.lowpass?.frequency.setTargetAtTime(760, t + PHRASE * 0.6, 1.6);
        this.lowpass?.frequency.setTargetAtTime(300, t + PHRASE * 0.9, 2.4);
      }
    };

    runPhrase();
    this.timers.push(window.setInterval(runPhrase, PHRASE * 1000));
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
    this.lowpass.frequency.setTargetAtTime(hot ? 900 : 300, this.ctx.currentTime, 1.2);
  }

  dispose(): void {
    for (const t of this.timers) window.clearInterval(t);
    this.timers = [];
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
    this.bus = null;
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
