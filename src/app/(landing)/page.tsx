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

    // Premium Philosophy Section Animations
    const philosophySection = document.querySelector('.philosophy-label');
    if (philosophySection) {
      // Main timeline for the philosophy section
      const philosophyTl = gsap.timeline({
        scrollTrigger: {
          trigger: philosophySection.closest('section'),
          start: 'top 75%',
          end: 'bottom 25%',
          toggleActions: 'play none none reverse',
        }
      });

      // Section label animation
      philosophyTl.to('.philosophy-label > div', {
        y: 0,
        duration: 1,
        ease: 'power3.out',
      })

      // Title words reveal with sophisticated stagger
      .to('.philosophy-title span span', {
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
      }, '-=0.5')

      // Text paragraphs fade in
      .to('.philosophy-text p', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.3,
        ease: 'power2.out',
      }, '-=0.6')

      // Stats animation
      .to('.philosophy-stats > div:not(.w-\\[1px\\])', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
      }, '-=0.4')

      // Divider lines scale
      .to('.philosophy-stats .w-\\[1px\\]', {
        scaleY: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.3');

      // Background elements animation
      gsap.set('.philosophy-bg-line', { scaleX: 0 });
      gsap.set('.philosophy-accent', { scale: 0, rotation: 0 });

      ScrollTrigger.create({
        trigger: philosophySection.closest('section'),
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.philosophy-bg-line', {
            scaleX: 1,
            duration: 2,
            stagger: 0.3,
            ease: 'power2.out',
          });
          
          gsap.to('.philosophy-accent', {
            scale: 1,
            rotation: (i) => i === 0 ? 45 : 12,
            duration: 1.5,
            stagger: 0.2,
            ease: 'back.out(1.7)',
          });
        }
      });

      // Visual element animations
      const visualElement = document.querySelector('.philosophy-visual');
      if (visualElement) {
        gsap.set('.philosophy-visual > div', { scale: 0, opacity: 0 });
        gsap.set('.philosophy-inner-circle', { rotation: 0, scale: 0 });
        gsap.set('.philosophy-float', { scale: 0, y: -20 });
        gsap.set('.philosophy-orbit', { rotation: 0, scale: 0 });

        ScrollTrigger.create({
          trigger: visualElement,
          start: 'top 85%',
          onEnter: () => {
            const visualTl = gsap.timeline();
            
            // Main circle appears
            visualTl.to('.philosophy-visual > div:first-child', {
              scale: 1,
              opacity: 1,
              duration: 1.2,
              ease: 'power3.out',
            })
            
            // Inner circle rotates in
            .to('.philosophy-inner-circle', {
              scale: 1,
              rotation: 180,
              duration: 1.5,
              ease: 'power2.out',
            }, '-=0.8')
            
            // Floating elements appear
            .to('.philosophy-float', {
              scale: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: 'back.out(1.7)',
            }, '-=1')
            
            // Orbit elements
            .to('.philosophy-orbit', {
              scale: 1,
              duration: 1,
              ease: 'power2.out',
            }, '-=0.8');
          }
        });

        // Continuous animations
        gsap.to('.philosophy-inner-circle', {
          rotation: '+=360',
          duration: 20,
          repeat: -1,
          ease: 'none',
        });

        gsap.to('.philosophy-orbit', {
          rotation: '-=360',
          duration: 30,
          repeat: -1,
          ease: 'none',
        });

        gsap.to('.philosophy-float', {
          y: -10,
          duration: 3,
          stagger: 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }
    }

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

      {/* Premium Philosophy Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-b from-[var(--off-white)] to-[var(--warm-beige)] bg-opacity-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="philosophy-bg-line absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--deep-green)] to-transparent opacity-20"></div>
          <div className="philosophy-bg-line absolute bottom-1/4 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--premium-green)] to-transparent opacity-15"></div>
          <div className="philosophy-accent absolute top-1/2 left-8 w-12 h-12 border border-[var(--deep-green)] border-opacity-10 transform -translate-y-1/2 rotate-45"></div>
          <div className="philosophy-accent absolute top-1/3 right-16 w-8 h-8 bg-[var(--premium-green)] bg-opacity-5 transform rotate-12"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-12">
              {/* Section Label */}
              <div className="philosophy-label overflow-hidden">
                <div className="flex items-center gap-4 transform translate-y-full">
                  <div className="w-12 h-[1px] bg-[var(--deep-green)]"></div>
                  <span className="text-xs tracking-[0.4em] font-light text-[var(--deep-green)] opacity-60">
                    PHILOSOPHY
                  </span>
                  <div className="w-12 h-[1px] bg-[var(--deep-green)]"></div>
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-6">
                <h2 className="philosophy-title text-5xl md:text-6xl lg:text-7xl font-light leading-[0.9] text-[var(--dark-brown)]">
                  <span className="block overflow-hidden">
                    <span className="inline-block transform translate-y-full">Crafted</span>
                  </span>
                  <span className="block overflow-hidden">
                    <span className="inline-block transform translate-y-full text-[var(--deep-green)]">in</span>
                  </span>
                  <span className="block overflow-hidden">
                    <span className="inline-block transform translate-y-full">Silence</span>
                  </span>
                </h2>
              </div>

              {/* Philosophy Text */}
              <div className="philosophy-text space-y-8 max-w-xl">
                <p className="text-lg md:text-xl leading-relaxed font-light text-[var(--dark-brown)] opacity-0">
                  In the quietude of our atelier, time becomes irrelevant. 
                  Each gesture carries the weight of tradition, each tool 
                  an extension of decades of refined expertise.
                </p>
                <p className="text-lg md:text-xl leading-relaxed font-light text-[var(--dark-brown)] opacity-0">
                  We practice the ancient art of barbering not as a service, 
                  but as a <span className="text-[var(--premium-green)] font-normal">meditation</span> — 
                  where precision meets poetry, and every cut tells a story.
                </p>
              </div>

              {/* Stats */}
              <div className="philosophy-stats flex items-center gap-12 pt-8">
                <div className="text-center transform translate-y-full opacity-0">
                  <div className="text-2xl md:text-3xl font-light text-[var(--deep-green)] mb-2">29</div>
                  <div className="text-xs tracking-[0.3em] text-[var(--dark-brown)] opacity-60">YEARS</div>
                </div>
                <div className="w-[1px] h-12 bg-[var(--deep-green)] opacity-20 transform scale-y-0"></div>
                <div className="text-center transform translate-y-full opacity-0">
                  <div className="text-2xl md:text-3xl font-light text-[var(--deep-green)] mb-2">∞</div>
                  <div className="text-xs tracking-[0.3em] text-[var(--dark-brown)] opacity-60">PRECISION</div>
                </div>
                <div className="w-[1px] h-12 bg-[var(--deep-green)] opacity-20 transform scale-y-0"></div>
                <div className="text-center transform translate-y-full opacity-0">
                  <div className="text-2xl md:text-3xl font-light text-[var(--deep-green)] mb-2">01</div>
                  <div className="text-xs tracking-[0.3em] text-[var(--dark-brown)] opacity-60">TRADITION</div>
                </div>
              </div>
            </div>

            {/* Right Visual Element */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="philosophy-visual relative">
                {/* Main Circle */}
                <div className="w-72 h-72 md:w-80 md:h-80 border border-[var(--deep-green)] border-opacity-20 rounded-full relative overflow-hidden">
                  {/* Inner rotating element */}
                  <div className="philosophy-inner-circle absolute inset-4 border border-[var(--premium-green)] border-opacity-30 rounded-full">
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[var(--deep-green)] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="philosophy-float absolute top-8 right-8 w-3 h-3 bg-[var(--premium-green)] bg-opacity-40 rounded-full"></div>
                  <div className="philosophy-float absolute bottom-12 left-12 w-2 h-2 bg-[var(--deep-green)] bg-opacity-60 rounded-full"></div>
                  <div className="philosophy-float absolute top-1/3 left-8 w-1 h-1 bg-[var(--premium-green)] rounded-full"></div>
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--deep-green)] to-[var(--premium-green)] opacity-5 rounded-full"></div>
                </div>
                
                {/* Orbiting elements */}
                <div className="philosophy-orbit absolute inset-0 w-72 h-72 md:w-80 md:h-80">
                  <div className="absolute -top-2 left-1/2 w-4 h-4 border border-[var(--deep-green)] border-opacity-40 transform -translate-x-1/2 rotate-45"></div>
                  <div className="absolute top-1/2 -right-2 w-3 h-3 bg-[var(--premium-green)] bg-opacity-20 transform -translate-y-1/2"></div>
                  <div className="absolute -bottom-2 left-1/2 w-2 h-2 bg-[var(--deep-green)] bg-opacity-30 rounded-full transform -translate-x-1/2"></div>
                  <div className="absolute top-1/2 -left-2 w-3 h-3 border border-[var(--premium-green)] border-opacity-30 rounded-full transform -translate-y-1/2"></div>
                </div>
              </div>
            </div>
          </div>
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