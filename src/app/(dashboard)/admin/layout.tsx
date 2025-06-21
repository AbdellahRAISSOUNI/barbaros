'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/shared/AdminSidebar';
import { AuthCheck } from '@/components/shared/AuthCheck';
import { AdminHeader } from '@/components/shared/AdminHeader';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthCheck adminOnly>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar onCollapsedChange={setSidebarCollapsed} />

        {/* Main Content */}
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
          }`}
        >
          <AdminHeader />
          <main 
            className={`flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8 transition-all duration-300`}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthCheck>
  );
} 