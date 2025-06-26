'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { parseQRCodeData } from '@/lib/utils/qrcode';
import { FaCamera, FaStop, FaSearch, FaCog, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
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
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Clean up function
  const cleanup = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Initialize cameras after user interaction
  const initializeCameras = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Check if we're in a secure context
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setError('Camera access requires HTTPS. Please use HTTPS or localhost.');
        setHasPermission(false);
        return;
      }

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera is not supported in this browser.');
        setHasPermission(false);
        return;
      }

      console.log('Requesting camera permission...');
      
      // Request permission with a very simple constraint
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Success! We have permission
        console.log('Camera permission granted');
        setHasPermission(true);
        
        // Stop this test stream
        stream.getTracks().forEach(track => track.stop());
        
        // Now get the list of cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length > 0) {
          console.log('Found cameras:', videoDevices);
          setCameras(videoDevices);
          
          // Prefer back camera
          const backCamera = videoDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          
          setSelectedCamera(backCamera?.deviceId || videoDevices[0].deviceId);
          setError(null);
        } else {
          setError('No cameras found on this device.');
          setHasPermission(false);
        }
        
      } catch (err: any) {
        console.error('Camera permission error:', err);
        setHasPermission(false);
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera permission was denied. Please allow camera access in your browser settings and refresh the page.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found. Please ensure your device has a camera.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application.');
        } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
          setError('Camera constraints could not be satisfied.');
        } else {
          setError(`Camera error: ${err.message || 'Unknown error'}`);
        }
      }
      
    } catch (err: any) {
      console.error('Initialization error:', err);
      setError('Failed to initialize camera.');
      setHasPermission(false);
    } finally {
      setIsInitializing(false);
      setIsFirstLoad(false);
    }
  };

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
        if (/^[0-9a-fA-F]{24}$/.test(qrCode.data)) {
          console.log('Detected MongoDB ObjectId format:', qrCode.data);
          stopScanning();
          onScanSuccess(qrCode.data);
        } else if (/^C[A-Za-z0-9]{8}$/.test(qrCode.data)) {
          console.log('Detected client ID format:', qrCode.data);
          stopScanning();
          onScanSuccess(qrCode.data);
        } else if (qrCode.data && qrCode.data.length >= 5) {
          console.log('Trying raw text as client identifier:', qrCode.data);
          stopScanning();
          onScanSuccess(qrCode.data);
        } else {
          console.log('Invalid QR code format:', qrCode.data);
        }
      }
    }
  }, [onScanSuccess]);

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

      console.log('Starting camera stream...');
      
      // Use very simple constraints for better compatibility
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera ? { ideal: selectedCamera } : undefined
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(resolve).catch(console.error);
            };
          }
        });
        
        console.log('Camera started successfully');
        
        // Start scanning
        scanIntervalRef.current = setInterval(scanQRCode, 300);
      }
      
    } catch (err: any) {
      console.error('Error starting camera:', err);
      setIsScanning(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please refresh the page and allow camera access.');
      } else if (err.name === 'NotFoundError') {
        setError('Camera not found. Please check your camera connection.');
      } else {
        setError(`Failed to start camera: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const stopScanning = () => {
    cleanup();
    setIsScanning(false);
    console.log('Scanner stopped');
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCameraId = e.target.value;
    if (isScanning) {
      stopScanning();
    }
    setSelectedCamera(newCameraId);
  };

  // Don't auto-initialize on mount for Chromium compatibility
  // Wait for user interaction instead
  
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
          {/* Initial state - request permission */}
          {isFirstLoad && hasPermission === null && !isInitializing && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FaCamera className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Permission Required</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Click the button below to enable camera access. Your browser will ask for permission to use your camera.
              </p>
              <button
                onClick={initializeCameras}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-all shadow-sm"
              >
                Enable Camera Access
              </button>
            </div>
          )}

          {/* Loading state */}
          {isInitializing && (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Initializing camera...</p>
              <p className="text-sm text-gray-500 mt-2">Please allow camera access when prompted</p>
            </div>
          )}

          {/* Camera ready state */}
          {!isFirstLoad && hasPermission && !isInitializing && (
            <>
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
                    autoPlay
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
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <FaExclamationCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-medium">Scanner Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  {hasPermission === false && (
                    <button 
                      onClick={initializeCameras} 
                      className="mt-3 text-sm text-red-600 hover:text-red-800 underline font-medium"
                    >
                      Try again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {hasPermission && !error && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Scanning Tips:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Hold your device steady and ensure good lighting</p>
                <p>• Keep the QR code centered in the scanning area</p>
                <p>• Make sure the QR code is clearly visible and not damaged</p>
                <p>• The scanner will automatically detect valid QR codes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}