'use client';

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import { useFridge } from './FridgeScene';

export function PostcardFlip({
  id,
  src,
  backSrc,
  position,
  relativeSize = 0.25,
  rotation = -5,
}: {
  id: string;
  src: string;
  backSrc: string;
  position: { x: number; y: number };
  relativeSize?: number;
  rotation?: number;
}) {
  const { fridgeRect, activeId, select, dismiss, tiltX, tiltY } = useFridge();
  const isActive = activeId === id;
  const canInteract = activeId === null;

  // Compute scale so the postcard is always `relativeSize` fraction of fridge width
  const containerWidth = Math.min(window.innerWidth * 0.88, 672);
  const computedScale = (fridgeRect.width * relativeSize) / containerWidth;

  const timersStarted = useRef(false);
  const fridgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipProgress = useMotionValue(0);

  useEffect(() => {
    if (timersStarted.current) return;
    timersStarted.current = true;

    fridgeTimerRef.current = setTimeout(() => select(id), 2800);
    flipTimerRef.current = setTimeout(() => {
      animate(flipProgress, 180, { type: 'spring', stiffness: 80, damping: 12, mass: 0.8 });
    }, 2800 + 900 + 1800);
    return () => {
      if (fridgeTimerRef.current) clearTimeout(fridgeTimerRef.current);
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, [flipProgress, id, select]);

  const initialX =
    fridgeRect.left + fridgeRect.width * position.x - window.innerWidth / 2;
  const initialY =
    fridgeRect.top + fridgeRect.height * position.y - window.innerHeight / 2;

  const fridgeState = {
    x: initialX,
    y: initialY,
    scale: computedScale,
    rotate: rotation,
    boxShadow: '6px 8px 16px rgba(0,0,0,0.45)',
  };
  const centerState = {
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    boxShadow: '0px 0px 0px rgba(0,0,0,0)',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }

    if (!isActive && canInteract) {
      if (fridgeTimerRef.current) {
        clearTimeout(fridgeTimerRef.current);
        fridgeTimerRef.current = null;
      }
      select(id);
    } else if (isActive) {
      const target = flipProgress.get() < 90 ? 180 : 0;
      animate(flipProgress, target, { type: 'spring', stiffness: 80, damping: 12, mass: 0.8 });
    }
  };

  // When dismissed externally (outside click), unflip
  const prevActive = useRef(isActive);
  useEffect(() => {
    if (prevActive.current && !isActive) {
      animate(flipProgress, 0, { type: 'spring', stiffness: 120, damping: 18, mass: 0.8 });
    }
    prevActive.current = isActive;
  }, [isActive, flipProgress]);

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ zIndex: isActive ? 20 : 5 }}
      initial={fridgeState}
      animate={isActive ? centerState : fridgeState}
      transition={
        !isActive
          ? {
              type: 'spring',
              stiffness: 200,
              damping: 22,
              mass: 0.8,
              boxShadow: { delay: 0.4, duration: 0.2 },
            }
          : {
              type: 'spring',
              stiffness: 120,
              damping: 14,
              mass: 0.8,
              boxShadow: { duration: 0.2 },
            }
      }
      onClick={handleClick}
    >
      <AnimatePresence>
        {!isActive && (
          <motion.div
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-5 h-5 rounded-full shadow-md"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #e45, #a00)',
            }}
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
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <Image
              src={src}
              alt="Postcard front"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
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
  );
}
