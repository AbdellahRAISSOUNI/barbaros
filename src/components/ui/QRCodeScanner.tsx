'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { parseQRCodeData } from '@/lib/utils/qrcode';
import { FaCamera, FaStop, FaSearch, FaCog, FaSpinner } from 'react-icons/fa';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
  onScanSuccess: (clientId: string) => void;
  onScanError?: (error: string) => void;
  onManualEntry?: () => void;
  className?: string;
}

export function QRCodeScanner({
  onScanSuccess,
  onScanError,
  onManualEntry,
  className = '',
}: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Initialize camera devices
  useEffect(() => {
    isMountedRef.current = true;
    
    const initializeCameras = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // Check if we're in a secure context (HTTPS or localhost)
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
          setError('Camera access requires HTTPS or localhost. Please use HTTPS for camera functionality.');
          return;
        }

        // Check if navigator.mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
          return;
        }

        console.log('Checking camera permissions...');
        
        // Test basic camera access
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }
          });
          testStream.getTracks().forEach(track => track.stop());
          console.log('Camera permission granted');
        } catch (permissionError: any) {
          console.error('Camera permission error:', permissionError);
          if (permissionError.name === 'NotAllowedError') {
            setError('Camera permission denied. Please allow camera access and refresh the page.');
          } else if (permissionError.name === 'NotFoundError') {
            setError('No camera found. Please ensure your device has a camera.');
          } else if (permissionError.name === 'NotReadableError') {
            setError('Camera is being used by another application. Please close other applications and try again.');
          } else {
            setError(`Camera access failed: ${permissionError.message}`);
          }
          return;
        }

        // Get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length > 0) {
          console.log('Available cameras:', videoDevices);
          if (isMountedRef.current) {
            setCameras(videoDevices);
            
            // Prefer back camera if available
            const backCamera = videoDevices.find(device => 
              device.label.toLowerCase().includes('back') || 
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment')
            );
            
            setSelectedCamera(backCamera?.deviceId || videoDevices[0].deviceId);
          }
        } else {
          setError('No cameras found. Please ensure your device has a camera and permissions are granted.');
        }
      } catch (err: any) {
        console.error('Error getting cameras:', err);
        if (isMountedRef.current) {
          setError(`Failed to access camera: ${err.message || 'Unknown error'}`);
        }
      } finally {
        if (isMountedRef.current) {
          setIsInitializing(false);
        }
      }
    };

    initializeCameras();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      stopScanning();
    };
  }, []);

  const scanQRCode = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Scan for QR code
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (qrCode) {
      console.log('QR Code detected:', qrCode.data);
      
      const parsedData = parseQRCodeData(qrCode.data);
      
      if (parsedData && parsedData.id && parsedData.type === 'barbaros-client') {
        console.log('Valid Barbaros QR code found, client ID:', parsedData.id);
        stopScanning();
        onScanSuccess(parsedData.id);
      } else {
        // Try to handle raw text as client ID (fallback)
        console.log('Not a Barbaros QR code format, trying raw data:', qrCode.data);
        
        // Check if it looks like a MongoDB ObjectId (24 hex characters)
        if (/^[0-9a-fA-F]{24}$/.test(qrCode.data)) {
          console.log('Detected MongoDB ObjectId format:', qrCode.data);
          stopScanning();
          onScanSuccess(qrCode.data);
        } 
        // Check if it looks like a client ID (starts with C and has numbers/letters)
        else if (/^C[A-Za-z0-9]{8}$/.test(qrCode.data)) {
          console.log('Detected client ID format:', qrCode.data);
          stopScanning();
          onScanSuccess(qrCode.data);
        }
        // Try any text that looks like an ID
        else if (qrCode.data && qrCode.data.length >= 5) {
          console.log('Trying raw text as client identifier:', qrCode.data);
          stopScanning();
          onScanSuccess(qrCode.data);
        } else {
          console.log('QR code data does not match expected format:', qrCode.data);
          setError('This QR code does not appear to be a valid Barbaros client code. Please scan a client\'s QR code or try the manual search.');
          if (onScanError) onScanError('Invalid QR code format');
        }
      }
    }
  }, [onScanSuccess, onScanError]);

  const startScanning = async () => {
    if (!selectedCamera || !videoRef.current) {
      setError('No camera selected or video element not ready');
      return;
    }

    try {
      setError(null);
      setIsScanning(true);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Get camera stream
      const constraints = {
        video: {
          deviceId: { exact: selectedCamera },
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('Starting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error('Video element not available'));
          return;
        }
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(() => {
              console.log('Video stream started successfully');
              resolve();
            })
            .catch(reject);
        };
        
        videoRef.current.onerror = () => {
          reject(new Error('Failed to load video stream'));
        };
      });

      // Start QR code scanning interval
      scanIntervalRef.current = setInterval(scanQRCode, 300); // Scan every 300ms
      
      console.log('Camera started successfully');
    } catch (err: any) {
      console.error('Error starting camera:', err);
      setError(`Failed to start camera: ${err.message || 'Please check camera permissions and try again.'}`);
      setIsScanning(false);
      if (onScanError) onScanError('Failed to start scanner');
    }
  };

  const stopScanning = () => {
    // Stop scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    console.log('Scanner stopped successfully');
  };

  const handleCameraChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCameraId = e.target.value;
    
    if (isScanning) {
      stopScanning();
    }
    
    setSelectedCamera(newCameraId);
  };

  if (isInitializing) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center">
            <FaSpinner className="animate-spin h-8 w-8 text-gray-400 mb-4" />
            <p className="text-gray-600">Initializing camera...</p>
            <p className="text-sm text-gray-500 mt-2">Please allow camera permissions if prompted</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaCamera className="h-5 w-5 mr-2" />
            Camera Scanner
          </h2>
        </div>

        <div className="p-6">
          {/* Camera selection */}
          {cameras.length > 1 && (
            <div className="mb-6">
              <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700 mb-2">
                <FaCog className="inline h-4 w-4 mr-1" />
                Select Camera ({cameras.length} available)
              </label>
              <select
                id="camera-select"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                value={selectedCamera || ''}
                onChange={handleCameraChange}
                disabled={isScanning}
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Scanner container */}
          <div className="relative mb-6">
            <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden relative"
                 style={{ minHeight: '300px', maxHeight: '500px' }}>
              
              {/* Video element */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ display: isScanning ? 'block' : 'none' }}
              />
              
              {/* Hidden canvas for QR processing */}
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Placeholder when not scanning */}
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <FaCamera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Camera Preview</p>
                    <p className="text-sm text-gray-500 mt-1">Click "Start Scanning" to begin</p>
                  </div>
                </div>
              )}
              
              {/* Scan overlay when active */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-64 h-64 border-2 border-white rounded-lg opacity-50"></div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                    <p className="text-sm">Point camera at QR code</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">Scanner Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Reload page to try again
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!isScanning ? (
              <button
                onClick={startScanning}
                disabled={!selectedCamera}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
                  !selectedCamera
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 shadow-sm'
                }`}
              >
                <FaCamera className="h-4 w-4 mr-2" />
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all shadow-sm"
              >
                <FaStop className="h-4 w-4 mr-2" />
                Stop Scanning
              </button>
            )}

            {onManualEntry && (
              <button
                onClick={onManualEntry}
                className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium transition-all"
              >
                <FaSearch className="h-4 w-4 mr-2" />
                Manual Entry
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Scanning Tips:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Hold your device steady and ensure good lighting</p>
              <p>• Keep the QR code centered in the scanning area</p>
              <p>• Make sure the QR code is clearly visible and not damaged</p>
              <p>• The scanner will automatically detect valid QR codes</p>
              <p>• If scanning fails, try refreshing the page and granting camera permissions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}