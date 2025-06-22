'use client';

import { useState } from 'react';
import { FaCamera, FaUpload, FaSearch, FaQrcode, FaTimes, FaCheckCircle, FaExclamationCircle, FaUser, FaPlus, FaHistory } from 'react-icons/fa';
import { QRCodeScanner } from '@/components/ui/QRCodeScanner';
import { ClientLookup } from '@/components/ui/ClientLookup';
import { ClientInfoCard } from '@/components/ui/ClientInfoCard';
import RewardRedemptionInterface from '@/components/ui/RewardRedemptionInterface';
import { VisitRecordingForm } from '@/components/ui/VisitRecordingForm';
import { parseQRCodeData } from '@/lib/utils/qrcode';
import jsQR from 'jsqr';

type ScanMode = 'camera' | 'upload' | 'manual';
type PageMode = 'scanner' | 'visit' | 'rewards';

export default function BarberScannerPage() {
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
  const [pageMode, setPageMode] = useState<PageMode>('scanner');
  const [foundClientId, setFoundClientId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClientFound = (clientId: string) => {
    setFoundClientId(clientId);
    setScanError(null);
    setSuccessMessage('Client found successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleScanError = (error: string) => {
    setScanError(error);
    setSuccessMessage(null);
  };

  const handleReset = () => {
    setFoundClientId(null);
    setScanError(null);
    setSuccessMessage(null);
    setIsScanning(false);
    setPageMode('scanner');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      handleScanError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      handleScanError('Image file is too large. Please select a file under 10MB');
      return;
    }

    try {
      setIsScanning(true);
      setScanError(null);

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Unable to get canvas context');
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (qrCode) {
        const parsedData = parseQRCodeData(qrCode.data);
        
        if (parsedData && parsedData.id && parsedData.type === 'barbaros-client') {
          handleClientFound(parsedData.id);
        } else {
          if (/^[0-9a-fA-F]{24}$/.test(qrCode.data)) {
            handleClientFound(qrCode.data);
          } else if (/^C[A-Za-z0-9]{8}$/.test(qrCode.data)) {
            handleClientFound(qrCode.data);
          } else if (qrCode.data && qrCode.data.length >= 5) {
            handleClientFound(qrCode.data);
          } else {
            handleScanError('This QR code does not appear to be a valid Barbaros client code.');
          }
        }
      } else {
        handleScanError('No QR code detected in this image. Please try a different image.');
      }
    } catch (error: any) {
      if (error.message?.includes('Failed to read file')) {
        handleScanError('Unable to read the selected file. Please try a different image.');
      } else if (error.message?.includes('Failed to load image')) {
        handleScanError('Invalid image format. Please select a valid image file.');
      } else {
        handleScanError('Failed to scan the image. Please try again with a clearer image.');
      }
    } finally {
      setIsScanning(false);
      event.target.value = '';
    }
  };

  const ScanModeButton = ({ mode, icon: Icon, title, description, active }: {
    mode: ScanMode;
    icon: any;
    title: string;
    description: string;
    active: boolean;
  }) => (
    <button
      onClick={() => setScanMode(mode)}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
        active 
          ? 'border-black bg-black text-white shadow-lg' 
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <Icon className={`h-8 w-8 mb-3 ${active ? 'text-white' : 'text-gray-600'}`} />
        <h3 className={`font-semibold mb-1 ${active ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm ${active ? 'text-gray-200' : 'text-gray-500'}`}>{description}</p>
      </div>
    </button>
  );

  // If client is found, show actions
  if (foundClientId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {pageMode === 'visit' ? 'Record Visit' : 
               pageMode === 'rewards' ? 'Client Rewards' : 'Client Found'}
            </h1>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <FaCheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          )}

          {pageMode === 'scanner' && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPageMode('visit')}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FaPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Record New Visit</h3>
                    <p className="text-gray-600">Add services and record a visit for this client</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPageMode('rewards')}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <FaUser className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">View Rewards</h3>
                    <p className="text-gray-600">Check loyalty status and redeem rewards</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          <div className="mb-6">
            <ClientInfoCard clientId={foundClientId} />
          </div>

          {pageMode === 'visit' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <VisitRecordingForm
                clientInfo={{
                  id: foundClientId,
                  name: '',
                  email: '',
                  phoneNumber: '',
                  loyaltyPoints: 0,
                  totalVisits: 0,
                  lastVisit: null,
                  qrCode: ''
                }}
                onSuccess={() => {
                  setSuccessMessage('Visit recorded successfully!');
                  setTimeout(() => handleReset(), 2000);
                }}
                onCancel={() => setPageMode('scanner')}
              />
            </div>
          )}

          {pageMode === 'rewards' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <RewardRedemptionInterface 
                clientId={foundClientId}
                onRedemption={() => {
                  setSuccessMessage('Reward redeemed successfully!');
                  setTimeout(() => setPageMode('scanner'), 2000);
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main scanner interface
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Scanner</h1>
          <p className="text-gray-600">Scan QR codes, upload images, or search manually to find clients</p>
        </div>

        {scanError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <FaExclamationCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-800">{scanError}</p>
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScanModeButton
            mode="camera"
            icon={FaCamera}
            title="Camera Scan"
            description="Use your device camera to scan QR codes in real-time"
            active={scanMode === 'camera'}
          />
          <ScanModeButton
            mode="upload"
            icon={FaUpload}
            title="Upload Image"
            description="Upload an image containing a QR code"
            active={scanMode === 'upload'}
          />
          <ScanModeButton
            mode="manual"
            icon={FaSearch}
            title="Manual Search"
            description="Search for clients by name, phone, or ID"
            active={scanMode === 'manual'}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {scanMode === 'camera' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <FaQrcode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Scanner</h3>
                <p className="text-gray-600">Position the client's QR code within the camera frame</p>
              </div>
              <QRCodeScanner
                onScanSuccess={(data) => {
                  const parsedData = parseQRCodeData(data);
                  if (parsedData && parsedData.id && parsedData.type === 'barbaros-client') {
                    handleClientFound(parsedData.id);
                  } else {
                    if (/^[0-9a-fA-F]{24}$/.test(data) || /^C[A-Za-z0-9]{8}$/.test(data)) {
                      handleClientFound(data);
                    } else {
                      handleScanError('Invalid QR code format. Please scan a valid client QR code.');
                    }
                  }
                }}
                onScanError={handleScanError}
              />
            </div>
          )}

          {scanMode === 'upload' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <FaUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload QR Code Image</h3>
                <p className="text-gray-600">Select an image file containing a QR code to scan</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isScanning}
                  />
                </label>
                
                {isScanning && (
                  <div className="mt-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                    <p className="text-sm text-gray-600 mt-2">Scanning image for QR code...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {scanMode === 'manual' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <FaSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Client Search</h3>
                <p className="text-gray-600">Search for clients by name, phone number, or client ID</p>
              </div>
              <ClientLookup
                onClientSelect={(client) => {
                  handleClientFound(client.id);
                }}
                onError={handleScanError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
