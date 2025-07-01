'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const progress = progressRef.current;
    if (!progress) return;

    gsap.to(progress, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="fixed right-0 top-0 w-[1px] h-screen z-50 pointer-events-none">
      <div className="relative w-full h-full bg-[var(--warm-beige)] opacity-20">
        <div
          ref={progressRef}
          className="absolute top-0 right-0 w-full bg-[var(--champagne-gold)] opacity-60"
          style={{ height: '0%' }}
        />
      </div>
    </div>
  );
} 