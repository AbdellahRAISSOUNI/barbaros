'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthCheckProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  clientOnly?: boolean;
}

export function AuthCheck({ children, adminOnly = false, clientOnly = false }: AuthCheckProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (adminOnly && session.user.userType !== 'admin') {
      router.push('/login');
      return;
    }
    
    if (clientOnly && session.user.userType !== 'client') {
      router.push('/login');
      return;
    }
  }, [session, status, router, adminOnly, clientOnly]);
  
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return null;
  }
  
  if (adminOnly && session.user.userType !== 'admin') {
    return null;
  }
  
  if (clientOnly && session.user.userType !== 'client') {
    return null;
  }
  
  return <>{children}</>;
} 