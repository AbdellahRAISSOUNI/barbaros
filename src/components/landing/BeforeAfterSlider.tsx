'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
}

const DraggableBeforeAfter = ({ transformation }: { transformation: Transformation }) => {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
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

  return (
    <div className="group">
      <div 
        ref={containerRef}
        className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200/50"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ userSelect: 'none', touchAction: 'none' }}
      >
        {/* After Image (Background) */}
        <div className="absolute inset-0">
          <Image
            src={transformation.afterImage}
            alt={`${transformation.clientName} - After`}
            fill
            className="object-cover"
            priority
            draggable={false}
          />
          <div className="absolute top-6 right-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 text-sm font-light tracking-wider rounded-full shadow-lg backdrop-blur-sm">
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
            src={transformation.beforeImage}
            alt={`${transformation.clientName} - Before`}
            fill
            className="object-cover"
            priority
            draggable={false}
          />
          <div className="absolute top-6 left-6 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 text-sm font-light tracking-wider rounded-full shadow-lg backdrop-blur-sm">
            BEFORE
          </div>
        </div>

        {/* Divider Line */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-white/90 via-white to-white/90 shadow-2xl"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {/* Drag Handle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl border-4 border-white/90 flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-grab active:cursor-grabbing">
            <div className="flex space-x-1">
              <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Subtle overlay for enhanced contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/5 pointer-events-none"></div>
      </div>

      {/* Enhanced Text Content */}
      <div className="text-center mt-6 px-4">
        <h3 className="text-2xl font-light text-[var(--dark-brown)] mb-2 tracking-wide">
          {transformation.clientName}
        </h3>
        <p className="text-[var(--deep-green)] font-light text-lg mb-3 tracking-wide">
          {transformation.service}
        </p>
        <p className="text-[var(--dark-brown)] opacity-70 font-light leading-relaxed max-w-md mx-auto">
          {transformation.description}
        </p>
      </div>
    </div>
  );
};

const BeforeAfterSlider = () => {
  const [featuredTransformations, setFeaturedTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTransformations = async () => {
      try {
        const response = await fetch('/api/transformations/gallery');
        if (response.ok) {
          const data = await response.json();
          const featured = data.filter((t: Transformation) => t.featured).slice(0, 2);
          setFeaturedTransformations(featured);
        }
      } catch (error) {
        console.error('Error fetching featured transformations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTransformations();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen flex items-center bg-gradient-to-b from-[var(--warm-beige)] to-[var(--off-white)] bg-opacity-10">
        <div className="max-w-6xl mx-auto px-8 md:px-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--deep-green)]"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center bg-gradient-to-b from-[var(--warm-beige)] to-[var(--off-white)] bg-opacity-10">
      <div className="max-w-6xl mx-auto px-8 md:px-16">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light mb-8 text-[var(--deep-green)] tracking-wide">
            Signature Transformations
          </h2>
          <p className="text-xl font-light text-[var(--dark-brown)] opacity-80 max-w-3xl mx-auto leading-relaxed">
            Witness the artistry of precision. Each transformation tells a story of excellence, 
            crafted with unparalleled attention to detail.
          </p>
        </div>

        {featuredTransformations.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-16 mb-16">
            {featuredTransformations.map((transformation) => (
              <DraggableBeforeAfter 
                key={transformation.id} 
                transformation={transformation}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[var(--dark-brown)] opacity-60 font-light text-lg">
              Exclusive transformations coming soon.
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/gallery"
            className="group relative inline-block cursor-pointer"
          >
            <div className="relative px-12 py-4 bg-[var(--deep-green)] text-white text-sm font-light tracking-[0.2em] uppercase transition-all duration-300 group-hover:bg-[#8B0000] transform group-hover:scale-105 shadow-lg group-hover:shadow-xl">
              <span className="relative z-10">Explore Complete Gallery</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSlider; 