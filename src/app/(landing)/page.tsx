'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from '@/components/landing/CustomCursor';
import MagneticButton from '@/components/landing/MagneticButton';

export default function LandingPage() {
  const [headerVisible, setHeaderVisible] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Header hide/show on scroll
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Simplified hero animation without glitches
    const tl = gsap.timeline();
    
    // Smooth title reveal - animating from CSS initial states
    tl.to('.hero-title', {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
    })
    .to('.hero-subtitle span', {
      opacity: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.6')
    .to('.hero-image', {
      opacity: 0.08,
      scale: 1,
      duration: 1.5,
      ease: 'power2.out',
    }, '-=0.8');

    // Parallax effect on hero image
    if (heroImageRef.current) {
      gsap.to(heroImageRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    }

    // Word reveal animations for sections
    const revealElements = document.querySelectorAll('.word-reveal');
    revealElements.forEach((element) => {
      const words = element.textContent?.split(' ') || [];
      element.innerHTML = words
        .map(word => `<span class="inline-block overflow-hidden"><span class="inline-block transform translate-y-full">${word}</span></span>`)
        .join(' ');
      
      const spans = element.querySelectorAll('span span');
      
      ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(spans, {
            y: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: 'power3.out',
          });
        },
      });
    });

    // Service item animations
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach((item, index) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 85%',
        onEnter: () => {
          gsap.from(item, {
            opacity: 0,
            x: -30,
            duration: 0.8,
            delay: index * 0.15,
            ease: 'power3.out',
          });
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    window.location.href = '/reservations/new';
  };

  return (
    <>
      {/* Navigation */}
      <nav 
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-40 transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        } bg-[var(--off-white)] bg-opacity-95 backdrop-blur-sm`}
      >
        <div className="px-6 md:px-16 py-6 md:py-8">
          <div className="flex justify-between items-center">
            <div className="text-[var(--deep-green)]">
              <span className="text-xs md:text-sm font-light tracking-widest">EST. 1995</span>
            </div>
            <div className="flex items-center gap-6">
              <Link 
                href="/login"
                className="hidden md:block text-sm font-light tracking-widest text-[var(--deep-green)] hover:text-[var(--dark-red)] transition-colors duration-300"
                data-cursor-hover
              >
                LOGIN
              </Link>
              <Link 
                href="/register"
                className="hidden md:block text-sm font-light tracking-widest text-[var(--deep-green)] hover:text-[var(--dark-red)] transition-colors duration-300"
                data-cursor-hover
              >
                REGISTER
              </Link>
              <Link 
                href="/reservations/new"
                className="px-12 py-4 bg-[var(--oxblood)] text-white text-xs md:text-sm tracking-widest hover:bg-opacity-90 transition-all duration-300"
                data-cursor-hover
              >
                RESERVE
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--off-white)]" />
        
        <div className="relative z-10 text-center px-8">
          <h1 className="hero-title text-[60px] md:text-[120px] lg:text-[160px] leading-[0.8] tracking-tighter mb-8 text-[var(--dark-brown)]">
            BARBAROS
          </h1>
          <div className="hero-subtitle flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-xs md:text-sm font-light tracking-[0.3em] text-[var(--dark-brown)]">
            <span>PRECISION</span>
            <span className="hidden md:block w-16 h-[1px] bg-[var(--deep-green)] opacity-30" />
            <span>TRADITION</span>
            <span className="hidden md:block w-16 h-[1px] bg-[var(--deep-green)] opacity-30" />
            <span>CRAFT</span>
          </div>
        </div>

        <div ref={heroImageRef} className="hero-image absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[700px] h-[500px] opacity-[0.08]">
          <Image
            src="/images/barber-chair.jpg"
            alt="Vintage barber chair"
            fill
            className="object-cover filter grayscale"
            priority
          />
        </div>
      </section>

      {/* Our Philosophy Section */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-5xl mx-auto px-8 md:px-16 text-center">
          <h2 className="word-reveal text-4xl md:text-5xl lg:text-6xl font-light mb-16 text-[var(--deep-green)]">
            The Barbaros Experience
          </h2>
          <p className="word-reveal text-xl md:text-2xl lg:text-3xl leading-relaxed font-light text-[var(--dark-brown)]">
            In the sanctuary of our chair, time slows. Each cut is a meditation, 
            each stroke deliberate. We honor the ritual of grooming as our 
            fathers did, with tools that whisper rather than roar.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="min-h-screen flex items-center bg-[var(--warm-beige)] bg-opacity-5">
        <div className="w-full max-w-6xl mx-auto px-8 md:px-16">
          <h2 className="text-3xl md:text-4xl font-light mb-20 text-center text-[var(--deep-green)]">Our Services</h2>
          <div className="space-y-16">
            {[
              { name: 'CLASSIC CUT', description: 'Traditional barbering excellence', price: '45' },
              { name: 'BEARD SCULPTURE', description: 'Precision grooming artistry', price: '35' },
              { name: 'COMPLETE EXPERIENCE', description: 'Cut, beard, and finishing touches', price: '75' },
            ].map((service, index) => (
              <div
                key={index}
                className="service-item relative flex justify-between items-baseline border-b border-[var(--deep-green)] border-opacity-10 pb-6 group"
              >
                <div>
                  <h3 className="text-2xl md:text-3xl font-light mb-2 text-[var(--dark-brown)] group-hover:text-[var(--deep-green)] transition-colors duration-300">
                    {service.name}
                  </h3>
                  <p className="text-sm font-light opacity-60">{service.description}</p>
                </div>
                <span className="text-2xl font-light text-[var(--deep-green)]">${service.price}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--dark-red)] group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <h2 className="text-3xl md:text-4xl font-light mb-20 text-center text-[var(--deep-green)]">Why Choose Barbaros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'MASTER CRAFTSMANSHIP',
                description: 'Three generations of barbering excellence, refined through decades of dedication.',
                icon: '01'
              },
              {
                title: 'PREMIUM EXPERIENCE',
                description: 'Every visit is a ritual of relaxation, precision, and personal transformation.',
                icon: '02'
              },
              {
                title: 'TIMELESS TRADITION',
                description: 'Classic techniques meet contemporary style in our pursuit of grooming perfection.',
                icon: '03'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="service-item text-center group"
              >
                <div className="text-6xl font-light text-[var(--dark-red)] mb-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-light mb-4 tracking-wider text-[var(--deep-green)]">
                  {item.title}
                </h3>
                <p className="text-sm font-light leading-relaxed opacity-70">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Master Barber Section */}
      <section className="min-h-screen flex items-center bg-[var(--warm-beige)] bg-opacity-5">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[3/4] overflow-hidden group">
              <Image
                src="/images/master-barber.jpg"
                alt="Master Barber Alessandro"
                fill
                className="object-cover filter grayscale transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-light text-[var(--deep-green)]">ALESSANDRO BARBAROS</h2>
              <p className="text-lg font-light leading-relaxed opacity-80 text-[var(--dark-brown)]">
                Three generations of barbering excellence flow through these hands. 
                Trained in Milano, refined in London, perfected through decades of 
                devotion to the craft. Every cut tells a story of tradition meeting 
                contemporary elegance.
              </p>
              <div className="flex items-center gap-8 text-sm font-light tracking-widest text-[var(--deep-green)] opacity-60">
                <span>29 YEARS</span>
                <span className="w-8 h-[1px] bg-[var(--deep-green)] opacity-30" />
                <span>MASTER BARBER</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-4xl mx-auto px-8 md:px-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-light mb-8 tracking-wider text-[var(--deep-green)]">RESERVE YOUR VISIT</h2>
              <form className="space-y-8" onSubmit={handleFormSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="NAME"
                    className="w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm tracking-wider placeholder-[var(--dark-brown)] placeholder-opacity-40 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300"
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="PHONE"
                    className="w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm tracking-wider placeholder-[var(--dark-brown)] placeholder-opacity-40 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="PREFERRED DATE"
                    className="w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm tracking-wider placeholder-[var(--dark-brown)] placeholder-opacity-40 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300"
                  />
                </div>
                <MagneticButton>
                  <button
                    type="submit"
                    className="mt-12 px-12 py-4 bg-[var(--oxblood)] text-white text-xs md:text-sm tracking-widest hover:bg-opacity-90 transition-all duration-300"
                    data-cursor-hover
                  >
                    RESERVE
                  </button>
                </MagneticButton>
              </form>
            </div>
            
            <div className="space-y-12">
              <div>
                <h3 className="text-sm font-light tracking-widest text-[var(--deep-green)] opacity-60 mb-4">LOCATION</h3>
                <p className="text-lg font-light text-[var(--dark-brown)]">
                  123 Madison Avenue<br />
                  New York, NY 10016
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-light tracking-widest text-[var(--deep-green)] opacity-60 mb-4">HOURS</h3>
                <p className="text-lg font-light text-[var(--dark-brown)]">
                  Tuesday — Friday: 9AM — 7PM<br />
                  Saturday: 9AM — 6PM<br />
                  Sunday — Monday: Closed
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-light tracking-widest text-[var(--deep-green)] opacity-60 mb-4">CONTACT</h3>
                <p className="text-lg font-light text-[var(--dark-brown)]">
                  +1 (212) 555-0100<br />
                  reserve@barbaros.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 border-t border-[var(--deep-green)] border-opacity-10">
        <div className="max-w-6xl mx-auto px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs md:text-sm font-light tracking-widest text-[var(--deep-green)] opacity-60">
            © {new Date().getFullYear()} BARBAROS
          </span>
          <span className="text-xs md:text-sm font-light tracking-widest text-[var(--deep-green)] opacity-60">
            CRAFTED WITH PRECISION
          </span>
        </div>
      </footer>
    </>
  );
}