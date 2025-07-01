'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from '@/components/landing/CustomCursor';
import './landing-styles.css';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.add('landing-page-active');
    gsap.registerPlugin(ScrollTrigger);
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.body.classList.remove('landing-page-active');
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      // Reset scroll behavior
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen antialiased landing-page">
      <CustomCursor />
      {children}
    </div>
  );
} 