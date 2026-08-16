'use client';

import { useEffect, useRef } from 'react';
import { AtmosphereScene } from '@/lib/scene';
import { useDeviceTier, useRafLoop } from '@/lib/hooks';
import { useExperience } from '@/lib/experience';

/**
 * Fixed, full-viewport backdrop. Mounted once and never unmounted, so the
 * scene survives every section transition without a reflow.
 */
export function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<AtmosphereScene | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const dollyRef = useRef(0);
  const tier = useDeviceTier();
  const { entered, motion, overdrive, markFound } = useExperience();

  const animated = motion === 'full';

  // Build / rebuild the scene when the device tier settles or motion changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene: AtmosphereScene;
    try {
      scene = new AtmosphereScene(canvas, tier);
    } catch {
      return; // No 2D context — the CSS gradient underneath carries the page.
    }
    sceneRef.current = scene;

    const resize = () => {
      scene.resize(window.innerWidth, window.innerHeight);
      if (!animated) scene.still();
    };
    resize();

    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(resize);
    };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      cancelAnimationFrame(raf);
      sceneRef.current = null;
    };
  }, [tier, animated]);

  useEffect(() => {
    sceneRef.current?.setOverdrive(overdrive);
    if (!animated) sceneRef.current?.still();
  }, [overdrive, animated]);

  // Pointer parallax on desktop only — on touch it fights the scroll.
  useEffect(() => {
    if (!animated) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;

    const onMove = (e: PointerEvent) => {
      sceneRef.current?.setPointer(
        (e.clientX / window.innerWidth - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [animated]);

  /**
   * The drop zone belongs to the opening, not to the whole page. As the visitor
   * descends, a scrim brings it down to a trace — otherwise the skyline sits
   * behind every heading and each sector reads as text pasted over a photo.
   */
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const k = Math.min(1, window.scrollY / (window.innerHeight * 0.8));
      // Eased so the scene fades away rather than dimming linearly.
      const eased = k * k * (3 - 2 * k);
      if (scrimRef.current) scrimRef.current.style.opacity = (eased * 0.88).toFixed(3);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // The crate. Clicking it is the first secret.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: PointerEvent) => {
      const scene = sceneRef.current;
      // Only while the drop zone is actually on screen — once the scrim is up
      // there is nothing there to click.
      if (window.scrollY > window.innerHeight * 0.5) return;
      if (!scene || !scene.hitDrop(e.clientX, e.clientY)) return;
      scene.flare();
      markFound('supply');
      window.dispatchEvent(new CustomEvent('asher:supply'));
    };

    // Listens on the window so the canvas can stay pointer-events:none.
    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => window.removeEventListener('pointerdown', onDown);
  }, [markFound]);

  // Camera push-in: eases toward 1 once the visitor has entered.
  useRafLoop(
    (dt, t) => {
      const scene = sceneRef.current;
      if (!scene) return;
      const target = entered ? 1 : 0;
      dollyRef.current += (target - dollyRef.current) * Math.min(dt * 0.55, 1);
      scene.setDolly(dollyRef.current);
      scene.frame(dt, t);
    },
    animated,
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        // Visible before the canvas paints, and the whole backdrop if 2D fails.
        background:
          'radial-gradient(120% 80% at 78% 22%, #131d2b 0%, #070c14 45%, #04060a 100%)',
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div
        ref={scrimRef}
        className="absolute inset-0"
        style={{ background: 'var(--color-void)', opacity: 0, willChange: 'opacity' }}
      />
      <div className="grain" />
    </div>
  );
}
