'use client';

import { useState, useEffect } from 'react';
import { FaUpload, FaSearch, FaQrcode, FaTimes, FaCheckCircle, FaExclamationCircle, FaUser, FaPlus, FaHistory, FaEye, FaGift, FaCut, FaCrown, FaCalendarAlt, FaArrowRight, FaSpinner, FaEdit, FaTrash, FaCamera } from 'react-icons/fa';
import { ClientLookup } from '@/components/ui/ClientLookup';
import { VisitRecordingForm } from '@/components/ui/VisitRecordingForm';
import { parseQRCodeData } from '@/lib/utils/qrcode';
import RewardRedemptionInterface from '@/components/ui/RewardRedemptionInterface';
import { QRCodeScanner } from '@/components/ui/QRCodeScanner';
import jsQR from 'jsqr';
import toast from 'react-hot-toast';

type ScanMode = 'camera' | 'upload' | 'manual';
type ViewMode = 'scanner' | 'client-overview' | 'visit-recording' | 'rewards' | 'history' | 'edit-client';

interface ClientInfo {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  visitCount: number;
  rewardsEarned: number;
  rewardsRedeemed: number;
  totalLifetimeVisits: number;
  currentProgressVisits: number;
  loyaltyStatus: string;
  lastVisit?: string;
  accountActive: boolean;
  dateCreated: string;
  qrCodeUrl: string;
}

interface LoyaltyStatus {
  client: any;
  selectedReward?: any;
  eligibleRewards: any[];
  visitsToNextReward: number;
  progressPercentage: number;
  canRedeem: boolean;
  totalVisits: number;
  currentProgressVisits: number;
  rewardsRedeemed: number;
  milestoneReached: boolean;
}

interface RecentVisit {
  _id: string;
  visitDate: string;
  services: Array<{
    name: string;
    price: number;
  }>;
  totalPrice: number;
  barber: string;
  visitNumber: number;
}

export default function AdminScannerPage() {
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
  const [viewMode, setViewMode] = useState<ViewMode>('scanner');
  const [foundClientId, setFoundClientId] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClientFound = (clientId: string) => {
    setFoundClientId(clientId);
    setScanError(null);
    setViewMode('client-overview');
  };

  const handleScanError = (error: string) => {
    setScanError(error);
    setSuccessMessage(null);
  };

  const handleReset = () => {
    setFoundClientId(null);
    setClientInfo(null);
    setLoyaltyStatus(null);
    setRecentVisits([]);
    setScanError(null);
    setSuccessMessage(null);
    setIsScanning(false);
    setIsLoadingClient(false);
    setViewMode('scanner');
  };

  const handleVisitSuccess = () => {
    setViewMode('client-overview');
    if (foundClientId) {
      fetchClientData(foundClientId);
    }
  };

  // Fetch comprehensive client data
  const fetchClientData = async (clientId: string) => {
    try {
      setIsLoadingClient(true);
      setScanError(null);
      
      const [clientResponse, loyaltyResponse, visitsResponse] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(`/api/loyalty/${clientId}`),
        fetch(`/api/clients/${clientId}/visits?limit=5`)
      ]);
      
      if (!clientResponse.ok) {
        throw new Error('Failed to fetch client information');
      }
      
      const clientData = await clientResponse.json();
      setClientInfo(clientData);

      // Fetch loyalty status
      if (loyaltyResponse.ok) {
        const loyaltyData = await loyaltyResponse.json();
        if (loyaltyData.success) {
          setLoyaltyStatus(loyaltyData.loyaltyStatus);
        }
      }

      // Fetch recent visits
      if (visitsResponse.ok) {
        const visitsData = await visitsResponse.json();
        setRecentVisits(visitsData.visits || []);
      }

    } catch (err) {
      console.error('Error fetching client info:', err);
      setScanError('Failed to load client information');
      setFoundClientId(null);
      setViewMode('scanner');
    } finally {
      setIsLoadingClient(false);
    }
  };

  // Fetch client information when clientId is found
  useEffect(() => {
    if (foundClientId) {
      fetchClientData(foundClientId);
    }
  }, [foundClientId]);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getLoyaltyStatusBadge = (status: string) => {
    const badges = {
      'new': { color: 'bg-blue-100 text-black', icon: FaUser, text: 'New Member' },
      'active': { color: 'bg-green-100 text-black', icon: FaCut, text: 'Active Member' },
      'milestone_reached': { color: 'bg-purple-100 text-black', icon: FaCrown, text: 'VIP Member' },
      'inactive': { color: 'bg-gray-100 text-black', icon: FaUser, text: 'Inactive' }
    };
    return badges[status as keyof typeof badges] || badges.new;
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
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-br from-black to-gray-800 text-white shadow-lg scale-105' 
          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-black hover:shadow-md hover:scale-102'
      }`}
    >
      <div className="relative z-10">
        <Icon className={`h-8 w-8 mb-4 mx-auto ${active ? 'text-white' : 'text-black'}`} />
        <h3 className={`font-bold text-lg mb-2 ${active ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm ${active ? 'text-gray-200' : 'text-gray-600'}`}>{description}</p>
      </div>
      {active && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700/20 to-black/20 rounded-2xl"></div>
      )}
    </button>
  );

  // Scanner View
  if (viewMode === 'scanner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-black to-gray-800 rounded-full mb-6 shadow-lg">
              <FaQrcode className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Client Scanner</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload QR code images or search manually to find clients and manage their information
            </p>
          </div>

          {/* Scan Error */}
          {scanError && (
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                <FaExclamationCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Scan Error</h4>
                  <p className="text-red-700">{scanError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Scan Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
            <ScanModeButton
              mode="camera"
              icon={FaCamera}
              title="Camera Scan"
              description="Scan QR codes using your camera"
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
              description="Search clients by name, phone, or ID"
              active={scanMode === 'manual'}
            />
          </div>

          {/* Scan Interface */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {scanMode === 'camera' && (
                <div className="p-8">
                  <QRCodeScanner
                    onScanSuccess={handleClientFound}
                    onScanError={handleScanError}
                    onManualEntry={() => setScanMode('manual')}
                  />
                </div>
              )}

              {scanMode === 'upload' && (
                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
                      <FaUpload className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload QR Code Image</h3>
                    <p className="text-gray-600">Select an image file containing a QR code to scan</p>
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <label className="group flex flex-col items-center justify-center w-full h-48 border-3 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isScanning ? (
                          <>
                            <FaSpinner className="h-8 w-8 text-black animate-spin mb-3" />
                            <p className="text-black font-medium">Scanning image...</p>
                          </>
                        ) : (
                          <>
                            <FaUpload className="h-10 w-10 text-gray-400 mb-4 group-hover:text-gray-500 transition-colors" />
                            <p className="text-lg font-medium text-gray-700 mb-2">
                              <span className="text-black">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-sm text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isScanning}
                      />
                    </label>
                  </div>
                </div>
              )}

              {scanMode === 'manual' && (
                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
                      <FaSearch className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Manual Client Search</h3>
                    <p className="text-gray-600">Search for clients by name, phone number, or client ID</p>
                  </div>
                  <ClientLookup
                    onClientFound={(clientId) => {
                      handleClientFound(clientId);
                    }}
                    onError={handleScanError}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client Overview (after finding client)
  if (viewMode === 'client-overview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                className="p-3 rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-md transition-all"
              >
                <FaTimes className="h-5 w-5" />
              </button>
              {clientInfo && (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {clientInfo.firstName} {clientInfo.lastName}
                  </h1>
                  <p className="text-gray-600">Client ID: {clientInfo.clientId} • Admin Dashboard</p>
                </div>
              )}
            </div>
            {clientInfo && (
              <div className="flex items-center space-x-3">
                <a
                  href={`/admin/clients/${clientInfo._id}/view`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <FaEye className="h-4 w-4" />
                  <span>Full Profile</span>
                </a>
                <a
                  href={`/admin/clients/${clientInfo._id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FaEdit className="h-4 w-4" />
                  <span>Edit Client</span>
                </a>
              </div>
            )}
          </div>

          {isLoadingClient ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <FaSpinner className="h-12 w-12 text-black animate-spin mx-auto mb-4" />
                <p className="text-xl text-gray-600">Loading client information...</p>
              </div>
            </div>
          ) : clientInfo ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Client Info Card */}
              <div className="xl:col-span-2 space-y-6">
                {/* Main Client Info */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <FaUser className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{clientInfo.firstName} {clientInfo.lastName}</h2>
                          <p className="text-gray-200">{clientInfo.email}</p>
                          {clientInfo.phoneNumber && (
                            <p className="text-gray-200">{clientInfo.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const badge = getLoyaltyStatusBadge(clientInfo.loyaltyStatus);
                          const Icon = badge.icon;
                          return (
                            <div className="bg-white bg-opacity-20 rounded-full px-4 py-2 flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span className="font-medium">{badge.text}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FaCut className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{clientInfo.visitCount}</p>
                        <p className="text-sm text-gray-600">Total Visits</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FaGift className="h-6 w-6 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{clientInfo.rewardsEarned}</p>
                        <p className="text-sm text-gray-600">Rewards Earned</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FaCheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{clientInfo.rewardsRedeemed}</p>
                        <p className="text-sm text-gray-600">Redeemed</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FaCalendarAlt className="h-6 w-6 text-yellow-600" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{formatDate(clientInfo.lastVisit)}</p>
                        <p className="text-sm text-gray-600">Last Visit</p>
                      </div>
                    </div>
                    
                    {/* Additional Admin Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Account Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Member Since</p>
                          <p className="font-medium">{formatDate(clientInfo.dateCreated)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Account Status</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            clientInfo.accountActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {clientInfo.accountActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loyalty Progress */}
                {loyaltyStatus && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Loyalty Progress</h3>
                      <div className="text-sm text-gray-600">
                        {loyaltyStatus.currentProgressVisits} / {loyaltyStatus.selectedReward?.visitsRequired || 'No goal'} visits
                      </div>
                    </div>
                    
                    {loyaltyStatus.selectedReward ? (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress to next reward</span>
                          <span className="text-sm font-medium text-black">
                            {Math.round(loyaltyStatus.progressPercentage)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                          <div 
                            className="bg-gradient-to-r from-gray-800 to-black h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(loyaltyStatus.progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-semibold text-gray-900 mb-1">Next Reward: {loyaltyStatus.selectedReward.name}</h4>
                          <p className="text-gray-700 text-sm">{loyaltyStatus.selectedReward.description}</p>
                          {loyaltyStatus.visitsToNextReward > 0 && (
                            <p className="text-gray-600 text-sm mt-2 font-medium">
                              {loyaltyStatus.visitsToNextReward} more visit{loyaltyStatus.visitsToNextReward > 1 ? 's' : ''} needed
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FaGift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No reward goal selected</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Visits */}
                {recentVisits.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Recent Visits</h3>
                      <button
                        onClick={() => setViewMode('history')}
                        className="text-black hover:text-gray-700 font-medium text-sm flex items-center space-x-1"
                      >
                        <span>View All</span>
                        <FaArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {recentVisits.map((visit) => (
                        <div key={visit._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              #{visit.visitNumber}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{visit.services.map(s => s.name).join(', ')}</p>
                              <p className="text-sm text-gray-600">by {visit.barber} • {formatDate(visit.visitDate)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${visit.totalPrice}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Panel */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => setViewMode('visit-recording')}
                      className="w-full group bg-gradient-to-r from-gray-900 to-black text-white p-4 rounded-xl hover:from-black hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <FaPlus className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold">Record New Visit</p>
                            <p className="text-sm text-gray-200">Add services and complete visit</p>
                          </div>
                        </div>
                        <FaArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    <button
                      onClick={() => setViewMode('rewards')}
                      className="w-full group bg-white border-2 border-gray-200 text-gray-700 p-4 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaGift className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold">Manage Rewards</p>
                            <p className="text-sm text-gray-600">Redeem available rewards</p>
                          </div>
                        </div>
                        <FaArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    <button
                      onClick={() => setViewMode('history')}
                      className="w-full group bg-white border-2 border-gray-200 text-gray-700 p-4 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaHistory className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold">Visit History</p>
                            <p className="text-sm text-gray-600">View all past visits</p>
                          </div>
                        </div>
                        <FaArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Available Rewards */}
                {loyaltyStatus && loyaltyStatus.eligibleRewards.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Available Rewards</h3>
                    <div className="space-y-3">
                      {loyaltyStatus.eligibleRewards.slice(0, 3).map((reward: any, index: number) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                          <div className="flex items-center space-x-2">
                            <FaGift className="h-4 w-4 text-yellow-600" />
                            <p className="font-semibold text-yellow-800 text-sm">{reward.name}</p>
                          </div>
                          <p className="text-yellow-700 text-xs mt-1">{reward.description}</p>
                        </div>
                      ))}
                      {loyaltyStatus.eligibleRewards.length > 3 && (
                        <button
                          onClick={() => setViewMode('rewards')}
                          className="w-full text-center text-black hover:text-gray-700 font-medium text-sm py-2"
                        >
                          View {loyaltyStatus.eligibleRewards.length - 3} more rewards
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <FaExclamationCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Not Found</h2>
              <p className="text-gray-600 mb-6">Unable to load client information</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                Back to Scanner
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Visit Recording View
  if (viewMode === 'visit-recording' && clientInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('client-overview')}
                className="p-3 rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-md transition-all"
              >
                <FaTimes className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Record New Visit</h1>
                <p className="text-gray-600">{clientInfo.firstName} {clientInfo.lastName} • Admin</p>
              </div>
            </div>
          </div>
          <VisitRecordingForm
            clientInfo={clientInfo}
            onVisitCreated={handleVisitSuccess}
            onCancel={() => setViewMode('client-overview')}
          />
        </div>
      </div>
    );
  }

  // Rewards View
  if (viewMode === 'rewards' && foundClientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('client-overview')}
                className="p-3 rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-md transition-all"
              >
                <FaTimes className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rewards & Loyalty</h1>
                <p className="text-gray-600">{clientInfo?.firstName} {clientInfo?.lastName} • Admin</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <RewardRedemptionInterface
              clientId={foundClientId}
              barberName="Admin" // Admin redemption
              onRedemptionComplete={() => {
                setViewMode('client-overview');
                if (foundClientId) {
                  fetchClientData(foundClientId);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // History View
  if (viewMode === 'history' && clientInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('client-overview')}
                className="p-3 rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-md transition-all"
              >
                <FaTimes className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Visit History</h1>
                <p className="text-gray-600">{clientInfo.firstName} {clientInfo.lastName} • Admin</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            {recentVisits.length > 0 ? (
              <div className="space-y-4">
                {recentVisits.map((visit, index) => (
                  <div key={visit._id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">#{visit.visitNumber || index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{formatDate(visit.visitDate)}</h3>
                          <p className="text-sm text-gray-600">by {visit.barber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${visit.totalPrice}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Services:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {visit.services.map((service, serviceIndex) => (
                          <div key={serviceIndex} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-900">{service.name}</span>
                            <span className="font-medium text-gray-700">${service.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaHistory className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Visit History</h3>
                <p className="text-gray-600">This client hasn't had any visits yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}