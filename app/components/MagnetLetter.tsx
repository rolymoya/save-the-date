'use client';

import { CSSProperties } from 'react';

// Color mapping matching the reference fridge magnet alphabet image
const LETTER_COLORS: Record<string, string> = {
  A: '#f5c518', B: '#2a3fb5', C: '#2db643', D: '#e8272a', E: '#29c4dc',
  F: '#d42a8a', G: '#2a3fb5', H: '#29c4dc', I: '#e8272a', J: '#d42a8a',
  K: '#29c4dc', L: '#2a3fb5', M: '#d42a8a', N: '#f5c518', O: '#2a3fb5',
  P: '#2db643', Q: '#f5c518', R: '#d42a8a', S: '#2a3fb5', T: '#2db643',
  U: '#e8272a', V: '#29c4dc', W: '#e8272a', X: '#f5c518', Y: '#2db643',
  Z: '#d42a8a', '!': '#2db643', '?': '#2a3fb5',
};

const FALLBACK_COLORS = ['#e8272a', '#2a3fb5', '#2db643', '#f5c518', '#29c4dc', '#d42a8a'];

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function lighten(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
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
  const lightColor = lighten(baseColor, 50);
  const darkColor = darken(baseColor, 50);
  const depthPx = Math.max(2, size * 0.04);
  const shadowBlur = size * 0.06;
  const strokeWidth = Math.max(0.5, size * 0.015);

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
        // Gradient from light (top) to dark (bottom) for plastic body
        background: `linear-gradient(175deg, ${lightColor} 0%, ${baseColor} 40%, ${darkColor} 100%)`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        // Lighter stroke creates the plastic edge shine
        WebkitTextStroke: `${strokeWidth}px ${lighten(baseColor, 30)}`,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        filter: `drop-shadow(0 ${depthPx}px 0 ${darken(baseColor, 70)}) drop-shadow(0 ${depthPx * 2}px ${shadowBlur}px rgba(0,0,0,0.3))`,
        fontFamily: 'var(--font-fredoka), system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        userSelect: 'none',
        ...style,
      }}
    >
      {letter}
      {/* Specular highlight — concentrated white gloss on top-left */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 30%, transparent 50%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          WebkitTextStroke: `${strokeWidth}px transparent`,
          filter: 'none',
          pointerEvents: 'none',
        }}
      >
        {letter}
      </span>
    </span>
  );
}
