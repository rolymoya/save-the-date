'use client';

import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

// Envelope: landscape ~1.4:1
const ENVELOPE_ASPECT = 1.4;
// Postcard: portrait 2:2.8
const POSTCARD_ASPECT_W = 2;
const POSTCARD_ASPECT_H = 2.8;
// Flap triangle height as fraction of envelope body height
const FLAP_RATIO = 1.2;

// Envelope base color
const ENV_COLOR = '#c25538';
const ENV_COLOR_DARK = '#b04e34';
const ENV_COLOR_DARKER = '#a04530';

export function PostcardEnvelope({
  frontSrc,
  backSrc,
}: {
  frontSrc: string;
  backSrc: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [autoComplete, setAutoComplete] = useState(false);

  const timersStarted = useRef(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Envelope
  const envelopeY = useMotionValue(0);
  const flapRotation = useMotionValue(180); // 180 = closed (hidden), -10 = open (cream visible)

  // Postcard
  const postcardRotation = useMotionValue(90);
  const postcardScale = useMotionValue(0.65);
  const flipProgress = useMotionValue(0);

  // Derived: flap shadow on body
  const flapShadowOpacity = useTransform(flapRotation, [180, 90, 0], [0, 0.15, 0.3]);

  // Derived: postcard z-index
  const postcardZ = useTransform(postcardRotation, (r) => (r < 70 ? 15 : 1));

  // Derived: hide preview when real postcard emerges
  const previewOpacity = useTransform(postcardRotation, [90, 70], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || timersStarted.current) return;
    timersStarted.current = true;

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timerRefs.current.push(id);
      return id;
    };

    const vh = window.innerHeight;

    // T=1000: Flap opens (180 → -10, past vertical so cream inner face shows)
    schedule(() => {
      animate(flapRotation, -10, {
        type: 'spring', stiffness: 80, damping: 14, mass: 0.8,
      });
    }, 1000);

    // T=2000: Postcard rotates out + envelope slides down
    schedule(() => {
      animate(postcardRotation, 0, {
        type: 'spring', stiffness: 50, damping: 14, mass: 0.8,
      });
      animate(postcardScale, 1, {
        type: 'spring', stiffness: 50, damping: 14, mass: 0.8,
      });
      animate(envelopeY, vh * 0.75, {
        type: 'spring', stiffness: 40, damping: 16, mass: 1,
      });
    }, 2000);

    // T=4500: Postcard flips to back
    schedule(() => {
      animate(flipProgress, 180, {
        type: 'spring', stiffness: 80, damping: 12, mass: 0.8,
      });
    }, 4500);

    // T=5800: Enable interactive flip
    schedule(() => {
      setAutoComplete(true);
    }, 5800);

    return () => {
      timersStarted.current = false;
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
    };
  }, [mounted, envelopeY, flapRotation, postcardRotation, postcardScale, flipProgress]);

  const handleClick = () => {
    if (!autoComplete) return;
    const target = flipProgress.get() < 90 ? 180 : 0;
    animate(flipProgress, target, {
      type: 'spring', stiffness: 80, damping: 12, mass: 0.8,
    });
  };

  if (!mounted) return null;

  const flapHeightPct = (FLAP_RATIO / ENVELOPE_ASPECT) * 100;

  // Rounded center clip-paths — approximate curves with extra points near the center (~50%, ~50%)
  // Left flap: covers left side, edge curves toward center
  const leftFlap = 'polygon(0% 0%, 48% 44%, 50% 47%, 50% 53%, 48% 56%, 0% 100%)';
  // Right flap: mirror of left
  const rightFlap = 'polygon(100% 0%, 52% 44%, 50% 47%, 50% 53%, 52% 56%, 100% 100%)';
  // Bottom flap: covers bottom, edge curves toward center
  const bottomFlap = 'polygon(0% 100%, 44% 52%, 47% 50%, 53% 50%, 56% 52%, 100% 100%)';

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: '#d4c5b2' }}
    >
      {/* Envelope — starts centered, slides down */}
      <motion.div
        className="absolute w-[min(88vw,672px)]"
        style={{ y: envelopeY, zIndex: 10 }}
      >
        {/* Envelope body container */}
        <div
          className="relative w-full"
          style={{
            aspectRatio: `${ENVELOPE_ASPECT}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            borderRadius: '3px',
          }}
        >
          {/* Layer 1: Cream interior */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(170deg, #f0ead6, #e8e0cc)',
              borderRadius: '3px',
              zIndex: 1,
            }}
          />

          {/* Layer 2: Postcard preview — peeks through V-gap */}
          {/*<motion.div*/}
          {/*  className="absolute"*/}
          {/*  style={{*/}
          {/*    left: '5%',*/}
          {/*    right: '5%',*/}
          {/*    top: '8%',*/}
          {/*    bottom: '8%',*/}
          {/*    zIndex: 2,*/}
          {/*    opacity: previewOpacity,*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div style={{ position: 'relative', width: '100%', height: '100%' }}>*/}
          {/*    <Image*/}
          {/*      src={frontSrc}*/}
          {/*      alt=""*/}
          {/*      fill*/}
          {/*      style={{ objectFit: 'cover' }}*/}
          {/*      priority*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*</motion.div>*/}

          {/* Layer 3: Left body flap */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: leftFlap,
              background: ENV_COLOR,
              zIndex: 3,
            }}
          >
            {/* Subtle edge shadow along the inner edge */}
            <div className="absolute inset-0" style={{
              background: `linear-gradient(to left, ${ENV_COLOR_DARKER}, transparent 30%)`,
              opacity: 0.4,
            }} />
          </div>

          {/* Layer 4: Right body flap */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: rightFlap,
              background: ENV_COLOR,
              zIndex: 3,
            }}
          >
            <div className="absolute inset-0" style={{
              background: `linear-gradient(to right, ${ENV_COLOR_DARKER}, transparent 30%)`,
              opacity: 0.4,
            }} />
          </div>

          {/* Layer 5: Bottom body flap (on top of side flaps) */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: bottomFlap,
              background: ENV_COLOR_DARK,
              zIndex: 4,
            }}
          >
            <div className="absolute inset-0" style={{
              background: `linear-gradient(to bottom, ${ENV_COLOR_DARKER}, transparent 35%)`,
              opacity: 0.3,
            }} />
          </div>

          {/* Layer 6: Flap shadow on body — V-shaped from top */}
          <motion.div
            className="absolute inset-0"
            style={{
              opacity: flapShadowOpacity,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent 50%)',
              clipPath: 'polygon(0% 0%, 50% 45%, 100% 0%)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />

          {/* Layer 7: Top flap — preserve-3d so both faces work with one rotation */}
          <div
            className="absolute left-0 right-0"
            style={{
              bottom: '100%',
              paddingBottom: `${flapHeightPct}%`,
              perspective: '800px',
              zIndex: 7,
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                transformOrigin: 'bottom center',
                rotateX: flapRotation,
                clipPath: 'polygon(0% 100%, 44% 52%, 47% 50%, 53% 50%, 56% 52%, 100% 100%)',
                background: `linear-gradient(180deg, ${ENV_COLOR_DARKER}, ${ENV_COLOR})`,
                boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Postcard — starts horizontal (rotate 90), animates to vertical (rotate 0) */}
      <motion.div
        className="absolute cursor-pointer"
        style={{
          width: 'min(57vw, 437px)',
          rotate: postcardRotation,
          scale: postcardScale,
          zIndex: postcardZ,
        }}
        onClick={handleClick}
      >
        <div style={{ perspective: '1200px' }}>
          <motion.div
            style={{
              transformStyle: 'preserve-3d',
              position: 'relative',
              aspectRatio: `${POSTCARD_ASPECT_W} / ${POSTCARD_ASPECT_H}`,
              width: '100%',
              rotateY: flipProgress,
            }}
          >
            <div
              className="absolute inset-0 rounded-sm overflow-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <Image
                src={frontSrc}
                alt="Postcard front"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div
              className="absolute inset-0 rounded-sm overflow-hidden"
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
                priority
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
