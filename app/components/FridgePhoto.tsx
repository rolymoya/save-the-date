'use client';

import { AnimatePresence, motion, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useMemo } from 'react';
import { useFridge } from './FridgeScene';

export function FridgePhoto({
  id,
  src,
  alt = '',
  position,
  relativeSize = 0.2,
  rotation = -5,
  aspectRatio = '4 / 3',
}: {
  id: string;
  src: string;
  alt?: string;
  position: { x: number; y: number };
  relativeSize?: number;
  rotation?: number;
  aspectRatio?: string;
}) {
  const { fridgeRect, activeId, select, dismiss, tiltX, tiltY } = useFridge();
  const isActive = activeId === id;
  const canInteract = activeId === null;

  // Compute scale so the photo is always `relativeSize` fraction of fridge width
  const containerWidth = Math.min(window.innerWidth * 0.88, 672);
  const computedScale = (fridgeRect.width * relativeSize) / containerWidth;

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
    if (isActive) {
      dismiss();
    } else if (canInteract) {
      select(id);
    }
  };

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

      <div className="w-[min(88vw,672px)]">
        <div style={{ position: 'relative', aspectRatio, width: '100%' }}>
          <Image
            src={src}
            alt={alt}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
