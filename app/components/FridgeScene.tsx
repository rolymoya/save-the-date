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

// Per-letter color overrides for "WE'RE GETTING MARRIED"
const MAGNET_LINES: { text: string; colors: string[] }[] = [
  { text: "WE'RE",   colors: ['#ff2030', '#3355ff', '#ffcf00', '#00a83e', '#ff2da0'] },
  { text: 'GETTING', colors: ['#ffcf00', '#3355ff', '#ff2030', '#00a83e', '#ff2da0', '#3355ff', '#ffcf00'] },
  { text: 'MARRIED!', colors: ['#00a83e', '#ff2030', '#3355ff', '#ffcf00', '#ff2da0', '#00a83e', '#3355ff'] },
];

function seededRand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// Fridge X/Y for the "TAP HERE" magnets (above the postcard)
const MAGNETS_X_FRAC = 0.25;
const MAGNETS_Y_FRAC = 0.10;

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
  const permissionAsked = useRef(false);

  useEffect(() => {
    const handleMotion = (e: DeviceOrientationEvent) => {
      const x = Math.max(-15, Math.min(15, (e.gamma ?? 0) * 0.4));
      const y = Math.max(-15, Math.min(15, (e.beta ?? 0) * 0.3));
      rawTiltX.set(x);
      rawTiltY.set(y);
    };

    const requestPermission = async () => {
      if (permissionAsked.current) return;
      permissionAsked.current = true;
      // iOS 13+ requires permission
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (DOE.requestPermission) {
        try {
          const perm = await DOE.requestPermission();
          if (perm !== 'granted') return;
        } catch {
          return;
        }
      }
      window.addEventListener('deviceorientation', handleMotion);
    };

    requestPermission();
    return () => window.removeEventListener('deviceorientation', handleMotion);
  }, [rawTiltX, rawTiltY]);

  const select = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const dismiss = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleOutsideClick = () => {
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

      {/* WE'RE GETTING MARRIED magnet letters */}
      {fridgeRect && (
        <div
          className="absolute z-[5] flex flex-col items-center"
          style={{
            left: fridgeRect.left + fridgeRect.width * MAGNETS_X_FRAC,
            top: fridgeRect.top + fridgeRect.height * MAGNETS_Y_FRAC,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {MAGNET_LINES.map((line, li) => (
            <div key={li} className="flex items-center">
              {line.text.split('').map((ch, ci) => {
                const seed = (li * 20 + ci) * 7 + 42;
                const rot = (seededRand(seed * 2.9) - 0.5) * 16;
                const yOff = (seededRand(seed * 200) - 0.5) * 0.3;
                const sz = fridgeRect.width * 0.04;
                return (
                  <MagnetLetter
                    key={`${li}-${ci}`}
                    char={ch}
                    color={line.colors[ci % line.colors.length]}
                    size={sz}
                    rotation={rot}
                    style={{ marginTop: sz * yOff }}
                  />
                );
              })}
            </div>
          ))}
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
