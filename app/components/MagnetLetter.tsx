'use client';

import { CSSProperties } from 'react';

// Color mapping matching the reference fridge magnet alphabet image
const LETTER_COLORS: Record<string, string> = {
  A: '#ffcf00', B: '#3355ff', C: '#00a83e', D: '#00ddf0', E: '#00ddf0',
  F: '#ff2da0', G: '#3355ff', H: '#ff2030', I: '#ff2030', J: '#ff2da0',
  K: '#00ddf0', L: '#3355ff', M: '#ff2da0', N: '#ffcf00', O: '#3355ff',
  P: '#3355ff', Q: '#ffcf00', R: '#ff2da0', S: '#3355ff', T: '#00a83e',
  U: '#ff2030', V: '#00ddf0', W: '#ff2030', X: '#ffcf00', Y: '#00a83e',
  Z: '#ff2da0', '!': '#00a83e', '?': '#3355ff',
};

const FALLBACK_COLORS = ['#ff2030', '#3355ff', '#00a83e', '#ffcf00', '#00ddf0', '#ff2da0'];

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function getLetterColor(char: string): string {
  const upper = char.toUpperCase();
  if (LETTER_COLORS[upper]) return LETTER_COLORS[upper];
  return FALLBACK_COLORS[upper.charCodeAt(0) % FALLBACK_COLORS.length];
}

export function MagnetLetter({
  char,
  color,
  size = 80,
  rotation = 0,
  className = '',
  style,
}: {
  char: string;
  color?: string;
  size?: number;
  rotation?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const letter = char.toUpperCase();
  const baseColor = color || getLetterColor(letter);
  const edgeColor = darken(baseColor, 55);
  const depthPx = Math.max(1, size * 0.04);
  const steps = Math.max(3, Math.round(depthPx / 0.5));

  // Build layered text-shadow for thick 3D extrusion (down and slightly right)
  const extrusion: string[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = depthPx * 0.3 * t;
    const y = depthPx * t;
    extrusion.push(`${x}px ${y}px 0 ${edgeColor}`);
  }
  // Soft drop shadow behind everything
  extrusion.push(`${depthPx * 0.5}px ${depthPx * 2}px ${depthPx * 2}px rgba(0,0,0,0.25)`);

  return (
    <span
      className={`magnet-letter ${className}`}
      data-letter={letter}
      style={{
        display: 'inline-block',
        position: 'relative',
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1,
        color: baseColor,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        textShadow: extrusion.join(', '),
        fontFamily: 'var(--font-fredoka), system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        userSelect: 'none',
        ...style,
      }}
    >
      {letter}
    </span>
  );
}
