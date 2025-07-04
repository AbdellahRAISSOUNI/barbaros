'use client';

import { FaQrcode, FaBan, FaClock, FaUserShield } from 'react-icons/fa';
import { useEffect, useState } from 'react';

interface ScannerStatus {
  scannerEnabled: boolean;
  globalEnabled: boolean;
  individualEnabled: boolean;
  disabledUntil?: string;
  autoDisableHours: number;
}

export default function ScannerDisabledPage() {
  const [status, setStatus] = useState<ScannerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScannerStatus();
  }, []);

  const fetchScannerStatus = async () => {
    try {
      const response = await fetch('/api/barber/scanner-status');
      const data = await response.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching scanner status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDisabledUntil = (disabledUntil: string) => {
    const date = new Date(disabledUntil);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-stone-200/60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000] mx-auto mb-4"></div>
          <p className="text-stone-600">Checking scanner status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200/60 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B0000] to-[#A31515] p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <FaBan className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Scanner Disabled</h1>
          <p className="text-white/80">Access to the scanner has been restricted</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Information */}
          <div className="space-y-4">
            {!status?.globalEnabled && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-br from-stone-50 to-amber-50/50 rounded-xl border border-stone-200/60">
                <div className="flex-shrink-0">
                  <FaUserShield className="h-5 w-5 text-[#8B0000] mt-0.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">Globally Disabled</h3>
                  <p className="text-sm text-stone-600 mt-1">
                    The scanner has been globally disabled by an administrator.
                  </p>
                  {status?.disabledUntil && (
                    <p className="text-sm text-stone-600 mt-2">
                      <FaClock className="inline h-4 w-4 mr-1" />
                      Will be re-enabled on: <br />
                      <span className="font-medium">{formatDisabledUntil(status.disabledUntil)}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {status?.globalEnabled && !status?.individualEnabled && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-br from-amber-50 to-stone-50 rounded-xl border border-amber-200/60">
                <div className="flex-shrink-0">
                  <FaUserShield className="h-5 w-5 text-amber-600 mt-0.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">Individual Access Disabled</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Your individual scanner access has been disabled by an administrator.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scanner Icon */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-stone-100 to-stone-50 rounded-2xl mb-4 shadow-sm">
              <FaQrcode className="h-10 w-10 text-stone-400" />
            </div>
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Scanner Unavailable</h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              You cannot access the QR code scanner at this time. Please contact your administrator 
              if you need scanner access restored.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-stone-50 to-amber-50/50 rounded-xl p-4 border border-stone-200/60">
            <h3 className="font-semibold text-stone-800 mb-2">Need Help?</h3>
            <p className="text-sm text-stone-600">
              Contact your administrator to request scanner access. They can enable scanner 
              permissions for your account or globally for all barbers.
            </p>
          </div>

          {/* Return Button */}
          <div className="pt-4">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-stone-600 to-stone-500 text-white rounded-xl py-3 px-4 font-medium hover:from-stone-700 hover:to-stone-600 transition-all duration-200 shadow-lg"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 