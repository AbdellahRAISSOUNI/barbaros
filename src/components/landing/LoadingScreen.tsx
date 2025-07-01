'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const loadingRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loading = loadingRef.current;
    const text = textRef.current;
    if (!loading || !text) return;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loading, {
          opacity: 0,
          duration: 0.5,
          onComplete: onComplete,
        });
      },
    });

    tl.from(text, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power3.out',
    })
    .to(text, {
      opacity: 0,
      y: -20,
      duration: 0.8,
      delay: 1.5,
      ease: 'power3.in',
    });

  }, [onComplete]);

  return (
    <div
      ref={loadingRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--off-white)]"
    >
      <div ref={textRef} className="text-center">
        <h1 className="text-4xl md:text-6xl tracking-[0.3em] font-light">BARBAROS</h1>
      </div>
    </div>
  );
} 