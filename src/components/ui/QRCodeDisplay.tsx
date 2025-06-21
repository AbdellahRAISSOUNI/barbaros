'use client';

import { useState, useEffect } from 'react';
import { generateQRCodeDataURL, downloadQRCode } from '@/lib/utils/qrcode';
import { FaDownload, FaShare } from 'react-icons/fa';

interface QRCodeDisplayProps {
  clientId: string;
  clientName?: string;
  size?: number;
  showDownload?: boolean;
  showShare?: boolean;
  className?: string;
}

export function QRCodeDisplay({
  clientId,
  clientName,
  size = 300,
  showDownload = true,
  showShare = true,
  className = '',
}: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState<boolean>(false);

  useEffect(() => {
    // Check if Web Share API is available
    setCanShare('share' in navigator);
  }, []);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const dataUrl = await generateQRCodeDataURL(clientId, {
          width: size,
        });
        
        setQrCodeUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      generateQRCode();
    }
  }, [clientId, size]);

  const handleDownload = () => {
    if (qrCodeUrl) {
      const filename = `barbaros-${clientName || clientId}.png`;
      downloadQRCode(qrCodeUrl, filename);
    }
  };

  const handleShare = async () => {
    if (!qrCodeUrl || !canShare) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      // Create a File object
      const file = new File([blob], `barbaros-qrcode.png`, { type: 'image/png' });
      
      await navigator.share({
        title: 'Barbaros QR Code',
        text: 'My Barbaros QR Code for the loyalty program',
        files: [file],
      });
    } catch (err) {
      console.error('Error sharing QR code:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center ${className}`} style={{ minHeight: `${size}px` }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col justify-center items-center ${className}`} style={{ minHeight: `${size}px` }}>
        <div className="text-red-500 mb-2">Failed to generate QR code</div>
        <button 
          onClick={() => setIsLoading(true)}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* QR Code Image */}
      <div className="border-4 border-black p-4 rounded-lg mb-4">
        <img 
          src={qrCodeUrl} 
          alt="Client QR Code" 
          className="max-w-full"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      </div>
      
      {/* Client Info */}
      {clientName && (
        <div className="text-center mb-4">
          <p className="font-medium">{clientName}</p>
        </div>
      )}
      
      {/* Action Buttons */}
      {(showDownload || showShare) && (
        <div className="flex gap-4">
          {showDownload && (
            <button 
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-black text-white rounded-md"
            >
              <FaDownload className="mr-2" />
              Download
            </button>
          )}
          
          {showShare && canShare && (
            <button 
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md"
            >
              <FaShare className="mr-2" />
              Share
            </button>
          )}
        </div>
      )}
    </div>
  );
} 