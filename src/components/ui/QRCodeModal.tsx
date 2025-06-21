'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaSpinner } from 'react-icons/fa';

interface QRCodeModalProps {
  clientId: string;
  clientName: string;
  qrCodeUrl?: string;
  onClose: () => void;
  className?: string;
}

export function QRCodeModal({
  clientId,
  clientName,
  qrCodeUrl,
  onClose,
  className = '',
}: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the API endpoint to get the QR code for this client
        const response = await fetch(`/api/clients/qrcode/${clientId}`);
        
        if (!response.ok) {
          throw new Error('Failed to generate QR code');
        }
        
        const data = await response.json();
        
        if (data.success && data.qrCode) {
          setQrCodeDataUrl(data.qrCode);
        } else {
          throw new Error('Invalid QR code response');
        }
      } catch (err) {
        console.error('Error fetching QR code:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchQRCode();
    }
  }, [clientId]);

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `barbaros-qr-${clientName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Client QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            aria-label="Close"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">{clientName}</h3>
              <p className="text-sm text-gray-500">Client ID: {clientId}</p>
            </div>
            
            {/* QR Code Display */}
            <div className="relative mx-auto w-64 h-64 border-2 border-gray-200 rounded-lg bg-white flex items-center justify-center mb-6">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <FaSpinner className="animate-spin h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Generating QR code...</p>
                </div>
              ) : error ? (
                <div className="text-center p-4">
                  <p className="text-red-500 text-sm mb-2">Failed to generate QR code</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Try again
                  </button>
                </div>
              ) : qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt={`QR Code for ${clientName}`} 
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : null}
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Scan this QR code to quickly access client information and record visits.
            </p>
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              {qrCodeDataUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <FaDownload className="h-4 w-4 mr-2" />
                  Download
                </button>
              )}
              <button
                onClick={onClose}
                className="flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}