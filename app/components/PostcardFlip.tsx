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
const FRIDGE_X_FRAC = 0.60;
const FRIDGE_Y_FRAC = 0.27;

export function PostcardFlip({ backSrc }: { backSrc: string }) {
  const [onFridge, setOnFridge] = useState(true);
  const [fridgeRect, setFridgeRect] = useState<FridgeRect | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const timersStarted = useRef(false);
  const fridgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipProgress = useMotionValue(0);

  const updateRect = useCallback(() => {
    if (imgRef.current) setFridgeRect(getRenderedImageRect(imgRef.current));
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

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
    x: initialX, y: initialY, scale: 0.10, rotate: -7,
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
        fill
        style={{ objectFit: 'contain' }}
        priority
        onLoad={(e) => {
          imgRef.current = e.currentTarget;
          setFridgeRect(getRenderedImageRect(e.currentTarget));
        }}
      />

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
