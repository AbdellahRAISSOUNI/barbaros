'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';

export function BarberHeader() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <header className="bg-white shadow-sm fixed w-full lg:static z-20 px-4 py-4 lg:px-8 hidden lg:block">
      <div className="flex justify-between items-center">        
        {/* User dropdown */}
        <div className="relative ml-auto" ref={dropdownRef}>
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <FaUserCircle className="text-gray-500 text-xl" />
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-700">
              {session?.user?.name || 'Barber'}
            </span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'Barber'}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email || 'barber@example.com'}</p>
              </div>
              
              <Link 
                href="/barber/profile" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaUserCircle className="mr-2" />
                Your Profile
              </Link>
              
              <button
                onClick={handleSignOut}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
              >
                <FaSignOutAlt className="mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 