'use client';

import { useState } from 'react';
import { ClientSidebar } from '@/components/shared/ClientSidebar';
import { ClientHeader } from '@/components/shared/ClientHeader';
import { AuthCheck } from '@/components/shared/AuthCheck';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthCheck clientOnly>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        {/* Sidebar */}
        <ClientSidebar onCollapsedChange={setSidebarCollapsed} />

        {/* Main Content */}
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
          }`}
        >
          <ClientHeader />
          <main 
            className={`flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 pt-8 lg:pt-8 pb-20 lg:pb-8 transition-all duration-300`}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthCheck>
  );
} 