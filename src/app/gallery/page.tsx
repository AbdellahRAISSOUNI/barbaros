'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
      <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
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
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
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
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
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
  const featuredTransformations = transformations.filter(t => t.featured).slice(0, 2);

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
    <div className="min-h-screen bg-[var(--off-white)]">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--off-white)]" />
        
        {/* Home Button */}
        <div className="absolute top-8 left-8 z-20">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-[var(--deep-green)] text-white text-sm tracking-wider hover:bg-opacity-90 transition-all duration-300 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            HOME
          </Link>
        </div>
        
        <div className="relative z-10 text-center px-8">
          <h1 className="text-[60px] md:text-[120px] lg:text-[140px] leading-[0.8] tracking-tighter mb-8 text-[var(--dark-brown)]">
            GALLERY
          </h1>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-xs md:text-sm font-light tracking-[0.3em] text-[var(--dark-brown)] mb-12">
            <span>PRECISION</span>
            <span className="hidden md:block w-16 h-[1px] bg-[var(--deep-green)] opacity-30" />
            <span>ARTISTRY</span>
            <span className="hidden md:block w-16 h-[1px] bg-[var(--deep-green)] opacity-30" />
            <span>TRANSFORMATION</span>
          </div>
          <p className="text-lg md:text-xl font-light text-[var(--dark-brown)] opacity-70 max-w-3xl mx-auto leading-relaxed">
            Witness the artistry of precision. Each transformation tells a story of excellence, 
            crafted by master barbers who understand that every detail matters.
          </p>
        </div>

        {/* Background Image */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[700px] h-[500px] opacity-[0.06]">
          <Image
            src="/images/barber-tools.jpg"
            alt="Barber tools"
            fill
            className="object-cover filter grayscale"
            priority
          />
        </div>
      </section>

      {/* Gallery Content */}
      <div className="relative bg-[var(--warm-beige)] bg-opacity-5">
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-20">

          {/* Category Filter */}
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-light mb-8 text-[var(--deep-green)]">Filter by Style</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 text-sm font-light tracking-wider transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-[var(--deep-green)] text-white'
                      : 'bg-transparent text-[var(--dark-brown)] border border-[var(--deep-green)] border-opacity-20 hover:border-[var(--deep-green)]'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Transformations */}
          {featuredTransformations.length > 0 && selectedCategory === 'all' && (
            <div className="mb-20">
              <h2 className="text-2xl md:text-3xl font-light text-center mb-12 text-[var(--deep-green)]">
                Featured Transformations
              </h2>
              <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                {featuredTransformations.map((transformation) => (
                  <div key={transformation.id} className="group">
                    <ImageCarousel
                      beforeImages={transformation.beforeImages}
                      afterImages={transformation.afterImages}
                      clientName={transformation.clientName}
                    />
                    <div className="mt-6 text-center">
                      <h3 className="text-xl font-light text-[var(--dark-brown)] mb-2">
                        {transformation.clientName}
                      </h3>
                      <p className="text-[var(--deep-green)] font-light mb-1">
                        {transformation.service}
                      </p>
                      <p className="text-[var(--dark-brown)] text-sm opacity-60">
                        {transformation.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Transformations Grid */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-light text-center mb-12 text-[var(--deep-green)]">
              {selectedCategory === 'all' ? 'Complete Collection' : `${selectedCategory} Transformations`}
            </h2>
            
            {filteredTransformations.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[var(--dark-brown)] opacity-60 text-lg font-light">
                  {selectedCategory === 'all' 
                    ? 'No transformations available yet.' 
                    : `No ${selectedCategory.toLowerCase()} transformations found.`
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {filteredTransformations.map((transformation) => (
                  <div key={transformation.id} className="group">
                    <ImageCarousel
                      beforeImages={transformation.beforeImages}
                      afterImages={transformation.afterImages}
                      clientName={transformation.clientName}
                    />
                    <div className="mt-6 text-center">
                      <h3 className="text-lg font-light text-[var(--dark-brown)] mb-1">
                        {transformation.clientName}
                      </h3>
                      <p className="text-[var(--deep-green)] font-light text-sm mb-1">
                        {transformation.service}
                      </p>
                      <p className="text-[var(--dark-brown)] text-sm opacity-60 mb-2">
                        {transformation.description}
                      </p>
                      {transformation.featured && (
                        <span className="inline-block px-3 py-1 bg-[var(--deep-green)] bg-opacity-10 text-[var(--deep-green)] text-xs font-light tracking-wider">
                          FEATURED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="text-center py-16 border-t border-[var(--deep-green)] border-opacity-10">
            <h3 className="text-2xl md:text-3xl font-light text-[var(--deep-green)] mb-6">
              Ready for Your Transformation?
            </h3>
            <p className="text-[var(--dark-brown)] opacity-70 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
              Experience the same level of artistry and attention to detail. 
              Book your appointment today and join our gallery of satisfied clients.
            </p>
            <Link
              href="/"
              className="inline-block px-12 py-4 bg-[var(--oxblood)] text-white text-sm tracking-widest hover:bg-opacity-90 transition-all duration-300"
            >
              BOOK YOUR APPOINTMENT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 