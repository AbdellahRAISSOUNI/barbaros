'use client';

import { useSession } from 'next-auth/react';
import ClientProfileForm from '@/components/ui/ClientProfileForm';
import { FaUser } from 'react-icons/fa';

export default function ClientProfilePage() {
  const { data: session } = useSession();
  
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 text-center">
          <div className="animate-pulse">
            <div className="h-12 w-12 mx-auto mb-4 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-32 mx-auto bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-48 mx-auto bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-amber-500/20">
            <FaUser className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600">Manage your personal information</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/50">
        <ClientProfileForm />
      </div>
    </div>
  );
} 