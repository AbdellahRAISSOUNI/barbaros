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
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <AdminSidebar onCollapsedChange={setSidebarCollapsed} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader className="hidden lg:flex" />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthCheck>
  );
} 