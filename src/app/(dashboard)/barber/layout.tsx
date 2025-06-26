'use client';

import { useState } from 'react';
import { BarberSidebar } from '@/components/shared/BarberSidebar';
import { AuthCheck } from '@/components/shared/AuthCheck';
import { BarberHeader } from '@/components/shared/BarberHeader';
import { Toaster } from 'react-hot-toast';

export default function BarberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthCheck barberOnly>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        {/* Sidebar */}
        <BarberSidebar onCollapsedChange={setSidebarCollapsed} />

        {/* Main Content */}
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
          }`}
        >
          <BarberHeader />
          <main 
            className={`flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 pt-8 lg:pt-8 pb-20 lg:pb-8 transition-all duration-300`}
          >
            {children}
          </main>
        </div>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </AuthCheck>
  );
} 