'use client';

import { useState } from 'react';
import { QRCodeScanner } from '@/components/ui/QRCodeScanner';
import { FaCamera, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function TestScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [permissionInfo, setPermissionInfo] = useState<any>(null);

  const handleScanSuccess = (clientId: string) => {
    setScanResult(clientId);
    setScanError(null);
  };

  const handleScanError = (error: string) => {
    setScanError(error);
    setScanResult(null);
  };

  const checkCameraPermissions = async () => {
    const info: any = {
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      userAgent: navigator.userAgent,
      mediaDevicesSupported: !!navigator.mediaDevices,
      getUserMediaSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    };

    try {
      // Try to check permission state
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          info.permissionState = result.state;
        } catch (e) {
          info.permissionState = 'query not supported';
        }
      } else {
        info.permissionState = 'permissions API not supported';
      }

      // Try to enumerate devices
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        info.videoDevices = devices.filter(d => d.kind === 'videoinput').map(d => ({
          deviceId: d.deviceId,
          label: d.label || 'No label',
          kind: d.kind
        }));
      }
    } catch (e: any) {
      info.error = e.message;
    }

    setPermissionInfo(info);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Camera Scanner Test Page</h1>

        {/* Permission Debug Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Camera Permission Debug Info</h2>
          <button
            onClick={checkCameraPermissions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
          >
            Check Camera Permissions
          </button>
          
          {permissionInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(permissionInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Scanner Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">QR Code Scanner Component</h2>
          <QRCodeScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            onManualEntry={() => alert('Manual entry clicked')}
          />
        </div>

        {/* Results */}
        {scanResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <FaCheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-green-800">Scan Successful!</h3>
                <p className="text-green-700">Client ID: {scanResult}</p>
              </div>
            </div>
          </div>
        )}

        {scanError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <FaExclamationCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">Scan Error</h3>
                <p className="text-red-700">{scanError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Camera Test */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Camera Test</h2>
          <button
            onClick={async () => {
              try {
                console.log('Testing camera access...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                console.log('Camera access granted!', stream);
                alert('Camera access granted! Check console for details.');
                stream.getTracks().forEach(track => track.stop());
              } catch (e: any) {
                console.error('Camera access failed:', e);
                alert(`Camera access failed: ${e.name} - ${e.message}`);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <FaCamera className="mr-2" />
            Test Camera Access Directly
          </button>
        </div>
      </div>
    </div>
  );
} 