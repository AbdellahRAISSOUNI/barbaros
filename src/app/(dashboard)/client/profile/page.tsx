'use client';

import { useSession } from 'next-auth/react';
import ClientProfileForm from '@/components/ui/ClientProfileForm';
import DataExportCenter from '@/components/ui/DataExportCenter';
import { FaUser, FaQrcode, FaDownload, FaShieldAlt } from 'react-icons/fa';

export default function ClientProfilePage() {
  const { data: session } = useSession();
  
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-3 rounded-xl">
              <FaUser className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Your Profile</h1>
              <p className="text-gray-600">Manage your personal information and account settings</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <ClientProfileForm />
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 p-3 rounded-xl">
                <FaQrcode className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your QR Code</h2>
                <p className="text-gray-600">Use this for quick check-in at the barbershop</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <img 
              src={`/api/clients/qrcode/${session.user.id}`} 
              alt="Your QR Code"
              className="w-48 h-48 object-contain"
            />
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-xl">
                <FaDownload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Data & Privacy</h2>
                <p className="text-gray-600">Download your data and manage privacy settings</p>
              </div>
            </div>
          </div>
          <DataExportCenter clientId={session.user.id} />
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-3 rounded-xl">
                <FaShieldAlt className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account Security</h2>
                <p className="text-gray-600">Manage your account security settings</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                Coming Soon
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Account Activity</h3>
                <p className="text-sm text-gray-600">Monitor your recent account activity</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                View Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 