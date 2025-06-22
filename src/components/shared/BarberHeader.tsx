'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FaUser, FaSignOutAlt, FaChevronDown, FaBell } from 'react-icons/fa';

export function BarberHeader() {
  const { data: session } = useSession();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:relative fixed top-0 left-0 right-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'Barber'}!
            </h1>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <FaBell className="h-5 w-5" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-300">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'Profile'}
                      className="h-8 w-8 object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center">
                      <FaUser className="text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {session?.user?.name || 'Barber'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session?.user?.role || 'barber'}
                  </div>
                </div>
                <FaChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {session?.user?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session?.user?.email}
                    </div>
                  </div>
                  
                  <a
                    href="/barber/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <FaUser className="mr-3 h-4 w-4" />
                    My Profile
                  </a>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FaSignOutAlt className="mr-3 h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  );
} 