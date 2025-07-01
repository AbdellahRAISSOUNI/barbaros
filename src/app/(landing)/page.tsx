'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from '@/components/landing/CustomCursor';
import ScrollProgress from '@/components/landing/ScrollProgress';
import MagneticButton from '@/components/landing/MagneticButton';
import LoadingScreen from '@/components/landing/LoadingScreen';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;
    
    gsap.registerPlugin(ScrollTrigger);
    
    // Initial page load animation
    const tl = gsap.timeline();
    
    tl.from('.hero-title', {
      opacity: 0,
      y: 30,
      duration: 1.2,
      ease: 'power3.out',
    })
    .from('.hero-subtitle', {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.8')
    .from('.hero-image', {
      opacity: 0,
      scale: 1.1,
      duration: 1.5,
      ease: 'power3.out',
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

    // Testimonial animations
    const testimonials = document.querySelectorAll('.testimonial-item');
    testimonials.forEach((testimonial, index) => {
      ScrollTrigger.create({
        trigger: testimonial,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(testimonial, {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: index * 0.2,
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

    // Gallery item animations
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 80%',
        onEnter: () => {
          gsap.from(item, {
            opacity: 0,
            scale: 0.95,
            duration: 1,
            delay: index * 0.1,
            ease: 'power3.out',
          });
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isLoading]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    window.location.href = '/reservations/new';
  };

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <>
      <ScrollProgress />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-40 mix-blend-difference">
        <div className="px-6 md:px-16 py-6 md:py-8">
          <div className="flex justify-between items-center">
            <div className="text-[var(--dark-brown)]">
              <span className="text-xs md:text-sm font-light tracking-widest">EST. 1995</span>
            </div>
            <div className="flex items-center gap-6">
              <Link 
                href="/login"
                className="hidden md:block text-sm font-light tracking-widest hover:opacity-60 transition-opacity duration-300"
                data-cursor-hover
              >
                LOGIN
              </Link>
              <Link 
                href="/reservations/new"
                className="text-xs md:text-sm font-light tracking-widest hover:opacity-60 transition-opacity duration-300"
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
                     <h1 className="hero-title text-[60px] md:text-[120px] lg:text-[160px] leading-[0.8] tracking-tighter mb-8">
            BARBAROS
          </h1>
          <div className="hero-subtitle flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-xs md:text-sm font-light tracking-[0.3em]">
            <span>PRECISION</span>
            <span className="hidden md:block w-16 h-[1px] bg-[var(--dark-brown)] opacity-20" />
            <span>TRADITION</span>
            <span className="hidden md:block w-16 h-[1px] bg-[var(--dark-brown)] opacity-20" />
            <span>CRAFT</span>
          </div>
        </div>

        <div ref={heroImageRef} className="hero-image absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[400px] opacity-10">
          <Image
            src="/images/hero-image.jpg"
            alt="Master at work"
            fill
            className="object-cover filter grayscale"
            priority
          />
        </div>
      </section>

      {/* Services Section */}
      <section className="min-h-screen flex items-center bg-[var(--warm-beige)] bg-opacity-10">
        <div className="w-full max-w-6xl mx-auto px-8 md:px-16">
          <div className="space-y-16">
            {[
              { name: 'CLASSIC CUT', description: 'Traditional barbering excellence', price: '45' },
              { name: 'BEARD SCULPTURE', description: 'Precision grooming artistry', price: '35' },
              { name: 'COMPLETE EXPERIENCE', description: 'Cut, beard, and finishing touches', price: '75' },
            ].map((service, index) => (
                             <div
                key={index}
                className="service-item relative flex justify-between items-baseline border-b border-[var(--dark-brown)] border-opacity-10 pb-4 group"
              >
                <div>
                  <h3 className="text-2xl md:text-3xl font-light mb-2 group-hover:ml-2 transition-all duration-300">
                    {service.name}
                  </h3>
                  <p className="text-sm font-light opacity-60">{service.description}</p>
                </div>
                <span className="text-2xl font-light">${service.price}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--champagne-gold)] group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-8 md:px-16 text-center">
          <p className="word-reveal text-2xl md:text-3xl lg:text-4xl leading-relaxed font-light">
            In the sanctuary of our chair, time slows. Each cut is a meditation, 
            each stroke deliberate. We honor the ritual of grooming as our 
            fathers did, with tools that whisper rather than roar.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="min-h-screen py-32 bg-[var(--warm-beige)] bg-opacity-10">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="gallery-item relative aspect-[4/3] overflow-hidden group"
              >
                <Image
                  src="/images/hero-image.jpg"
                  alt={`Work ${item}`}
                  fill
                  className="object-cover filter grayscale transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-sm font-light">J.S. / OCT 2024</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <div className="space-y-24">
            {[
              { quote: 'An experience that transcends the ordinary.', author: 'MICHAEL R.' },
              { quote: 'Where craftsmanship meets meditation.', author: 'DAVID L.' },
              { quote: 'The only place I trust with my image.', author: 'JAMES K.' },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-item opacity-0"
              >
                <blockquote className="text-2xl md:text-3xl font-light italic mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <cite className="text-sm font-light tracking-widest opacity-60">
                  — {testimonial.author}
                </cite>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Master Barber Section */}
      <section className="min-h-screen flex items-center bg-[var(--warm-beige)] bg-opacity-10">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src="/images/hero-image.jpg"
                alt="Master Barber"
                fill
                className="object-cover filter grayscale"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-light">ALESSANDRO BARBAROS</h2>
              <p className="text-lg font-light leading-relaxed opacity-80">
                Three generations of barbering excellence flow through these hands. 
                Trained in Milano, refined in London, perfected through decades of 
                devotion to the craft. Every cut tells a story of tradition meeting 
                contemporary elegance.
              </p>
              <div className="flex items-center gap-8 text-sm font-light tracking-widest opacity-60">
                <span>29 YEARS</span>
                <span className="w-8 h-[1px] bg-[var(--dark-brown)] opacity-20" />
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
              <h2 className="text-2xl font-light mb-8 tracking-wider">RESERVE YOUR VISIT</h2>
              <form className="space-y-8" onSubmit={handleFormSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="NAME"
                    className="w-full bg-transparent border-b border-[var(--dark-brown)] border-opacity-20 py-3 text-sm tracking-wider placeholder-[var(--dark-brown)] placeholder-opacity-40 focus:outline-none focus:border-[var(--champagne-gold)] transition-colors duration-300"
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="PHONE"
                    className="w-full bg-transparent border-b border-[var(--dark-brown)] border-opacity-20 py-3 text-sm tracking-wider placeholder-[var(--dark-brown)] placeholder-opacity-40 focus:outline-none focus:border-[var(--champagne-gold)] transition-colors duration-300"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="PREFERRED DATE"
                    className="w-full bg-transparent border-b border-[var(--dark-brown)] border-opacity-20 py-3 text-sm tracking-wider placeholder-[var(--dark-brown)] placeholder-opacity-40 focus:outline-none focus:border-[var(--champagne-gold)] transition-colors duration-300"
                  />
                </div>
                                 <MagneticButton>
                  <button
                    type="submit"
                    className="mt-12 px-12 py-4 bg-[var(--oxblood)] text-white text-sm tracking-widest hover:bg-opacity-90 transition-all duration-300"
                    data-cursor-hover
                  >
                    RESERVE
                  </button>
                </MagneticButton>
              </form>
            </div>
            
            <div className="space-y-12">
              <div>
                <h3 className="text-sm font-light tracking-widest opacity-60 mb-4">LOCATION</h3>
                <p className="text-lg font-light">
                  123 Madison Avenue<br />
                  New York, NY 10016
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-light tracking-widest opacity-60 mb-4">HOURS</h3>
                <p className="text-lg font-light">
                  Tuesday — Friday: 9AM — 7PM<br />
                  Saturday: 9AM — 6PM<br />
                  Sunday — Monday: Closed
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-light tracking-widest opacity-60 mb-4">CONTACT</h3>
                <p className="text-lg font-light">
                  +1 (212) 555-0100<br />
                  reserve@barbaros.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 border-t border-[var(--dark-brown)] border-opacity-10">
        <div className="max-w-6xl mx-auto px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs md:text-sm font-light tracking-widest opacity-60">
            © {new Date().getFullYear()} BARBAROS
          </span>
          <span className="text-xs md:text-sm font-light tracking-widest opacity-60">
            CRAFTED WITH PRECISION
          </span>
        </div>
      </footer>
    </>
  );
}