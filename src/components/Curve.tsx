'use client';

import type { CSSProperties } from 'react';

/**
 * The curve motif.
 *
 * One continuous line — shoulder, waist, hip, thigh — used as a design
 * language rather than an illustration. It reads as a figure to anyone looking
 * for one and as elegant geometry to everyone else, which is the only version
 * of this idea worth shipping. Abstract on purpose: the moment it becomes
 * anatomical it stops being suggestive and starts being a joke.
 */

/** The silhouette itself. Faint, oversized, used as a watermark. */
export function CurveMark({
  className,
  style,
  flip = false,
  opacity = 0.08,
}: {
  className?: string;
  style?: CSSProperties;
  flip?: boolean;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 120 320"
      fill="none"
      aria-hidden
      className={className}
      style={{ transform: flip ? 'scaleX(-1)' : undefined, ...style }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="curve-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-signal)" stopOpacity="0" />
          <stop offset="0.32" stopColor="var(--color-signal)" stopOpacity="1" />
          <stop offset="0.72" stopColor="var(--color-signal)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--color-signal)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M62 4 C 52 44, 44 74, 52 106 C 62 142, 84 162, 78 204 C 73 244, 64 278, 68 316"
        stroke="url(#curve-fade)"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity={opacity}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M62 4 C 70 44, 76 74, 70 106 C 62 142, 44 162, 50 204 C 55 244, 62 278, 60 316"
        stroke="url(#curve-fade)"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity={opacity * 0.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The same line laid on its side as a rule. Replaces a flat hairline wherever
 * a divider would otherwise be a straight nothing.
 */
export function CurveRule({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 320 24"
      fill="none"
      aria-hidden
      className={className}
      style={style}
      preserveAspectRatio="none"
      height={24}
    >
      <defs>
        <linearGradient id="curve-rule-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--color-steel-500)" stopOpacity="0" />
          <stop offset="0.2" stopColor="var(--color-steel-500)" stopOpacity="0.75" />
          <stop offset="0.5" stopColor="var(--color-signal)" stopOpacity="0.9" />
          <stop offset="0.8" stopColor="var(--color-steel-500)" stopOpacity="0.75" />
          <stop offset="1" stopColor="var(--color-steel-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 12 C 60 12, 88 3, 128 6 C 168 9, 180 20, 216 18 C 252 16, 280 12, 320 12"
        stroke="url(#curve-rule-fade)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
