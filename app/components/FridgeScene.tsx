'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { MagnetLetter } from './MagnetLetter';

export type FridgeRect = { left: number; top: number; width: number; height: number };

const FRIDGE_NATURAL_W = 1736;
const FRIDGE_NATURAL_H = 3227;

// Inset so the fridge doesn't fill the entire viewport on mobile
const FRIDGE_PADDING = 0.92; // use 92% of available space

function computeFridgeRect(): FridgeRect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / FRIDGE_NATURAL_W, vh / FRIDGE_NATURAL_H) * FRIDGE_PADDING;
  const width = FRIDGE_NATURAL_W * scale;
  const height = FRIDGE_NATURAL_H * scale;
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
}

// Per-letter color overrides for "TAP HERE"
const TAP_HERE_COLORS: Record<string, string[]> = {
  TAP: ['#ffcf00', '#ff2030', '#00a83e'],
  HERE: ['#3355ff', '#ffcf00', '#ff2030', '#3355ff'],
};

function seededRand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// Fridge X/Y for the "TAP HERE" magnets (above the postcard)
const MAGNETS_X_FRAC = 0.25;
const MAGNETS_Y_FRAC = 0.15;

type FridgeContextValue = {
  fridgeRect: FridgeRect;
  activeId: string | null;
  select: (id: string) => void;
  dismiss: () => void;
  tiltX: MotionValue<number>;
  tiltY: MotionValue<number>;
};

const FridgeContext = createContext<FridgeContextValue | null>(null);

export function useFridge() {
  const ctx = useContext(FridgeContext);
  if (!ctx) throw new Error('useFridge must be used inside FridgeScene');
  return ctx;
}

export function FridgeScene({ children }: { children: ReactNode }) {
  const [fridgeRect, setFridgeRect] = useState<FridgeRect | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setFridgeRect(computeFridgeRect());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Device tilt → jiggle
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { stiffness: 60, damping: 12 });
  const tiltY = useSpring(rawTiltY, { stiffness: 60, damping: 12 });
  const motionListening = useRef(false);

  const baseBeta = useRef<number | null>(null);

  const handleMotion = useCallback((e: DeviceOrientationEvent) => {
    const gamma = e.gamma ?? 0;
    const beta = e.beta ?? 0;
    // Calibrate: treat the first reading as "neutral"
    if (baseBeta.current === null) baseBeta.current = beta;
    const deltaB = beta - baseBeta.current;
    const x = Math.max(-20, Math.min(20, gamma * 0.6));
    const y = Math.max(-20, Math.min(20, deltaB * 0.6));
    rawTiltX.set(x);
    rawTiltY.set(y);
  }, [rawTiltX, rawTiltY]);

  // Start listening immediately on non-iOS (no permission needed)
  useEffect(() => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (!DOE.requestPermission && !motionListening.current) {
      motionListening.current = true;
      window.addEventListener('deviceorientation', handleMotion);
    }
    return () => window.removeEventListener('deviceorientation', handleMotion);
  }, [handleMotion]);

  // iOS: request permission on first user tap (must be from a gesture)
  const requestMotionPermission = useCallback(async () => {
    if (motionListening.current) return;
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (!DOE.requestPermission) return;
    try {
      const perm = await DOE.requestPermission();
      if (perm === 'granted') {
        motionListening.current = true;
        window.addEventListener('deviceorientation', handleMotion);
      }
    } catch {
      // permission denied or unavailable
    }
  }, [handleMotion]);

  const select = useCallback((id: string) => {
    requestMotionPermission();
    setActiveId(id);
  }, [requestMotionPermission]);

  const dismiss = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleOutsideClick = () => {
    // Request motion permission on first interaction (iOS requires user gesture)
    requestMotionPermission();
    if (activeId) dismiss();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-yellow-400 overflow-hidden"
      onClick={handleOutsideClick}
    >
      {/* Dim overlay */}
      <motion.div
        className="absolute inset-0 bg-black z-[8] pointer-events-none"
        animate={{ opacity: activeId ? 0.5 : 0 }}
        transition={{ duration: 0.4 }}
      />

      <Image
        src="/fridge.png"
        alt="Fridge"
        width={FRIDGE_NATURAL_W}
        height={FRIDGE_NATURAL_H}
        style={{
          objectFit: 'contain',
          maxWidth: `${FRIDGE_PADDING * 100}%`,
          maxHeight: `${FRIDGE_PADDING * 100}vh`,
        }}
        priority
      />

      {/* TAP HERE magnet letters */}
      {fridgeRect && (
        <div
          className="absolute z-[5] flex flex-col items-center"
          style={{
            left: fridgeRect.left + fridgeRect.width * MAGNETS_X_FRAC,
            top: fridgeRect.top + fridgeRect.height * MAGNETS_Y_FRAC - fridgeRect.height * 0.04,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center">
            {'TAP'.split('').map((ch, i) => {
              const seed = i * 7 + 42;
              const rot = (seededRand(seed * 2.9) - 0.5) * 16;
              const yOff = (seededRand(seed * 200) - 0.5) * 0.3;
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

      {/* Fridge items (postcards, photos) */}
      {fridgeRect && (
        <FridgeContext.Provider value={{ fridgeRect, activeId, select, dismiss, tiltX, tiltY }}>
          {children}
        </FridgeContext.Provider>
      )}
    </div>
  );
}
