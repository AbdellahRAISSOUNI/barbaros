'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'scale';
  delay?: number;
}

export default function AnimatedSection({ 
  children, 
  className = '', 
  animation = 'fade-up',
  delay = 0 
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const element = sectionRef.current;
    if (!element) return;

    let animationProps = {};
    
    switch (animation) {
      case 'fade-up':
        animationProps = {
          y: 30,
          opacity: 0,
        };
        break;
      case 'fade-in':
        animationProps = {
          opacity: 0,
        };
        break;
      case 'scale':
        animationProps = {
          scale: 0.95,
          opacity: 0,
        };
        break;
    }

    gsap.set(element, animationProps);

    ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(element, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          delay: delay,
          ease: 'power3.out',
        });
      },
      once: true,
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [animation, delay]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
} 