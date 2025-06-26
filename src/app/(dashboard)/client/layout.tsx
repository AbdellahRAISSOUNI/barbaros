'use client';

import { useState } from 'react';
import { ClientSidebar } from '@/components/shared/ClientSidebar';
import { ClientHeader } from '@/components/shared/ClientHeader';
import { AuthCheck } from '@/components/shared/AuthCheck';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthCheck clientOnly>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <ClientSidebar onCollapsedChange={setSidebarCollapsed} />
        </div>

        {/* Main Content */}
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
          }`}
        >
          {/* Header - Hidden on mobile */}
          <div className="hidden lg:block">
            <ClientHeader />
          </div>
          
          {/* Main Content Area */}
          <main 
            className={`flex-1 overflow-x-hidden overflow-y-auto 
              px-2 sm:px-4 lg:px-8 
              py-2 lg:py-8 
              pt-2 lg:pt-8 
              pb-20 lg:pb-8 
              transition-all duration-300`}
          >
            {children}
          </main>

          {/* Mobile Bottom Navigation - Only visible on mobile */}
          <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
            <MobileBottomNav userType="client" />
          </div>
        </div>
      </div>
    </AuthCheck>
  );
} 