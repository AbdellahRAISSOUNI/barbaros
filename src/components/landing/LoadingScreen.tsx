'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const loadingRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loading = loadingRef.current;
    const text = textRef.current;
    const mask = maskRef.current;
    if (!loading || !text || !mask) return;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loading, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete: onComplete,
        });
      },
    });

    // Premium mask reveal animation
    tl.set(text, { opacity: 1 })
      .from(mask, {
        scaleY: 0,
        duration: 1,
        ease: 'power3.inOut',
      })
      .to(text, {
        letterSpacing: '0.5em',
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.4')
      .to([text, mask], {
        opacity: 0,
        duration: 0.6,
        delay: 0.5,
        ease: 'power3.in',
      });

  }, [onComplete]);

  return (
    <div
      ref={loadingRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--off-white)]"
    >
      <div ref={textRef} className="text-center opacity-0 relative">
        <h1 className="text-4xl md:text-6xl tracking-[0.3em] font-light text-[var(--deep-green)]">BARBAROS</h1>
        <div 
          ref={maskRef}
          className="absolute inset-0 bg-[var(--off-white)]"
          style={{ transformOrigin: 'center bottom' }}
        />
      </div>
    </div>
  );
} 