'use client';

import { useState, useRef, useEffect } from 'react';
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
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light mb-6 text-[var(--deep-green)]">
            Transformation Gallery
          </h2>
          <p className="text-lg font-light text-[var(--dark-brown)] opacity-70 max-w-2xl mx-auto">
            Witness the artistry of precision. Each transformation tells a story of excellence.
          </p>
        </div>

        {featuredTransformations.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {featuredTransformations.map((transformation) => (
              <div key={transformation.id} className="group cursor-pointer">
                <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
                    <Image
                      src={transformation.beforeImage}
                      alt={`${transformation.clientName} - Before`}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 text-sm rounded">
                      BEFORE
                    </div>
                  </div>
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <Image
                      src={transformation.afterImage}
                      alt={`${transformation.clientName} - After`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 text-sm rounded">
                      AFTER
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-light text-[var(--dark-brown)] mb-1">{transformation.clientName}</h3>
                  <p className="text-[var(--deep-green)] font-light">{transformation.service}</p>
                  <p className="text-sm text-[var(--dark-brown)] opacity-60 mt-2">
                    {transformation.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--dark-brown)] opacity-60 font-light">
              No featured transformations available yet.
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-block px-8 py-3 bg-[var(--deep-green)] text-white text-sm tracking-wider hover:bg-opacity-90 transition-all duration-300 rounded"
          >
            View More Pictures
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSlider; 