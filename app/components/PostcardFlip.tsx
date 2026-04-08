'use client';

import { animate, motion, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';

export function PostcardFlip({ backSrc }: { backSrc: string }) {
  const flipProgress = useMotionValue(0);

  useEffect(() => {
    const t = setTimeout(() => {
      animate(flipProgress, 180, { duration: 1.4, ease: 'easeInOut' });
    }, 1000);
    return () => clearTimeout(t);
  }, [flipProgress]);

  return (
    <div style={{ perspective: '1200px' }} className="w-full max-w-2xl">
      <motion.div
        style={{
          transformStyle: 'preserve-3d',
          position: 'relative',
          aspectRatio: '3 / 2',
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
  );
}
