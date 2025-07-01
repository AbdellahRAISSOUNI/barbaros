'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorInner = cursorInnerRef.current;
    if (!cursor || !cursorInner) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0,
      });
      
      gsap.to(cursorInner, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
      });
    };

    const handleMouseEnter = () => {
      gsap.to([cursor, cursorInner], {
        scale: 1.5,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to([cursor, cursorInner], {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    document.addEventListener('mousemove', moveCursor);
    
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] w-3 h-3 -ml-1.5 -mt-1.5"
        style={{ mixBlendMode: 'difference' }}
      >
        <div className="w-full h-full bg-[var(--dark-brown)] rounded-full"></div>
      </div>
      <div
        ref={cursorInnerRef}
        className="fixed pointer-events-none z-[9998] w-8 h-8 -ml-4 -mt-4"
        style={{ mixBlendMode: 'difference' }}
      >
        <div className="w-full h-full border border-[var(--dark-brown)] rounded-full opacity-50"></div>
      </div>
    </>
  );
} 