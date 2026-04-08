'use client';

import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function PostcardFlip({ backSrc }: { backSrc: string }) {
  const [onFridge, setOnFridge] = useState(true);
  const flipProgress = useMotionValue(0);

  useEffect(() => {
    // Lift off the fridge after 1.8s
    const t1 = setTimeout(() => setOnFridge(false), 2800);
    // Flip after the move animation completes (~0.9s travel) + a beat
    const t2 = setTimeout(() => {
      animate(flipProgress, 180, { duration: 1.4, ease: 'easeInOut' });
    }, 1800 + 900 + 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [flipProgress]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-yellow-400 overflow-hidden">
      {/* Fridge fills the viewport */}
      <Image
        src="/fridge.png"
        alt="Fridge"
        fill
        style={{ objectFit: 'contain' }}
        priority
      />

      {/* Postcard — starts on fridge, moves to center */}
      <motion.div
        className="absolute z-10"
        initial={{ x: '5vw', y: '-25vh', scale: 0.10, rotate: -7 }}
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
    </div>
  );
}
