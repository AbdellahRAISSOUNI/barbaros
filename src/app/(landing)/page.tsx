'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');
  const heroRef = useRef<HTMLDivElement>(null);
  const philosophyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Advanced scroll reveal animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          
          // Trigger word-by-word animations for philosophy text
          if (entry.target.classList.contains('philosophy-text')) {
            const words = entry.target.querySelectorAll('.word');
            words.forEach((word, index) => {
              setTimeout(() => {
                word.classList.add('revealed');
              }, index * 200);
            });
          }
        }
      });
    }, observerOptions);
    
    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  const handleCursorEnter = (variant: string) => setCursorVariant(variant);
  const handleCursorLeave = () => setCursorVariant('default');

  return (
    <div className="barbaros-masterpiece">
      {/* Premium Custom Cursor */}
      <div 
        className={`custom-cursor ${cursorVariant}`}
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      >
        <div className="cursor-inner"></div>
        <div className="cursor-outer"></div>
      </div>

      {/* Elegant Navigation */}
      <nav className="premium-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-est">EST. MMXXIV</span>
          </div>
          <div className="nav-links">
            <Link 
              href="/reservations/new" 
              className="nav-link"
              onMouseEnter={() => handleCursorEnter('button')}
              onMouseLeave={handleCursorLeave}
            >
              RESERVE
            </Link>
            <Link 
              href="/login" 
              className="nav-link"
              onMouseEnter={() => handleCursorEnter('button')}
              onMouseLeave={handleCursorLeave}
            >
              ENTER
            </Link>
            <Link 
              href="/register" 
              className="nav-link"
              onMouseEnter={() => handleCursorEnter('button')}
              onMouseLeave={handleCursorLeave}
            >
              JOIN
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - Asymmetrical Masterpiece */}
      <section ref={heroRef} className="hero-masterpiece">
        <div className="hero-container">
          {/* Oversized Wordmark */}
          <div className="hero-wordmark">
            <h1 className={`barbaros-wordmark ${isLoaded ? 'revealed' : ''}`}>
              <span className="letter" style={{ animationDelay: '0.1s' }}>B</span>
              <span className="letter" style={{ animationDelay: '0.2s' }}>A</span>
              <span className="letter" style={{ animationDelay: '0.3s' }}>R</span>
              <span className="letter" style={{ animationDelay: '0.4s' }}>B</span>
              <span className="letter" style={{ animationDelay: '0.5s' }}>A</span>
              <span className="letter" style={{ animationDelay: '0.6s' }}>R</span>
              <span className="letter" style={{ animationDelay: '0.7s' }}>O</span>
              <span className="letter" style={{ animationDelay: '0.8s' }}>S</span>
              </h1>
            
            <div className={`hero-tagline ${isLoaded ? 'revealed' : ''}`}>
              <span className="tagline-text">THE ART OF DISTINCTION</span>
            </div>
                </div>

          {/* Artistic Portrait */}
          <div className="hero-portrait">
            <div className={`portrait-container ${isLoaded ? 'revealed' : ''}`}>
              <div className="portrait-image">
                <div className="portrait-placeholder"></div>
                <div className="film-grain"></div>
              </div>
              <div className="portrait-frame"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          <span className="scroll-text">DISCOVER</span>
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="philosophy-section animate-on-scroll">
        <div className="philosophy-container">
          {/* Floating Ampersand */}
          <div className="floating-ampersand">&</div>
          
          <div className="philosophy-content">
            <p className="philosophy-text animate-on-scroll">
              <span className="word">In</span>
              <span className="word">the</span>
              <span className="word">quiet</span>
              <span className="word">precision</span>
              <span className="word">of</span>
              <span className="word">our</span>
              <span className="word">craft,</span>
              <span className="word">we</span>
              <span className="word">discover</span>
              <span className="word">not</span>
              <span className="word">merely</span>
              <span className="word">technique,</span>
              <span className="word">but</span>
              <span className="word">the</span>
              <span className="word">profound</span>
              <span className="word">art</span>
              <span className="word">of</span>
              <span className="word">transformation.</span>
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES DISPLAY - Horizontal Scroll */}
      <section className="services-showcase animate-on-scroll">
        <div className="services-container">
          <div className="services-track">
            {[
              {
                title: 'THE CUT',
                subtitle: 'Architectural precision meets artistic vision',
                price: '$185',
                image: 'scissors'
              },
              {
                title: 'THE SHAVE',
                subtitle: 'Traditional ceremony, modern mastery',
                price: '$125',
                image: 'razor'
              },
              {
                title: 'THE EXPERIENCE',
                subtitle: 'Complete gentleman\'s transformation',
                price: '$295',
                image: 'experience'
              }
            ].map((service, index) => (
              <div 
                key={service.title}
                className="service-card"
                onMouseEnter={() => handleCursorEnter('expand')}
                onMouseLeave={handleCursorLeave}
              >
                <div className="service-image">
                  <div className={`service-placeholder ${service.image}`}></div>
                  <div className="image-overlay"></div>
                </div>
                
                <div className="service-content">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-subtitle">{service.subtitle}</p>
                  <div className="service-price">{service.price}</div>
                </div>
                
                <div className="service-number">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MASTERY SECTION - Split Screen */}
      <section className="mastery-section animate-on-scroll">
        <div className="mastery-container">
          <div className="master-portrait">
            <div className="portrait-frame-master">
              <div className="master-image">
                <div className="master-placeholder"></div>
                <div className="renaissance-lighting"></div>
              </div>
            </div>
          </div>
          
          <div className="mastery-content">
            <div className="experience-number">
              <span className="number-large">25</span>
              <span className="number-label">YEARS</span>
                </div>
            
            <div className="mastery-text">
              <h2 className="mastery-title">ALESSANDRO FERRI</h2>
              <p className="mastery-description">
                Master craftsman whose hands have shaped the finest gentlemen 
                of our time. Each cut is a meditation, each shave a ceremony 
                steeped in tradition yet informed by innovation.
              </p>
              
              <div className="mastery-philosophy">
                <blockquote>
                  "Perfection is not achieved when there is nothing left to add, 
                  but when there is nothing left to take away."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY - Art Pieces */}
      <section className="transformation-gallery animate-on-scroll">
        <div className="gallery-header">
          <h2 className="gallery-title">TRANSFORMATIONS</h2>
          <p className="gallery-subtitle">Each client's journey, captured as art</p>
        </div>
        
        <div className="gallery-grid">
          {Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index} 
              className="gallery-item"
              onMouseEnter={() => handleCursorEnter('expand')}
              onMouseLeave={handleCursorLeave}
            >
              <div className="gallery-image">
                <div className="before-after">
                  <div className="image-before"></div>
                  <div className="image-after"></div>
                  <div className="reveal-mask"></div>
                </div>
              </div>
              <div className="gallery-caption">
                <span className="client-initial">{String.fromCharCode(65 + index)}</span>
                <span className="transformation-date">2024</span>
              </div>
              </div>
            ))}
        </div>
      </section>

      {/* CONTACT - Minimal Elegance */}
      <section className="contact-section animate-on-scroll">
        <div className="contact-container">
          <div className="contact-form-area">
            <h2 className="contact-title">REQUEST CONSULTATION</h2>
            
            <form className="premium-form">
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder=" "
                  onMouseEnter={() => handleCursorEnter('text')}
                  onMouseLeave={handleCursorLeave}
                />
                <label className="form-label">Full Name</label>
                <div className="form-line"></div>
              </div>
              
              <div className="form-group">
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder=" "
                  onMouseEnter={() => handleCursorEnter('text')}
                  onMouseLeave={handleCursorLeave}
                />
                <label className="form-label">Email Address</label>
                <div className="form-line"></div>
              </div>
              
              <div className="form-group">
                <textarea 
                  className="form-input form-textarea" 
                  placeholder=" "
                  onMouseEnter={() => handleCursorEnter('text')}
                  onMouseLeave={handleCursorLeave}
                ></textarea>
                <label className="form-label">Preferred Experience</label>
                <div className="form-line"></div>
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                onMouseEnter={() => handleCursorEnter('button')}
                onMouseLeave={handleCursorLeave}
              >
                <span className="button-text">SEND REQUEST</span>
                <div className="button-line"></div>
              </button>
            </form>
          </div>
          
          <div className="contact-info">
            <div className="info-section">
              <h3 className="info-title">ATELIER</h3>
              <p className="info-text">
                Downtown Financial District<br/>
                By Appointment Only
              </p>
            </div>
            
            <div className="info-section">
              <h3 className="info-title">HOURS</h3>
              <p className="info-text">
                Tuesday — Saturday<br/>
                10:00 — 19:00
              </p>
            </div>
            
            <div className="info-section">
              <h3 className="info-title">INQUIRIES</h3>
              <p className="info-text">
                appointments@barbaros.com<br/>
                +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER - Minimal */}
      <footer className="premium-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo">BARBAROS</span>
            <span className="footer-year">MMXXIV</span>
          </div>
          
          <div className="footer-links">
            <Link 
              href="/login"
              onMouseEnter={() => handleCursorEnter('button')}
              onMouseLeave={handleCursorLeave}
            >
              CLIENT PORTAL
            </Link>
            <Link 
              href="/reservations/new"
              onMouseEnter={() => handleCursorEnter('button')}
              onMouseLeave={handleCursorLeave}
            >
              BOOK CONSULTATION
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 