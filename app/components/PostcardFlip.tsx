'use client';

import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {MagnetLetter} from "@/app/components/MagnetLetter";

type FridgeRect = { left: number; top: number; width: number; height: number };

const FRIDGE_NATURAL_W = 1736;
const FRIDGE_NATURAL_H = 3227;

function computeFridgeRect(): FridgeRect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / FRIDGE_NATURAL_W, vh / FRIDGE_NATURAL_H);
  const width = FRIDGE_NATURAL_W * scale;
  const height = FRIDGE_NATURAL_H * scale;
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
}

// Fraction of fridge image where the postcard sits.
const FRIDGE_X_FRAC = 0.75;
const FRIDGE_Y_FRAC = 0.22;

// Per-letter color overrides for "TAP HERE"
const TAP_HERE_COLORS: Record<string, string[]> = {
  TAP: ['#ff2030', '#ffcf00', '#00d44a'],
  HERE: ['#3355ff', '#ff2da0', '#ff2030', '#3355ff'],
};

// Deterministic pseudo-random from seed
function seededRand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function PostcardFlip({ backSrc }: { backSrc: string }) {
  const [onFridge, setOnFridge] = useState(true);
  const [fridgeRect, setFridgeRect] = useState<FridgeRect | null>(null);
  const timersStarted = useRef(false);
  const fridgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipProgress = useMotionValue(0);

  useEffect(() => {
    const update = () => setFridgeRect(computeFridgeRect());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!fridgeRect || timersStarted.current) return;
    timersStarted.current = true;

    fridgeTimerRef.current = setTimeout(() => setOnFridge(false), 2800);
    flipTimerRef.current = setTimeout(() => {
      animate(flipProgress, 180, { duration: 1.4, ease: 'easeInOut' });
    }, 2800 + 900 + 1800);
    return () => {
      if (fridgeTimerRef.current) clearTimeout(fridgeTimerRef.current);
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, [fridgeRect, flipProgress]);

  const initialX = fridgeRect
    ? fridgeRect.left + fridgeRect.width * FRIDGE_X_FRAC - window.innerWidth / 2
    : 0;
  const initialY = fridgeRect
    ? fridgeRect.top + fridgeRect.height * FRIDGE_Y_FRAC - window.innerHeight / 2
    : 0;

  const fridgeState = {
    x: initialX, y: initialY, scale: 0.22, rotate: -7,
    boxShadow: '6px 8px 16px rgba(0,0,0,0.45)',
  };
  const centerState = {
    x: 0, y: 0, scale: 1, rotate: 0,
    boxShadow: '0px 0px 0px rgba(0,0,0,0)',
  };

  const handlePostcardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // User is taking control — cancel the auto-flip timer
    if (flipTimerRef.current) { clearTimeout(flipTimerRef.current); flipTimerRef.current = null; }

    if (onFridge) {
      if (fridgeTimerRef.current) { clearTimeout(fridgeTimerRef.current); fridgeTimerRef.current = null; }
      setOnFridge(false);
    } else {
      // Toggle flip
      const target = flipProgress.get() < 90 ? 180 : 0;
      animate(flipProgress, target, { duration: 1.4, ease: 'easeInOut' });
    }
  };

  const handleOutsideClick = () => {
    if (onFridge) return;
    if (flipTimerRef.current) { clearTimeout(flipTimerRef.current); flipTimerRef.current = null; }
    // Unflip and fly back simultaneously
    animate(flipProgress, 0, { duration: 0.7, ease: 'easeInOut' });
    setOnFridge(true);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-yellow-400 overflow-hidden"
      onClick={handleOutsideClick}
    >

      <Image
        src="/fridge.png"
        alt="Fridge"
        width={FRIDGE_NATURAL_W}
        height={FRIDGE_NATURAL_H}
        style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100vh' }}
        priority
      />
      
      {fridgeRect && (
        <div
          className="absolute z-[5] flex flex-col items-center"
          style={{
            left: fridgeRect.left + fridgeRect.width * FRIDGE_X_FRAC,
            top: fridgeRect.top + fridgeRect.height * FRIDGE_Y_FRAC - fridgeRect.height * 0.04,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center">
            {'TAP'.split('').map((ch, i) => {
              const seed = i * 7 + 42;
              const rot = (seededRand(seed) - 0.5) * 16;
              const yOff = (seededRand(seed + 1) - 0.5) * 0.3;
              const sz = fridgeRect.width * 0.05;
              return (
                <MagnetLetter
                  key={`tap-${i}`}
                  char={ch}
                  color={TAP_HERE_COLORS.TAP[i]}
                  size={sz}
                  rotation={rot}
                  style={{ marginTop: sz * yOff }}
                />
              );
            })}
          </div>
          <div className="flex items-center">
            {'HERE'.split('').map((ch, i) => {
              const seed = (i + 3) * 7 + 99;
              const rot = (seededRand(seed) - 0.5) * 16;
              const yOff = (seededRand(seed + 1) - 0.5) * 0.3;
              const sz = fridgeRect.width * 0.05;
              return (
                <MagnetLetter
                  key={`here-${i}`}
                  char={ch}
                  color={TAP_HERE_COLORS.HERE[i]}
                  size={sz}
                  rotation={rot}
                  style={{ marginTop: sz * yOff }}
                />
              );
            })}
          </div>
        </div>
      )}

      {fridgeRect && (
        <motion.div
          className="absolute z-10 cursor-pointer"
          initial={fridgeState}
          animate={onFridge ? fridgeState : centerState}
          transition={{
            duration: 0.85,
            ease: [0.25, 0.46, 0.45, 0.94],
            boxShadow: onFridge
              ? { delay: 0.7, duration: 0.2 }  // appear only after landing
              : { duration: 0.3 },              // disappear quickly on lift-off
          }}
          onClick={handlePostcardClick}
        >
          <AnimatePresence>
            {onFridge && (
              <motion.div
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-5 h-5 rounded-full shadow-md"
                style={{ background: 'radial-gradient(circle at 35% 35%, #e45, #a00)' }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
              />
            )}
          </AnimatePresence>

          <div style={{ perspective: '1200px' }} className="w-[min(88vw,672px)]">
            <motion.div
              style={{
                transformStyle: 'preserve-3d',
                position: 'relative',
                aspectRatio: '2.8 / 2',
                width: '100%',
                rotateY: flipProgress,
              }}
            >
              <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                <Image
                  src="/1.png"
                  alt="Save the Date — Maria and Roly"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <Image
                  src={backSrc}
                  alt="Postcard back"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
