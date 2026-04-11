'use client';

import { motion } from 'framer-motion';
import { MagnetLetter } from './MagnetLetter';

export type FridgeRect = { left: number; top: number; width: number; height: number };

// Deterministic pseudo-random from index + char code
function seededRand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function FridgeMagnets({
  text,
  fridgeRect,
  x = 0.5,
  y = 0.5,
}: {
  text: string;
  fridgeRect: FridgeRect;
  x?: number;
  y?: number;
}) {
  const scale = fridgeRect.width / 1000;
  const magnetSize = 44 * scale;
  const gap = 4 * scale;
  const fontSize = 28 * scale;

  const words = text.toUpperCase().split(' ');
  const wordGap = magnetSize * 0.6;

  let totalWidth = 0;
  for (const word of words) {
    totalWidth += word.length * (magnetSize + gap) - gap;
  }
  totalWidth += (words.length - 1) * wordGap;

  const originX = fridgeRect.left + fridgeRect.width * x - totalWidth / 2;
  const originY = fridgeRect.top + fridgeRect.height * y;

  let letterIndex = 0;
  let xOffset = 0;

  return (
    <>
      {words.map((word, wi) => {
        const wordLetters = word.split('').map((char, ci) => {
          const idx = letterIndex++;
          const seed = idx * 7 + char.charCodeAt(0);
          const rotation = (seededRand(seed) - 0.5) * 10;
          const currentX = xOffset;
          xOffset += magnetSize + gap;

          return (
            <motion.div
              key={`${wi}-${ci}`}
              className="absolute select-none"
              style={{
                left: originX + currentX,
                top: originY,
                zIndex: 5,
              }}
              initial={{ opacity: 0, scale: 0.5, y: -20 * scale }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: idx * 0.05,
                duration: 0.3,
                ease: 'easeOut',
              }}
            >
              <MagnetLetter
                char={char}
                size={fontSize}
                rotation={rotation}
              />
            </motion.div>
          );
        });

        if (wi < words.length - 1) {
          xOffset += wordGap - gap;
        }

        return wordLetters;
      })}
    </>
  );
}
