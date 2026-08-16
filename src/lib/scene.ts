'use client';

/**
 * The night-drop atmosphere behind the whole site.
 *
 * Deliberately canvas 2D rather than WebGL. The primary audience arrives from
 * Instagram's in-app browser on a phone; layered 2D parallax hits 60fps on
 * hardware where a shader-based fog volume does not, needs no fallback path,
 * and costs ~6kb instead of ~150kb of runtime. The depth reads the same.
 *
 * Structure, far to near:
 *   sky → stars → moon haze → 3 silhouette ridges → fog bands → airdrop →
 *   ground grid → embers → vignette
 */

export type Tier = 'low' | 'mid' | 'high';

interface Budget {
  dpr: number;
  embers: number;
  fog: number;
  stars: number;
}

const BUDGETS: Record<Tier, Budget> = {
  low: { dpr: 1.25, embers: 16, fog: 9, stars: 34 },
  mid: { dpr: 1.5, embers: 32, fog: 15, stars: 56 },
  high: { dpr: 2, embers: 56, fog: 22, stars: 80 },
};

/** Deterministic PRNG so the skyline is the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
}

/** Dust caught in the light. Slower and paler than an ember. */
interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  phase: number;
}

interface FogPuff {
  x: number;
  y: number;
  scale: number;
  speed: number;
  alpha: number;
  depth: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
}

interface Ridge {
  canvas: HTMLCanvasElement;
  depth: number;
  /** Fraction of viewport height the ridge occupies from the horizon down. */
  base: number;
  alpha: number;
}

export class AtmosphereScene {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private budget: Budget;

  private ridges: Ridge[] = [];
  private fogSprite: HTMLCanvasElement | null = null;
  private puffs: FogPuff[] = [];
  private embers: Ember[] = [];
  private motes: Mote[] = [];
  private stars: Star[] = [];

  /** 0 at the gate, 1 once the camera has finished pushing in. */
  private dolly = 0;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private overdrive = 0;
  private flareT = -1;

  /** Airdrop position in normalised viewport units, updated each frame. */
  private drop = { x: 0.74, y: 0.2, t: 0 };
  private dropHit = { x: 0, y: 0, r: 0 };

  /** Signal flare: fired occasionally, arcs up, burns, falls. */
  private sig = { t: -1, next: 9, x: 0.3, dir: 1 };

  constructor(
    private canvas: HTMLCanvasElement,
    private tier: Tier,
  ) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
    this.budget = BUDGETS[tier];
  }

  /* ------------------------------------------------------------------ setup */

  resize(cssW: number, cssH: number) {
    this.dpr = Math.min(window.devicePixelRatio || 1, this.budget.dpr);
    this.w = cssW;
    this.h = cssH;
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.buildRidges();
    this.buildFog();
    this.buildStars();
    this.buildMotes();
    this.embers = [];
  }

  private get horizon() {
    // Sits low so the sky — and the title standing in it — dominates. Short
    // landscape viewports need it lower still or the skyline crosses the type.
    const landscape = this.w / this.h > 1.3;
    return this.h * (landscape ? 0.8 : 0.74);
  }

  private buildStars() {
    const r = rng(90210);
    const n = this.budget.stars;
    this.stars = Array.from({ length: n }, () => ({
      x: r() * this.w,
      y: r() * this.horizon * 0.92,
      r: 0.4 + r() * 0.9,
      phase: r() * Math.PI * 2,
    }));
  }

  private buildMotes() {
    const r = rng(4242);
    const n = Math.round(this.budget.embers * 0.7);
    this.motes = Array.from({ length: n }, () => ({
      x: r() * this.w,
      y: r() * this.h,
      vx: (r() - 0.5) * 6,
      vy: (r() - 0.5) * 4,
      r: 0.5 + r() * 1.3,
      a: 0.06 + r() * 0.16,
      phase: r() * Math.PI * 2,
    }));
  }

  /**
   * Three procedural industrial ridges, rendered once to offscreen canvases.
   * Silhouettes only — shapes, never assets.
   */
  private buildRidges() {
    const specs = [
      { seed: 7, depth: 0.15, base: 0.075, alpha: 0.5, tall: 0.5 },
      { seed: 31, depth: 0.4, base: 0.115, alpha: 0.72, tall: 0.78 },
      { seed: 77, depth: 0.72, base: 0.17, alpha: 0.94, tall: 1 },
    ];

    this.ridges = specs.map((s) => {
      const w = Math.ceil(this.w * 1.5);
      const h = Math.ceil(this.h * s.base);
      const c = document.createElement('canvas');
      c.width = Math.max(2, Math.round(w * this.dpr));
      c.height = Math.max(2, Math.round(h * this.dpr));
      const g = c.getContext('2d');
      if (!g) return { canvas: c, depth: s.depth, base: s.base, alpha: s.alpha };
      g.scale(this.dpr, this.dpr);
      g.fillStyle = '#000';

      const r = rng(s.seed + 3);
      let x = -40;
      while (x < w + 40) {
        const bw = 30 + r() * (120 * s.tall);
        const bh = (0.18 + r() * 0.82) * h * s.tall;
        const y = h - bh;
        g.fillRect(x, y, bw, bh);

        const roll = r();
        if (roll > 0.86) {
          // Antenna mast with a guy-wire feel.
          const mx = x + bw * (0.3 + r() * 0.4);
          g.fillRect(mx - 0.8, y - bh * 0.55, 1.6, bh * 0.55);
          g.beginPath();
          g.arc(mx, y - bh * 0.55, 1.8, 0, Math.PI * 2);
          g.fill();
        } else if (roll > 0.74) {
          // Cooling stack.
          const cw = bw * 0.22;
          g.fillRect(x + bw * 0.55, y - bh * 0.4, cw, bh * 0.4);
        } else if (roll > 0.64 && s.tall > 0.7) {
          // Gantry crane arm.
          const ay = y - 6;
          g.fillRect(x + bw * 0.4, ay - bh * 0.35, 2.4, bh * 0.35);
          g.fillRect(x + bw * 0.4 - bw * 0.5, ay - bh * 0.35, bw * 1.1, 2.4);
        }
        x += bw + r() * 26;
      }

      // Atmospheric perspective: erase the tops of the distant ridges so they
      // dissolve into the sky instead of stamping flat black rectangles on it.
      {
        const fade = g.createLinearGradient(0, 0, 0, h);
        const strength = 1 - s.depth * 0.72;
        fade.addColorStop(0, `rgba(0,0,0,${0.85 * strength})`);
        fade.addColorStop(0.55, `rgba(0,0,0,${0.3 * strength})`);
        fade.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = fade;
        g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'source-over';
      }

      return { canvas: c, depth: s.depth, base: s.base, alpha: s.alpha };
    });
  }

  /** One soft radial puff, reused for every fog band. */
  private buildFog() {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    if (!g) return;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(112,142,178,0.42)');
    grad.addColorStop(0.45, 'rgba(88,114,148,0.18)');
    grad.addColorStop(1, 'rgba(70,92,124,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    this.fogSprite = c;

    const r = rng(1337);
    this.puffs = Array.from({ length: this.budget.fog }, () => {
      const depth = r();
      return {
        x: r() * (this.w + 400) - 200,
        y: this.horizon - 40 + r() * (this.h - this.horizon + 120),
        scale: (0.5 + r() * 1.5) * (this.w < 720 ? 0.75 : 1),
        speed: (4 + r() * 14) * (r() > 0.5 ? 1 : -1),
        alpha: 0.035 + r() * 0.085,
        depth,
      };
    });
  }

  /* --------------------------------------------------------------- controls */

  setDolly(v: number) {
    this.dolly = Math.max(0, Math.min(1, v));
  }

  setPointer(nx: number, ny: number) {
    this.pointer.tx = nx;
    this.pointer.ty = ny;
  }

  setOverdrive(on: boolean) {
    this.overdrive = on ? 1 : 0;
  }

  /** Screen-space hit test for the airdrop crate easter egg. */
  hitDrop(x: number, y: number): boolean {
    const d = Math.hypot(x - this.dropHit.x, y - this.dropHit.y);
    return d < Math.max(this.dropHit.r, 26);
  }

  flare() {
    this.flareT = 0;
  }

  /* ------------------------------------------------------------------ frame */

  frame(dt: number, t: number) {
    const { w, h } = this;
    if (!w || !h) return;

    // Pointer easing — parallax should lag the finger, never track it exactly.
    this.pointer.x += (this.pointer.tx - this.pointer.x) * Math.min(dt * 3, 1);
    this.pointer.y += (this.pointer.ty - this.pointer.y) * Math.min(dt * 3, 1);
    if (this.flareT >= 0) this.flareT += dt;

    const push = this.dolly;
    const horizon = this.horizon;

    this.drawSky(horizon, push);
    this.drawStars(t, horizon);
    this.drawMoon(horizon, push);
    this.drawRidges(horizon, push);
    this.drawAirdrop(dt, t, horizon, push);
    this.drawFog(dt, push);
    this.drawGround(horizon, push, t);
    this.drawGroundProps(horizon, push);
    this.drawFlare(dt, horizon);
    this.drawEmbers(dt);
    this.drawMotes(dt, t);
    this.drawVignette();
    this.drawGrade();
  }

  private parallax(depth: number, push: number) {
    const amp = 18 + depth * 46;
    return {
      x: -this.pointer.x * amp,
      y: -this.pointer.y * amp * 0.5 + push * depth * 40,
      s: 1 + push * depth * 0.28,
    };
  }

  private drawSky(horizon: number, push: number) {
    const { ctx, w, h } = this;
    const hot = this.overdrive;
    // Faded-stock grade: the blacks are lifted and warmed rather than crushed,
    // which is what makes old film read as old film.
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, hot ? '#0a0704' : '#080a0e');
    g.addColorStop(0.42, hot ? '#150e08' : '#0d1016');
    g.addColorStop(Math.min(0.99, horizon / h), hot ? '#2b1a0b' : '#1a1c1e');
    g.addColorStop(1, hot ? '#160d06' : '#0d0e10');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    void push;
  }

  private drawStars(t: number, horizon: number) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(-this.pointer.x * 10, -this.pointer.y * 6);
    for (const s of this.stars) {
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.7 + s.phase));
      const fade = 1 - s.y / horizon;
      ctx.globalAlpha = tw * 0.55 * Math.max(0.15, fade);
      ctx.fillStyle = '#cfe0f0';
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /** Kept on the opposite side of the frame from the airdrop, so the two
   *  bright points never collide as the visitor scrolls. */
  private drawMoon(horizon: number, push: number) {
    const { ctx, w } = this;
    const cx = w * 0.2 - this.pointer.x * 14;
    const cy = horizon * 0.26 - this.pointer.y * 8 + push * 10;
    const r = Math.max(w, this.h) * 0.5;

    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const tint = this.overdrive ? '255,150,70' : '150,180,215';
    g.addColorStop(0, `rgba(${tint},0.13)`);
    g.addColorStop(0.3, `rgba(${tint},0.04)`);
    g.addColorStop(1, `rgba(${tint},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, this.h);

    // A soft core rather than a hard disc — a flat circle reads as an artefact.
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
    const bright = this.overdrive ? '255,217,176' : '220,232,244';
    core.addColorStop(0, `rgba(${bright},0.19)`);
    core.addColorStop(0.35, `rgba(${bright},0.06)`);
    core.addColorStop(1, `rgba(${bright},0)`);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRidges(horizon: number, push: number) {
    const { ctx, w } = this;
    for (const ridge of this.ridges) {
      const p = this.parallax(ridge.depth, push);
      const dh = this.h * ridge.base * p.s;
      const dw = ridge.canvas.width / this.dpr;
      ctx.save();
      ctx.globalAlpha = ridge.alpha;
      ctx.drawImage(
        ridge.canvas,
        p.x - (dw * p.s - w) / 2,
        horizon - dh + p.y,
        dw * p.s,
        dh,
      );
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  private drawFog(dt: number, push: number) {
    const sprite = this.fogSprite;
    if (!sprite) return;
    const { ctx, w } = this;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const p of this.puffs) {
      p.x += p.speed * dt;
      if (p.x > w + 320) p.x = -320;
      if (p.x < -320) p.x = w + 320;

      const par = this.parallax(0.25 + p.depth * 0.5, push);
      const size = 340 * p.scale * par.s;
      ctx.globalAlpha = p.alpha * (this.overdrive ? 0.75 : 1);
      ctx.drawImage(
        sprite,
        p.x + par.x * 0.4 - size / 2,
        p.y + par.y * 0.3 - size / 2,
        size,
        size,
      );
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /**
   * A supply drop coming down in the distance. Loops slowly, blinks, and is
   * clickable — the first hidden thing on the page.
   */
  private drawAirdrop(dt: number, t: number, horizon: number, push: number) {
    const { ctx, w } = this;
    this.drop.t += dt * 0.012;
    if (this.drop.t > 1) this.drop.t = 0;

    const par = this.parallax(0.3, push);
    const x = w * this.drop.x + Math.sin(t * 0.25) * 12 + par.x * 0.5;
    const y = horizon * (0.18 + this.drop.t * 0.62) + par.y * 0.4;
    const s = 0.85 + push * 0.2;

    this.dropHit = { x, y: y + 14 * s, r: 22 * s };

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    // Canopy
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = '#9fb4c8';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 13, Math.PI * 1.06, Math.PI * 1.94);
    ctx.stroke();
    // Rigging
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(-12, 2);
    ctx.lineTo(-3.5, 12);
    ctx.moveTo(12, 2);
    ctx.lineTo(3.5, 12);
    ctx.stroke();

    // Crate
    ctx.globalAlpha = 0.62;
    ctx.fillStyle = '#0a0f16';
    ctx.strokeStyle = '#8fa4b8';
    ctx.lineWidth = 1;
    ctx.fillRect(-4.5, 12, 9, 7);
    ctx.strokeRect(-4.5, 12, 9, 7);

    // Beacon — the thing that catches the eye
    const blink = Math.sin(t * 3.2) > 0.55;
    const flare = this.flareT >= 0 && this.flareT < 1.6 ? 1 - this.flareT / 1.6 : 0;
    if (blink || flare > 0) {
      const a = Math.max(blink ? 0.9 : 0, flare);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ff5a46';
      ctx.beginPath();
      ctx.arc(0, 15.5, 1.6 + flare * 3, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createRadialGradient(0, 15.5, 0, 0, 15.5, 30 + flare * 90);
      g.addColorStop(0, `rgba(255,90,70,${0.35 * a})`);
      g.addColorStop(1, 'rgba(255,90,70,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 15.5, 30 + flare * 90, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    // A flare throws embers into the scene.
    if (this.flareT >= 0 && this.flareT < 0.08) {
      for (let i = 0; i < 14; i += 1) this.spawnEmber(x, y + 14, true);
    }
  }

  /**
   * Ground furniture — supply crates and a run of chain-link. Original shapes,
   * silhouette only; the genre is the reference, never the assets.
   */
  private drawGroundProps(horizon: number, push: number) {
    const { ctx, w, h } = this;
    const depth = h - horizon;
    if (depth <= 0) return;

    const r = rng(515);
    ctx.save();
    ctx.fillStyle = this.overdrive ? '#0d0803' : '#05070b';
    ctx.strokeStyle = this.overdrive
      ? 'rgba(255,170,90,0.16)'
      : 'rgba(150,180,210,0.12)';
    ctx.lineWidth = 1;

    // Crates scattered along the plate, larger as they come forward.
    const count = this.w < 720 ? 3 : 5;
    for (let i = 0; i < count; i += 1) {
      // Kept well clear of the horizon — a crate level with the skyline reads
      // as a floating box, not as something sitting on the ground.
      const k = 0.34 + r() * 0.5;
      const cy = horizon + depth * k * k * (1 + push * 0.1);
      const scale = (0.35 + k * 1.5) * (1 + push * 0.2);
      const cw = 26 * scale;
      const ch = 17 * scale;
      const cx = r() * (w + 160) - 80 - this.pointer.x * (14 + k * 40);

      ctx.globalAlpha = 0.85;
      ctx.fillRect(cx, cy - ch, cw, ch);
      // A single lit edge, so it reads as a solid object catching the moon
      // rather than as an outlined shape.
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - ch);
      ctx.lineTo(cx + cw, cy - ch);
      ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /**
   * A signal flare somewhere out past the skyline. The one genuinely loud
   * thing in the frame, which is why it happens roughly twice a minute rather
   * than constantly — scarcity is what makes anyone look up.
   */
  private drawFlare(dt: number, horizon: number) {
    const { ctx, w } = this;

    if (this.sig.t < 0) {
      this.sig.next -= dt;
      if (this.sig.next <= 0) {
        this.sig.t = 0;
        this.sig.x = 0.12 + Math.random() * 0.76;
        this.sig.dir = Math.random() > 0.5 ? 1 : -1;
      }
      return;
    }

    this.sig.t += dt;
    const life = 6.5;
    if (this.sig.t > life) {
      this.sig.t = -1;
      this.sig.next = 22 + Math.random() * 26;
      return;
    }

    const k = this.sig.t / life;
    // Up fast, hang, then drift down under its own canopy.
    const rise = 1 - Math.pow(1 - Math.min(k / 0.28, 1), 3);
    const fall = k < 0.28 ? 0 : Math.pow((k - 0.28) / 0.72, 1.7);
    const x = w * this.sig.x + this.sig.dir * (18 + fall * 60);
    const y = horizon * (0.94 - rise * 0.68 + fall * 0.5);

    // Fades in over the climb and out over the last third.
    const alpha = Math.min(k / 0.08, 1) * (k > 0.72 ? 1 - (k - 0.72) / 0.28 : 1);
    const hot = this.overdrive;
    const rgb = hot ? '255,190,90' : '255,110,60';

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Smoke trail hanging behind the climb.
    ctx.globalAlpha = alpha * 0.1;
    ctx.strokeStyle = `rgba(${rgb},1)`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(w * this.sig.x, horizon * 0.94);
    ctx.stroke();

    // Halo.
    const g = ctx.createRadialGradient(x, y, 0, x, y, 90);
    g.addColorStop(0, `rgba(${rgb},${0.5 * alpha})`);
    g.addColorStop(0.3, `rgba(${rgb},${0.14 * alpha})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 90, 0, Math.PI * 2);
    ctx.fill();

    // The burning point itself, guttering.
    ctx.globalAlpha = alpha * (0.75 + Math.random() * 0.25);
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private drawMotes(dt: number, t: number) {
    const { ctx, w, h } = this;
    ctx.save();
    for (const m of this.motes) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.x < -10) m.x = w + 10;
      if (m.x > w + 10) m.x = -10;
      if (m.y < -10) m.y = h + 10;
      if (m.y > h + 10) m.y = -10;

      const tw = 0.55 + 0.45 * Math.sin(t * 0.9 + m.phase);
      ctx.globalAlpha = m.a * tw;
      ctx.fillStyle = this.overdrive ? '#ffd9b0' : '#cfd9e4';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /** A warm, faded wash over everything — the last step, like a print grade. */
  private drawGrade() {
    const { ctx, w, h } = this;
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, this.overdrive ? 'rgba(255,150,70,0.10)' : 'rgba(150,126,92,0.055)');
    g.addColorStop(0.6, 'rgba(120,104,84,0.03)');
    g.addColorStop(1, this.overdrive ? 'rgba(255,170,90,0.09)' : 'rgba(162,132,96,0.07)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Lift the blacks — warm and slight. A neutral lift at any real strength
    // just reads as haze and takes the contrast with it.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = this.overdrive ? 'rgba(22,11,4,0.34)' : 'rgba(13,10,7,0.26)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private drawGround(horizon: number, push: number, t: number) {
    const { ctx, w, h } = this;
    const depth = h - horizon;
    if (depth <= 0) return;

    ctx.save();
    ctx.strokeStyle = this.overdrive ? 'rgba(255,150,70,0.16)' : 'rgba(140,175,210,0.11)';
    ctx.lineWidth = 1;

    // Receding horizontals: dense at the horizon, sparse at the feet.
    const rows = 11;
    for (let i = 1; i <= rows; i += 1) {
      const k = i / rows;
      const y = horizon + depth * k * k * (1 + push * 0.12);
      ctx.globalAlpha = 0.05 + k * 0.32;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Converging verticals toward a vanishing point that drifts with the pointer.
    const vx = w / 2 - this.pointer.x * 60;
    const cols = 13;
    for (let i = 0; i <= cols; i += 1) {
      const k = i / cols - 0.5;
      ctx.globalAlpha = 0.26 * (1 - Math.abs(k) * 1.1);
      ctx.beginPath();
      ctx.moveTo(vx + k * w * 0.35, horizon);
      ctx.lineTo(vx + k * w * 3.4, h);
      ctx.stroke();
    }

    // A slow scan sweeping over the plate — one moving element, no more.
    // Feathered at both ends so it reads as light, not as a seam.
    const span = 150;
    const sweepY = horizon + ((t * 22) % (depth + span)) - span * 0.5;
    const g = ctx.createLinearGradient(0, sweepY - span, 0, sweepY + span * 0.25);
    const c = this.overdrive ? '255,138,31' : '143,196,232';
    g.addColorStop(0, `rgba(${c},0)`);
    g.addColorStop(0.72, `rgba(${c},0.035)`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, sweepY - span, w, span * 1.25);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private spawnEmber(x?: number, y?: number, hot = false) {
    this.embers.push({
      x: x ?? Math.random() * this.w,
      y: y ?? this.h * (0.75 + Math.random() * 0.35),
      vx: (Math.random() - 0.5) * (hot ? 34 : 9),
      vy: -(hot ? 30 + Math.random() * 60 : 8 + Math.random() * 22),
      r: 0.6 + Math.random() * 1.5,
      life: 0,
      max: hot ? 1.4 + Math.random() : 4 + Math.random() * 5,
    });
  }

  private drawEmbers(dt: number) {
    const { ctx } = this;
    while (this.embers.length < this.budget.embers) this.spawnEmber();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = this.embers.length - 1; i >= 0; i -= 1) {
      const e = this.embers[i];
      if (!e) continue;
      e.life += dt;
      if (e.life > e.max || e.y < -20) {
        this.embers.splice(i, 1);
        continue;
      }
      e.x += (e.vx + Math.sin(e.life * 1.6 + e.x * 0.01) * 6) * dt;
      e.y += e.vy * dt;
      e.vy *= 1 - dt * 0.28;

      const k = 1 - e.life / e.max;
      ctx.globalAlpha = Math.min(1, k * 0.85);
      ctx.fillStyle = this.overdrive ? '#ffb35c' : '#ff9a45';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private drawVignette() {
    const { ctx, w, h } = this;
    const g = ctx.createRadialGradient(
      w / 2,
      h * 0.48,
      Math.min(w, h) * 0.28,
      w / 2,
      h * 0.5,
      Math.max(w, h) * 0.78,
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0.82)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  /** One static, fully-composed frame for reduced-motion visitors. */
  still() {
    this.setDolly(1);
    this.frame(0, 2.2);
  }

  get deviceTier(): Tier {
    return this.tier;
  }
}
