'use client';

import { useSession } from 'next-auth/react';
import ClientProfileForm from '@/components/ui/ClientProfileForm';
import DataExportCenter from '@/components/ui/DataExportCenter';

export default function ClientProfilePage() {
  const { data: session } = useSession();
  
  if (!session?.user?.id) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Loading Profile...</h2>
        <p className="text-gray-600">Please wait while we load your profile information.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information, account settings, and data exports</p>
      </div>
      
      <ClientProfileForm />
      
      {/* Data Export Section */}
      <div className="mt-8">
        <DataExportCenter clientId={session.user.id} />
      </div>
    </div>
  );
} 