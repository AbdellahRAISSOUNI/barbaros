'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BarberHistoryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to visits page since they serve the same purpose
    router.replace('/barber/visits');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to visits...</p>
      </div>
    </div>
  );
}
