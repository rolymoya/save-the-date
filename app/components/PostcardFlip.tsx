'use client';

import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type FridgeRect = { left: number; top: number; width: number; height: number };

function getRenderedImageRect(img: HTMLImageElement): FridgeRect {
  const { naturalWidth, naturalHeight } = img;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / naturalWidth, vh / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
}

// Fraction of fridge image where the postcard sits.
// Tweak these to move the postcard around the fridge door.
const FRIDGE_X_FRAC = 0.60; // ~right door of side-by-side
const FRIDGE_Y_FRAC = 0.27; // upper portion of the door

export function PostcardFlip({ backSrc }: { backSrc: string }) {
  const [onFridge, setOnFridge] = useState(true);
  const [fridgeRect, setFridgeRect] = useState<FridgeRect | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const timersStarted = useRef(false);
  const flipProgress = useMotionValue(0);

  const updateRect = useCallback(() => {
    if (imgRef.current) setFridgeRect(getRenderedImageRect(imgRef.current));
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  // Start timers once the fridge image is measured
  useEffect(() => {
    if (!fridgeRect || timersStarted.current) return;
    timersStarted.current = true;

    const t1 = setTimeout(() => setOnFridge(false), 2800);
    const t2 = setTimeout(() => {
      animate(flipProgress, 180, { duration: 1.4, ease: 'easeInOut' });
    }, 2800 + 900 + 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [fridgeRect, flipProgress]);

  // Pixel offset from viewport center to where the postcard lives on the fridge
  const initialX = fridgeRect
    ? fridgeRect.left + fridgeRect.width * FRIDGE_X_FRAC - window.innerWidth / 2
    : 0;
  const initialY = fridgeRect
    ? fridgeRect.top + fridgeRect.height * FRIDGE_Y_FRAC - window.innerHeight / 2
    : 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-yellow-400 overflow-hidden">
      {/* Fridge — onLoad fires with the img element so we can measure it */}
      <Image
        src="/fridge.png"
        alt="Fridge"
        fill
        style={{ objectFit: 'contain' }}
        priority
        onLoad={(e) => {
          imgRef.current = e.currentTarget;
          setFridgeRect(getRenderedImageRect(e.currentTarget));
        }}
      />

      {/* Only render postcard once we know where the fridge is */}
      {fridgeRect && (
        <motion.div
          className="absolute z-10"
          initial={{ x: initialX, y: initialY, scale: 0.10, rotate: -7 }}
          animate={onFridge ? {} : { x: 0, y: 0, scale: 1, rotate: 0 }}
          transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Magnet dot */}
          <AnimatePresence>
            {onFridge && (
              <motion.div
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-5 h-5 rounded-full shadow-md"
                style={{ background: 'radial-gradient(circle at 35% 35%, #e45, #a00)' }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
              />
            )}
          </AnimatePresence>

          {/* Perspective wrapper */}
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
              {/* Front face */}
              <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                <Image
                  src="/1.png"
                  alt="Save the Date — Maria and Roly"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>

              {/* Back face */}
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
