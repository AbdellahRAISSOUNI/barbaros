'use client';

import { useState } from 'react';
import { FaCamera, FaUpload, FaSearch, FaQrcode, FaTimes, FaCheckCircle, FaExclamationCircle, FaUser, FaPlus, FaHistory } from 'react-icons/fa';
import { QRCodeScanner } from '@/components/ui/QRCodeScanner';
import { ClientLookup } from '@/components/ui/ClientLookup';
import { ClientInfoCard } from '@/components/ui/ClientInfoCard';
import RewardRedemptionInterface from '@/components/ui/RewardRedemptionInterface';
import { parseQRCodeData } from '@/lib/utils/qrcode';
import jsQR from 'jsqr';

type ScanMode = 'camera' | 'upload' | 'manual';

export default function ScannerPage() {
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
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
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      handleScanError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      handleScanError('Image file is too large. Please select a file under 10MB');
      return;
    }

    try {
      setIsScanning(true);
      setScanError(null);

      console.log('Processing uploaded image:', file.name, file.type, file.size);

      // Create image element
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Unable to get canvas context');
      }

      // Convert file to data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Load image
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
      });

      console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);

      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      console.log('Image data extracted, scanning for QR code...');

      // Scan for QR code using jsQR
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (qrCode) {
        console.log('QR code found:', qrCode.data);
        
        const parsedData = parseQRCodeData(qrCode.data);
        
        if (parsedData && parsedData.id && parsedData.type === 'barbaros-client') {
          console.log('Valid Barbaros QR code, client ID:', parsedData.id);
          handleClientFound(parsedData.id);
        } else {
          // Try to handle raw text as client ID (fallback with better pattern matching)
          console.log('Not a Barbaros QR code format, trying raw data:', qrCode.data);
          
          // Check if it looks like a MongoDB ObjectId (24 hex characters)
          if (/^[0-9a-fA-F]{24}$/.test(qrCode.data)) {
            console.log('Detected MongoDB ObjectId format:', qrCode.data);
            handleClientFound(qrCode.data);
          } 
          // Check if it looks like a client ID (starts with C and has numbers/letters)
          else if (/^C[A-Za-z0-9]{8}$/.test(qrCode.data)) {
            console.log('Detected client ID format:', qrCode.data);
            handleClientFound(qrCode.data);
          }
          // Try any text that looks like an ID
          else if (qrCode.data && qrCode.data.length >= 5) {
            console.log('Trying raw text as client identifier:', qrCode.data);
            handleClientFound(qrCode.data);
          } else {
            console.log('QR code data does not match expected format:', qrCode.data);
            handleScanError('This QR code does not appear to be a valid Barbaros client code. Please scan a client\'s QR code or try the manual search.');
          }
        }
      } else {
        console.log('No QR code found in image');
        handleScanError('No QR code detected in this image. Please try a different image with a clear, visible QR code.');
      }
    } catch (error: any) {
      console.error('Image scan error:', error);
      
      // Handle specific error messages
      if (error.message?.includes('Failed to read file')) {
        handleScanError('Unable to read the selected file. Please try a different image.');
      } else if (error.message?.includes('Failed to load image')) {
        handleScanError('Invalid image format. Please select a valid image file (JPG, PNG, etc.).');
      } else {
        handleScanError('Failed to scan the image. Please try again with a clearer image or different file.');
      }
    } finally {
      setIsScanning(false);
      // Clear the file input
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

  if (foundClientId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Client Found</h1>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <FaCheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="mb-6 flex flex-wrap gap-3">
            <a
              href={`/admin/clients/${foundClientId}/view`}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <FaUser className="h-4 w-4" />
              <span>View Full Profile</span>
            </a>
            <a
              href={`/admin/clients/${foundClientId}/view?tab=recording`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaPlus className="h-4 w-4" />
              <span>Record Visit</span>
            </a>
            <a
              href={`/admin/clients/${foundClientId}/view?tab=history`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <FaHistory className="h-4 w-4" />
              <span>Visit History</span>
            </a>
          </div>
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
            {/* Client Info Card */}
            <div className="min-w-0">
              <ClientInfoCard 
                clientId={foundClientId}
                onClose={handleReset}
                className="shadow-lg h-fit"
              />
            </div>
            
            {/* Loyalty & Rewards Interface */}
            <div className="min-w-0">
              <RewardRedemptionInterface
                clientId={foundClientId}
                barberName="Barber" // You can get this from session or props
                onRedemptionComplete={(redemption) => {
                  console.log('Reward redeemed:', redemption);
                  // You could refresh client data here
                }}
                className="h-fit"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
            <FaQrcode className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Scanner</h1>
          <p className="text-gray-600">Scan or upload a client's QR code to view their information</p>
        </div>

        {/* Error Message */}
        {scanError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <FaExclamationCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Scan Error</p>
              <p className="text-red-700 text-sm mt-1">{scanError}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <FaCheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Scan Mode Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <ScanModeButton
            mode="camera"
            icon={FaCamera}
            title="Camera Scan"
            description="Use device camera"
            active={scanMode === 'camera'}
          />
          <ScanModeButton
            mode="upload"
            icon={FaUpload}
            title="Upload Image"
            description="Upload QR code image"
            active={scanMode === 'upload'}
          />
          <ScanModeButton
            mode="manual"
            icon={FaSearch}
            title="Manual Search"
            description="Search by name or ID"
            active={scanMode === 'manual'}
          />
        </div>

        {/* Scan Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {scanMode === 'camera' && (
            <div className="p-6">
            <QRCodeScanner 
              onScanSuccess={handleClientFound}
              onScanError={handleScanError}
                className="w-full"
              />
            </div>
          )}

          {scanMode === 'upload' && (
            <div className="p-6">
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload QR Code Image</h3>
                  <p className="text-gray-600 mb-6">Select an image file containing a QR code</p>
                  
                  <label className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
                    <FaUpload className="h-4 w-4 mr-2" />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isScanning}
                    />
                  </label>
                  
                  {isScanning && (
                    <div className="mt-4 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mr-2"></div>
                      <span className="text-gray-600">Scanning image...</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 text-sm text-gray-500">
                  <p className="mb-2"><strong>Tips for best results:</strong></p>
                  <ul className="text-left space-y-1 max-w-md mx-auto">
                    <li>• Use a clear, high-quality image</li>
                    <li>• Ensure the QR code is fully visible</li>
                    <li>• Avoid blurry or tilted images</li>
                    <li>• Supported formats: JPG, PNG, WEBP</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {scanMode === 'manual' && (
            <div className="p-6">
            <ClientLookup 
              onClientFound={handleClientFound}
              onError={handleScanError}
            />
            </div>
          )}
        </div>

        {/* Debug Test Section */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">🛠️ Debug Testing</h4>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>For testing purposes, you can try these sample client IDs:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleClientFound('60d5ec49f1b2c8b1f8e4e1a1')}
                  className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300"
                >
                  Test MongoDB ID
                </button>
                <button
                  onClick={() => handleClientFound('C12345678')}
                  className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300"
                >
                  Test Client ID
                </button>
              </div>
              <p className="mt-2">
                <strong>Camera Issues?</strong> Make sure you're using HTTPS or localhost, and that camera permissions are enabled in your browser settings.
              </p>
              <p>
                <strong>Image Upload Issues?</strong> Try right-clicking and "Save Image As" on a QR code from the clients page, then upload it here.
              </p>
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to use the scanner:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            {scanMode === 'camera' && (
              <>
                <p>• Allow camera permissions when prompted</p>
                <p>• Point the camera at the client's QR code</p>
                <p>• Keep the QR code centered in the scanning area</p>
                <p>• Ensure good lighting for better scanning</p>
              </>
            )}
            {scanMode === 'upload' && (
              <>
                <p>• Take a photo of the QR code or save it from the screen</p>
                <p>• Upload the image using the button above</p>
                <p>• Make sure the QR code is clear and not distorted</p>
                <p>• The system will automatically detect and scan the code</p>
              </>
            )}
            {scanMode === 'manual' && (
              <>
                <p>• Search by client's first name, last name, or email</p>
                <p>• You can also search by client ID</p>
                <p>• Type at least 2 characters to start searching</p>
                <p>• Select the correct client from the results</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}