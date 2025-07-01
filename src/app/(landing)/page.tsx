'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import Lenis from 'lenis';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize smooth scrolling
  useEffect(() => {
    if (!isMobile && typeof window !== 'undefined') {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 2,
      });

      lenisRef.current = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    }
  }, [isMobile]);

  // Custom cursor
  useEffect(() => {
    if (isMobile || typeof window === 'undefined') return;

    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    if (!cursor || !cursorDot) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power3.out',
      });
      gsap.to(cursorDot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0,
      });
    };

    const handleMouseEnter = () => {
      gsap.to(cursor, { scale: 1.5, duration: 0.3 });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3 });
    };

    window.addEventListener('mousemove', moveCursor);

    const interactiveElements = document.querySelectorAll('a, button, .hover-scale');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [isMobile]);

  // Loading animation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const tl = gsap.timeline({
      onComplete: () => setIsLoading(false),
    });

    tl.to('.loading-text', {
      opacity: 0,
      y: -50,
      duration: 0.8,
      ease: 'power3.inOut',
    })
    .to('.loading-screen', {
      yPercent: -100,
      duration: 1,
      ease: 'power3.inOut',
    });
  }, []);

  // Initialize animations
  useEffect(() => {
    if (isLoading || typeof window === 'undefined') return;

    // Hero animations
    const heroTl = gsap.timeline({ delay: 0.5 });
    
    // Split text for animation
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroTitle) {
      const splitTitle = new SplitType('.hero-title', { types: 'chars' });
      heroTl.from(splitTitle.chars, {
        opacity: 0,
        y: 100,
        rotateX: -90,
        stagger: 0.02,
        duration: 1.2,
        ease: 'power3.out',
      });
    }
    
    if (heroSubtitle) {
      const splitSubtitle = new SplitType('.hero-subtitle', { types: 'words' });
      heroTl.from(splitSubtitle.words, {
        opacity: 0,
        y: 50,
        stagger: 0.05,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.8');
    }
    
    heroTl.from('.hero-image', {
      opacity: 0,
      scale: 1.2,
      duration: 1.5,
      ease: 'power3.out',
    }, '-=1')
    .from('.nav-item', {
      opacity: 0,
      y: -30,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=1.2');

    // Scroll animations
    gsap.utils.toArray('.section').forEach((section: any) => {
      const elements = section.querySelectorAll('.fade-up');
      
      gsap.from(elements, {
        opacity: 0,
        y: 100,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // Parallax effects
    gsap.utils.toArray('.parallax').forEach((element: any) => {
      const speed = element.dataset.speed || 0.5;
      
      gsap.to(element, {
        yPercent: -100 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    // Horizontal scroll for services
    if (servicesRef.current && !isMobile) {
      const servicesTrack = servicesRef.current.querySelector('.services-track');
      if (servicesTrack) {
        gsap.to(servicesTrack, {
          x: () => -(servicesTrack.scrollWidth - window.innerWidth + 100),
          ease: 'none',
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top top',
            end: () => `+=${servicesTrack.scrollWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isLoading, isMobile]);

  return (
    <>
      {/* Loading Screen */}
      <div className="loading-screen fixed inset-0 z-[100] bg-[#1A1A1A] flex items-center justify-center">
        <h1 className="loading-text text-[#E6D7B8] text-4xl md:text-6xl font-serif tracking-[0.2em]">
          BARBAROS
        </h1>
      </div>

      {/* Custom Cursor */}
      {!isMobile && (
        <>
          <div
            ref={cursorRef}
            className="custom-cursor fixed w-8 h-8 border-2 border-[#E6D7B8] rounded-full pointer-events-none z-[90] mix-blend-difference"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
          <div
            ref={cursorDotRef}
            className="custom-cursor-dot fixed w-1 h-1 bg-[#E6D7B8] rounded-full pointer-events-none z-[91]"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        </>
      )}

      <div ref={mainRef} className="main-container bg-[#F8F6F2]">
        {/* Navigation */}
        <header className="fixed top-0 w-full z-50 mix-blend-difference">
          <nav className="px-4 md:px-8 lg:px-16 py-6 md:py-8">
            <div className="flex justify-between items-center">
              <Link href="/" className="nav-item text-xl md:text-2xl font-serif text-[#1A1A1A] hover:text-[#E6D7B8] transition-colors duration-500">
                BARBAROS
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8 lg:gap-12">
                <Link href="#philosophy" className="nav-item text-xs lg:text-sm font-sans tracking-[0.15em] text-[#1A1A1A] hover:text-[#E6D7B8] transition-colors duration-500">
                  PHILOSOPHY
                </Link>
                <Link href="#services" className="nav-item text-xs lg:text-sm font-sans tracking-[0.15em] text-[#1A1A1A] hover:text-[#E6D7B8] transition-colors duration-500">
                  SERVICES
                </Link>
                <Link href="#gallery" className="nav-item text-xs lg:text-sm font-sans tracking-[0.15em] text-[#1A1A1A] hover:text-[#E6D7B8] transition-colors duration-500">
                  GALLERY
                </Link>
                <Link href="/reservations/new" className="nav-item text-xs lg:text-sm font-sans tracking-[0.15em] bg-[#1A1A1A] text-[#F8F6F2] px-6 py-3 hover:bg-[#E6D7B8] hover:text-[#1A1A1A] transition-all duration-500">
                  RESERVE
                </Link>
                <Link href="/login" className="nav-item text-xs lg:text-sm font-sans tracking-[0.15em] text-[#1A1A1A] hover:text-[#E6D7B8] transition-colors duration-500">
                  LOGIN
                </Link>
                <Link href="/register" className="nav-item text-xs lg:text-sm font-sans tracking-[0.15em] text-[#1A1A1A] hover:text-[#E6D7B8] transition-colors duration-500">
                  SIGN UP
                </Link>
              </div>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden text-[#1A1A1A] z-50"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </nav>
        </header>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-[#1A1A1A] z-40 md:hidden">
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <Link href="#philosophy" onClick={() => setMenuOpen(false)} className="text-2xl font-serif text-[#F8F6F2] hover:text-[#E6D7B8] transition-colors duration-500">
                PHILOSOPHY
              </Link>
              <Link href="#services" onClick={() => setMenuOpen(false)} className="text-2xl font-serif text-[#F8F6F2] hover:text-[#E6D7B8] transition-colors duration-500">
                SERVICES
              </Link>
              <Link href="#gallery" onClick={() => setMenuOpen(false)} className="text-2xl font-serif text-[#F8F6F2] hover:text-[#E6D7B8] transition-colors duration-500">
                GALLERY
              </Link>
              <Link href="/reservations/new" onClick={() => setMenuOpen(false)} className="text-2xl font-serif bg-[#E6D7B8] text-[#1A1A1A] px-8 py-4 hover:bg-[#F8F6F2] transition-all duration-500">
                RESERVE
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-2xl font-serif text-[#F8F6F2] hover:text-[#E6D7B8] transition-colors duration-500">
                LOGIN
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="text-2xl font-serif text-[#F8F6F2] hover:text-[#E6D7B8] transition-colors duration-500">
                SIGN UP
              </Link>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section ref={heroRef} className="hero-section relative min-h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0 parallax" data-speed="0.3">
            <div className="hero-image absolute inset-0 opacity-20">
              <Image
                src="/images/hero-image.jpg"
                alt="Barbaros Premium Barbershop"
                fill
                className="object-cover filter grayscale"
                priority
              />
            </div>
          </div>
          
          <div className="relative z-10 w-full px-4 md:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto">
              <h1 className="hero-title text-[60px] sm:text-[80px] md:text-[120px] lg:text-[180px] font-serif text-[#1A1A1A] leading-[0.85] mb-4 md:mb-8">
                BARBAROS
              </h1>
              <p className="hero-subtitle text-xs md:text-sm lg:text-base font-sans tracking-[0.3em] text-[#2D1B14] uppercase">
                The Art of Distinction
              </p>
              
              {/* Hero CTAs for Mobile */}
              <div className="md:hidden mt-8 flex flex-col gap-4">
                <Link href="/reservations/new" className="bg-[#1A1A1A] text-[#F8F6F2] px-6 py-3 text-center hover:bg-[#E6D7B8] hover:text-[#1A1A1A] transition-all duration-500">
                  BOOK NOW
                </Link>
                <Link href="/register" className="border border-[#1A1A1A] text-[#1A1A1A] px-6 py-3 text-center hover:bg-[#1A1A1A] hover:text-[#F8F6F2] transition-all duration-500">
                  CREATE ACCOUNT
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section id="philosophy" className="section py-20 md:py-32 lg:py-48">
          <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-16 text-center">
            <div className="relative">
              <span className="absolute -top-10 md:top-20 left-1/2 transform -translate-x-1/2 text-[100px] md:text-[200px] font-serif text-[#E6D7B8] opacity-20">
                &
              </span>
              <p className="fade-up text-base md:text-lg lg:text-2xl font-serif text-[#2D1B14] leading-relaxed tracking-wide relative z-10">
                Where tradition meets contemporary excellence. Each visit is a ritual of refinement, 
                crafted for the modern gentleman who values timeless sophistication.
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="section py-20 md:py-32 lg:py-48 overflow-hidden" ref={servicesRef}>
          <div className="services-wrapper">
            <h2 className="fade-up text-3xl md:text-4xl lg:text-6xl font-serif text-[#1A1A1A] text-center mb-12 md:mb-20">
              Our Craft
            </h2>
            
            <div className="horizontal-scroll-container relative">
              <div className="services-track flex gap-4 md:gap-8 lg:gap-16 px-4 md:px-8 lg:px-16">
                {/* Service 1: The Cut */}
                <div className="service-card min-w-[85vw] md:min-w-[80vw] h-[50vh] md:h-[70vh] relative group">
                  <div className="absolute inset-0 bg-[#1A1A1A] overflow-hidden">
                    <Image
                      src="/images/hero-image.jpg"
                      alt="The Cut"
                      fill
                      className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2s]"
                    />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-20">
                    <h3 className="text-3xl md:text-5xl lg:text-7xl font-serif text-[#F8F6F2] mb-2 md:mb-4">
                      THE CUT
                    </h3>
                    <p className="text-[#E6D7B8] font-sans text-xs md:text-sm tracking-[0.2em] mb-4 md:mb-8">
                      PRECISION CRAFTED EXCELLENCE
                    </p>
                    <p className="text-2xl md:text-4xl lg:text-5xl font-serif text-[#E6D7B8]">
                      $85
                    </p>
                  </div>
                </div>

                {/* Service 2: The Shave */}
                <div className="service-card min-w-[85vw] md:min-w-[80vw] h-[50vh] md:h-[70vh] relative group">
                  <div className="absolute inset-0 bg-[#2D1B14] overflow-hidden">
                    <Image
                      src="/images/hero-image.jpg"
                      alt="The Shave"
                      fill
                      className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2s]"
                    />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-20">
                    <h3 className="text-3xl md:text-5xl lg:text-7xl font-serif text-[#F8F6F2] mb-2 md:mb-4">
                      THE SHAVE
                    </h3>
                    <p className="text-[#E6D7B8] font-sans text-xs md:text-sm tracking-[0.2em] mb-4 md:mb-8">
                      TRADITIONAL LUXURY REDEFINED
                    </p>
                    <p className="text-2xl md:text-4xl lg:text-5xl font-serif text-[#E6D7B8]">
                      $65
                    </p>
                  </div>
                </div>

                {/* Service 3: The Experience */}
                <div className="service-card min-w-[85vw] md:min-w-[80vw] h-[50vh] md:h-[70vh] relative group">
                  <div className="absolute inset-0 bg-[#1B2F1C] overflow-hidden">
                    <Image
                      src="/images/hero-image.jpg"
                      alt="The Experience"
                      fill
                      className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2s]"
                    />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-20">
                    <h3 className="text-3xl md:text-5xl lg:text-7xl font-serif text-[#F8F6F2] mb-2 md:mb-4">
                      THE EXPERIENCE
                    </h3>
                    <p className="text-[#E6D7B8] font-sans text-xs md:text-sm tracking-[0.2em] mb-4 md:mb-8">
                      COMPLETE GENTLEMAN'S RITUAL
                    </p>
                    <p className="text-2xl md:text-4xl lg:text-5xl font-serif text-[#E6D7B8]">
                      $150
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mastery Section */}
        <section className="section py-20 md:py-32 lg:py-48">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="relative h-[400px] md:h-[600px] lg:h-[700px]">
                <div className="absolute inset-0 bg-[#1A1A1A] overflow-hidden">
                  <Image
                    src="/images/hero-image.jpg"
                    alt="Master Barber"
                    fill
                    className="object-cover filter grayscale opacity-80"
                  />
                </div>
                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
                  <span className="text-[80px] md:text-[120px] lg:text-[150px] font-serif text-[#E6D7B8] leading-none">
                    25
                  </span>
                  <p className="text-sm md:text-base font-sans tracking-[0.2em] text-[#E6D7B8]">
                    YEARS OF MASTERY
                  </p>
                </div>
              </div>
              
              <div className="fade-up">
                <h2 className="text-3xl md:text-4xl lg:text-6xl font-serif text-[#1A1A1A] mb-6 md:mb-8">
                  The Master's Touch
                </h2>
                <p className="text-base md:text-lg font-serif text-[#2D1B14] leading-relaxed mb-6 md:mb-8">
                  Our artisans bring decades of refinement to every stroke. Each cut is a symphony 
                  of precision, where classical techniques meet contemporary vision.
                </p>
                <p className="text-base md:text-lg font-serif text-[#2D1B14] leading-relaxed">
                  In the sanctuary of our chairs, time slows. Here, grooming transcends routine 
                  to become ritual—a moment of connection between craftsman and gentleman.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="section py-20 md:py-32 lg:py-48 bg-[#EAE2D6]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <h2 className="fade-up text-3xl md:text-4xl lg:text-6xl font-serif text-[#1A1A1A] text-center mb-12 md:mb-20">
              Transformations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <div key={index} className="fade-up gallery-item relative h-[300px] md:h-[400px] group overflow-hidden">
                  <Image
                    src="/images/hero-image.jpg"
                    alt={`Transformation ${index + 1}`}
                    fill
                    className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-8 left-8">
                      <p className="text-[#E6D7B8] font-sans text-sm tracking-[0.2em]">
                        TRANSFORMATION {index + 1}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="section py-20 md:py-32 lg:py-48">
          <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-16">
            <h2 className="fade-up text-3xl md:text-4xl lg:text-6xl font-serif text-[#1A1A1A] text-center mb-12 md:mb-20">
              Visit Us
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-16">
              <div className="fade-up">
                <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] mb-4 md:mb-6">
                  Location
                </h3>
                <p className="text-base md:text-lg font-sans text-[#2D1B14] mb-2">
                  123 Barber Street
                </p>
                <p className="text-base md:text-lg font-sans text-[#2D1B14]">
                  City, State 12345
                </p>
              </div>
              
              <div className="fade-up">
                <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] mb-4 md:mb-6">
                  Hours
                </h3>
                <p className="text-base md:text-lg font-sans text-[#2D1B14] mb-2">
                  Monday - Friday: 9:00 AM - 8:00 PM
                </p>
                <p className="text-base md:text-lg font-sans text-[#2D1B14]">
                  Saturday - Sunday: 10:00 AM - 6:00 PM
                </p>
              </div>
            </div>
            
            <div className="fade-up mt-12 md:mt-20 text-center">
              <Link 
                href="/reservations/new" 
                className="inline-block bg-[#1A1A1A] text-[#F8F6F2] px-8 md:px-12 py-4 md:py-6 text-sm md:text-base font-sans tracking-[0.2em] hover:bg-[#E6D7B8] hover:text-[#1A1A1A] transition-all duration-500"
              >
                RESERVE YOUR EXPERIENCE
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 md:py-12 bg-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[#E6D7B8] font-sans text-xs md:text-sm tracking-[0.2em]">
                © {new Date().getFullYear()} BARBAROS. ALL RIGHTS RESERVED.
              </p>
              <div className="flex gap-6 md:gap-8">
                <Link href="/login" className="text-[#E6D7B8] font-sans text-xs md:text-sm tracking-[0.2em] hover:text-[#F8F6F2] transition-colors duration-500">
                  LOGIN
                </Link>
                <Link href="/register" className="text-[#E6D7B8] font-sans text-xs md:text-sm tracking-[0.2em] hover:text-[#F8F6F2] transition-colors duration-500">
                  SIGN UP
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 