'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaDownload, FaSpinner, FaQrcode } from 'react-icons/fa';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && contentRef.current) {
        const target = event.target as Element;
        if (modalRef.current.contains(target) && !contentRef.current.contains(target)) {
          onClose();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
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
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
    >
      <div
        ref={contentRef}
        className={`bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FaQrcode className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Client QR Code</h2>
              <p className="text-sm text-gray-600">Scan to access client information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="text-center">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">{clientName}</h3>
              <p className="text-sm text-gray-500">Client ID: {clientId}</p>
            </div>
            
            {/* QR Code Display */}
            <div className="relative mx-auto w-64 h-64 border-2 border-gray-200 rounded-xl bg-white flex items-center justify-center mb-6 shadow-md">
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
                  className="w-full h-full object-contain rounded-lg p-2"
                />
              ) : null}
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Scan this QR code to quickly access client information and record visits.
            </p>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              {qrCodeDataUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors gap-2"
                >
                  <FaDownload className="w-4 h-4" />
                  Download
                </button>
              )}
              <button
                onClick={onClose}
                className="flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
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