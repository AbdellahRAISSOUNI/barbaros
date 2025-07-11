'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Transformation {
  id: string;
  beforeImage: string;
  afterImage: string;
  beforeImages: string[];
  afterImages: string[];
  clientName: string;
  service: string;
  description: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

interface DraggableBeforeAfterProps {
  beforeImages: string[];
  afterImages: string[];
  clientName: string;
  compact?: boolean;
}

const DraggableBeforeAfter = ({ beforeImages, afterImages, clientName, compact = false }: DraggableBeforeAfterProps) => {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [currentBeforeIndex, setCurrentBeforeIndex] = useState(0);
  const [currentAfterIndex, setCurrentAfterIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updatePosition(e.clientX);
  }, [isDragging, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updatePosition(e.touches[0].clientX);
  }, [isDragging, updatePosition]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    } else {
      // Restore text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const nextBefore = () => {
    setCurrentBeforeIndex((prev) => (prev + 1) % beforeImages.length);
  };

  const prevBefore = () => {
    setCurrentBeforeIndex((prev) => (prev - 1 + beforeImages.length) % beforeImages.length);
  };

  const nextAfter = () => {
    setCurrentAfterIndex((prev) => (prev + 1) % afterImages.length);
  };

  const prevAfter = () => {
    setCurrentAfterIndex((prev) => (prev - 1 + afterImages.length) % afterImages.length);
  };

  const aspectRatio = compact ? "aspect-[4/5]" : "aspect-[3/4]";
  const handleSize = compact ? "w-10 h-10" : "w-12 h-12";
  const labelSize = compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="group">
      <div 
        ref={containerRef}
        className={`relative ${aspectRatio} overflow-hidden rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200/50`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ userSelect: 'none', touchAction: 'none' }}
      >
        {/* After Image (Background) */}
        <div className="absolute inset-0">
          <Image
            src={afterImages[currentAfterIndex]}
            alt={`${clientName} - After ${currentAfterIndex + 1}`}
            fill
            className="object-cover"
            priority={currentAfterIndex === 0}
            draggable={false}
          />
          
          {/* After Navigation */}
          {afterImages.length > 1 && !compact && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevAfter(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-20"
                aria-label="Previous after image"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextAfter(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-20"
                aria-label="Next after image"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              
              {/* After Dots */}
              <div className="absolute bottom-4 right-4 flex gap-1 z-20">
                {afterImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentAfterIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentAfterIndex === index ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`After image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className={`absolute top-4 right-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white ${labelSize} font-light tracking-wider rounded-full shadow-lg backdrop-blur-sm`}>
            AFTER
          </div>
        </div>

        {/* Before Image (Clipped) */}
        <div 
          className="absolute inset-0"
          style={{ 
            clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`,
          }}
        >
          <Image
            src={beforeImages[currentBeforeIndex]}
            alt={`${clientName} - Before ${currentBeforeIndex + 1}`}
            fill
            className="object-cover"
            priority={currentBeforeIndex === 0}
            draggable={false}
          />
          
          {/* Before Navigation */}
          {beforeImages.length > 1 && !compact && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevBefore(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-20"
                aria-label="Previous before image"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextBefore(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-20"
                aria-label="Next before image"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              
              {/* Before Dots */}
              <div className="absolute bottom-4 left-4 flex gap-1 z-20">
                {beforeImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentBeforeIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentBeforeIndex === index ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Before image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className={`absolute top-4 left-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white ${labelSize} font-light tracking-wider rounded-full shadow-lg backdrop-blur-sm`}>
            BEFORE
          </div>
        </div>

        {/* Divider Line */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-white/90 via-white to-white/90 shadow-2xl z-30"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {/* Drag Handle */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${handleSize} bg-white rounded-full shadow-2xl border-4 border-white/90 flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-grab active:cursor-grabbing`}>
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Subtle overlay for enhanced contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/5 pointer-events-none"></div>
      </div>
    </div>
  );
};

interface CarouselProps {
  beforeImages: string[];
  afterImages: string[];
  clientName: string;
}

const ImageCarousel = ({ beforeImages, afterImages, clientName }: CarouselProps) => {
  const [currentBeforeIndex, setCurrentBeforeIndex] = useState(0);
  const [currentAfterIndex, setCurrentAfterIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextBefore = () => {
    setCurrentBeforeIndex((prev) => (prev + 1) % beforeImages.length);
  };

  const prevBefore = () => {
    setCurrentBeforeIndex((prev) => (prev - 1 + beforeImages.length) % beforeImages.length);
  };

  const nextAfter = () => {
    setCurrentAfterIndex((prev) => (prev + 1) % afterImages.length);
  };

  const prevAfter = () => {
    setCurrentAfterIndex((prev) => (prev - 1 + afterImages.length) % afterImages.length);
  };

  return (
    <div 
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Before Image */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src={beforeImages[currentBeforeIndex]}
            alt={`${clientName} - Before ${currentBeforeIndex + 1}`}
            fill
            className="object-cover"
            priority={currentBeforeIndex === 0}
          />
          
          {/* Before Navigation */}
          {beforeImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevBefore(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Previous before image"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextBefore(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Next before image"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              
              {/* Before Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {beforeImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentBeforeIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentBeforeIndex === index ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Before image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Before Label */}
          <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 text-xs rounded-full">
            BEFORE
          </div>
        </div>

        {/* After Image */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src={afterImages[currentAfterIndex]}
            alt={`${clientName} - After ${currentAfterIndex + 1}`}
            fill
            className="object-cover"
          />
          
          {/* After Navigation */}
          {afterImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevAfter(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Previous after image"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextAfter(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Next after image"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              
              {/* After Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {afterImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentAfterIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentAfterIndex === index ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`After image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* After Label */}
          <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 text-xs rounded-full">
            AFTER
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GalleryPage() {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [filteredTransformations, setFilteredTransformations] = useState<Transformation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Animation refs
  const heroRef = useRef<HTMLDivElement>(null);
  const exclusiveRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Header hide/show on scroll
  useEffect(() => {
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

  // Scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [transformations]);

  const categories = [
    { id: 'all', label: 'All Transformations' },
    { id: 'Classic', label: 'Classic' },
    { id: 'Executive', label: 'Executive' },
    { id: 'Beard', label: 'Beard' },
    { id: 'Modern', label: 'Modern' },
    { id: 'Special', label: 'Special' }
  ];

  // Fetch transformations from API
  useEffect(() => {
    const fetchTransformations = async () => {
      try {
        const response = await fetch('/api/transformations/gallery');
        if (!response.ok) {
          throw new Error('Failed to fetch transformations');
        }
        const data = await response.json();
        setTransformations(data);
        setFilteredTransformations(data);
      } catch (err) {
        console.error('Error fetching transformations:', err);
        setError('Failed to load gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransformations();
  }, []);

  // Filter transformations by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredTransformations(transformations);
    } else {
      setFilteredTransformations(
        transformations.filter(t => t.category === selectedCategory)
      );
    }
  }, [selectedCategory, transformations]);

  // Get featured transformations for the hero section
  const exclusiveTransformations = transformations.filter(t => t.featured).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--deep-green)] mb-4"></div>
          <p className="text-[var(--dark-brown)] text-lg font-light">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-[var(--dark-red)] bg-opacity-10 border border-[var(--dark-red)] border-opacity-20 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-[var(--dark-red)] text-lg mb-6 font-light">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[var(--dark-red)] text-white text-sm tracking-wider hover:bg-opacity-90 transition-colors"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navigation */}
      <nav 
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
              >
                LOGIN
              </Link>
              <Link 
                href="/register"
                className="hidden md:block text-sm font-light tracking-widest text-[var(--deep-green)] hover:text-[var(--dark-red)] transition-colors duration-300"
              >
                REGISTER
              </Link>
              <Link 
                href="/reservations/new"
                className="px-12 py-4 bg-[var(--oxblood)] text-white text-xs md:text-sm tracking-widest hover:bg-opacity-90 transition-all duration-300"
              >
                RESERVE
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-[var(--off-white)]">
        {/* Optimized Hero Section */}
        <section ref={heroRef} className="min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center items-center relative overflow-hidden pt-24 pb-12">
          <div className="absolute inset-0 bg-[var(--off-white)]" />
          
          {/* Sophisticated Home Button */}
          <div className="absolute top-28 left-4 md:left-8 z-20 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <Link
              href="/"
              className="group flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 bg-[var(--deep-green)] text-white text-xs md:text-sm font-light tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#8B0000] transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ArrowLeftIcon className="w-3 md:w-4 h-3 md:h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="relative z-10 hidden sm:inline">Return Home</span>
              <span className="relative z-10 sm:hidden">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
          </div>

          <div className="relative z-10 text-center px-4 md:px-8 animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 delay-300 max-w-4xl mx-auto">
            <h1 className="text-[40px] sm:text-[60px] md:text-[90px] lg:text-[110px] leading-[0.8] tracking-tighter mb-4 md:mb-6 text-[var(--dark-brown)]">
              GALLERY
            </h1>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-8 text-xs md:text-sm font-light tracking-[0.3em] text-[var(--dark-brown)]">
              <span>ARTISTRY</span>
              <span className="hidden sm:block w-12 md:w-16 h-[1px] bg-[var(--deep-green)] opacity-30" />
              <span>EXCELLENCE</span>
              <span className="hidden sm:block w-12 md:w-16 h-[1px] bg-[var(--deep-green)] opacity-30" />
              <span>PRECISION</span>
            </div>
          </div>
        </section>

                 {/* Exclusive Transformations - Horizontal Showcase */}
         {exclusiveTransformations.length > 0 && (
           <section ref={exclusiveRef} className="py-12 md:py-16 bg-gradient-to-b from-[var(--warm-beige)] to-[var(--off-white)] bg-opacity-10">
             <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
               <div className="text-center mb-12 md:mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
                 <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
                   <div className="w-8 md:w-12 h-[1px] bg-[var(--deep-green)]"></div>
                   <span className="text-xs tracking-[0.4em] font-light text-[var(--deep-green)] opacity-60">
                     SIGNATURE COLLECTIONS
                   </span>
                   <div className="w-8 md:w-12 h-[1px] bg-[var(--deep-green)]"></div>
                 </div>
                 <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[var(--deep-green)] tracking-wide mb-3 md:mb-4">
                   Exclusive Masterpieces
                 </h2>
                 <p className="text-base md:text-lg font-light text-[var(--dark-brown)] opacity-70 max-w-2xl mx-auto px-4">
                   Handpicked transformations that showcase the pinnacle of our craftsmanship
                 </p>
               </div>

               {/* Horizontal scrolling showcase */}
               <div className="overflow-x-auto pb-4 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
                 <div className="flex gap-6 md:gap-8 min-w-max px-4 md:px-0">
                   {exclusiveTransformations.map((transformation, index) => (
                     <div key={transformation.id} className="flex-shrink-0 w-72 md:w-80 space-y-3 md:space-y-4">
                       <DraggableBeforeAfter
                         beforeImages={transformation.beforeImages?.length > 0 ? transformation.beforeImages : [transformation.beforeImage]}
                         afterImages={transformation.afterImages?.length > 0 ? transformation.afterImages : [transformation.afterImage]}
                         clientName={transformation.clientName}
                         compact={true}
                       />
                       <div className="text-center px-2 md:px-4">
                         <h3 className="text-lg md:text-xl font-light text-[var(--dark-brown)] mb-1 md:mb-2 tracking-wide">
                           {transformation.clientName}
                         </h3>
                         <p className="text-[var(--deep-green)] font-light mb-1 md:mb-2 tracking-wide text-sm md:text-base">
                           {transformation.service}
                         </p>
                         <p className="text-[var(--dark-brown)] opacity-70 font-light leading-relaxed text-xs md:text-sm">
                           {transformation.description}
                         </p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </section>
         )}

                 {/* Main Gallery Grid */}
         <section ref={galleryRef} className="py-12 md:py-16 pb-16 md:pb-20">
           <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
             {/* Category Filter */}
             <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12 md:mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
               {categories.map((category) => (
                 <button
                   key={category.id}
                   onClick={() => setSelectedCategory(category.id)}
                   className={`px-4 md:px-8 py-2 md:py-3 text-xs md:text-sm font-light tracking-wider transition-all duration-300 ${
                     selectedCategory === category.id
                       ? 'bg-[var(--deep-green)] text-white shadow-lg'
                       : 'bg-white text-[var(--deep-green)] hover:bg-[var(--deep-green)] hover:text-white border border-[var(--deep-green)] border-opacity-20'
                   }`}
                 >
                   {category.label}
                 </button>
               ))}
             </div>

             {/* Transformations Grid */}
             {filteredTransformations.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                 {filteredTransformations.map((transformation, index) => (
                   <div 
                     key={transformation.id} 
                     className="space-y-3 md:space-y-4 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700"
                     style={{ transitionDelay: `${index * 50}ms` }}
                   >
                     <ImageCarousel
                       beforeImages={transformation.beforeImages?.length > 0 ? transformation.beforeImages : [transformation.beforeImage]}
                       afterImages={transformation.afterImages?.length > 0 ? transformation.afterImages : [transformation.afterImage]}
                       clientName={transformation.clientName}
                     />
                     <div className="text-center space-y-1 md:space-y-2">
                       <h3 className="text-sm md:text-lg font-light text-[var(--dark-brown)]">
                         {transformation.clientName}
                       </h3>
                       <p className="text-[var(--deep-green)] font-light text-xs md:text-sm">
                         {transformation.service}
                       </p>
                       <p className="text-xs text-[var(--dark-brown)] opacity-60 leading-relaxed hidden md:block">
                         {transformation.description}
                       </p>
                       <p className="text-xs text-[var(--deep-green)] opacity-50 uppercase tracking-wider">
                         {transformation.category}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-16 md:py-20 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
                 <p className="text-[var(--dark-brown)] opacity-60 text-base md:text-lg font-light">
                   No transformations found in this category.
                 </p>
               </div>
             )}
           </div>
         </section>
      </div>

      <style jsx>{`
        .animate-fade-in-up {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </>
  );
} 