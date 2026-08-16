'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Fires once when an element crosses into view. One-shot on purpose: replaying
 * reveals on every scroll direction change is the fastest way to make a site
 * feel cheap.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string; once?: boolean } = {},
) {
  const { threshold = 0.18, rootMargin = '0px 0px -12% 0px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer (very old browser): show everything on the next frame.
    if (typeof IntersectionObserver === 'undefined') {
      const raf = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) io.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView } as const;
}

/* ---------------------------------------------------------------- media query */

function mediaStore(query: string) {
  let mq: MediaQueryList | null = null;
  const get = () => {
    if (typeof window === 'undefined') return false;
    mq ??= window.matchMedia(query);
    return mq.matches;
  };
  return {
    subscribe(onChange: () => void) {
      if (typeof window === 'undefined') return () => {};
      mq ??= window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq?.removeEventListener('change', onChange);
    },
    get,
  };
}

const reducedMotionStore = mediaStore('(prefers-reduced-motion: reduce)');

/** True when the OS asks for reduced motion. Live-updates if the user changes it. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    reducedMotionStore.subscribe,
    reducedMotionStore.get,
    () => false,
  );
}

/* ------------------------------------------------------------------ device tier */

export type DeviceTier = 'low' | 'mid' | 'high';

/**
 * Coarse device tier used to scale particle counts and canvas resolution.
 * Deliberately crude — the goal is "do less on a cheap phone", not telemetry.
 * Measured once and cached so the snapshot stays referentially stable.
 */
let tierCache: DeviceTier | null = null;

function measureTier(): DeviceTier {
  if (typeof window === 'undefined') return 'mid';
  if (tierCache) return tierCache;

  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const narrow = window.matchMedia('(max-width: 640px)').matches;
  const dpr = window.devicePixelRatio || 1;

  tierCache =
    cores <= 4 || mem <= 3 || (narrow && dpr > 2.5)
      ? 'low'
      : cores >= 8 && mem >= 8 && !narrow
        ? 'high'
        : 'mid';
  return tierCache;
}

const noopSubscribe = () => () => {};

export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(noopSubscribe, measureTier, () => 'mid' as DeviceTier);
}

/* -------------------------------------------------------------------- raf loop */

/** requestAnimationFrame loop that pauses itself when the tab is hidden. */
export function useRafLoop(
  callback: (dt: number, elapsed: number) => void,
  active: boolean = true,
) {
  const cbRef = useRef(callback);

  // Kept in an effect rather than written during render — the loop below always
  // runs after this one, so the first frame already sees the latest callback.
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const start = last;
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      // Clamp so a backgrounded tab does not produce a giant first frame.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      cbRef.current(dt, (now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active]);
}

/* ------------------------------------------------------------------- storage */

/**
 * localStorage-backed state that never throws in a locked-down browser.
 *
 * The stored value is adopted after mount rather than during render: reading
 * storage while rendering would desync the prerendered HTML from the client.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw !== null) setValue(JSON.parse(raw) as T);
      } catch {
        /* private mode, quota, whatever — the default is fine */
      }
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [key],
  );

  return [value, set] as const;
}
