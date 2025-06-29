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
import { IconType } from 'react-icons';

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

  const ScanModeButton = ({
    mode,
    icon: Icon,
    title,
    description,
    active,
  }: {
    mode: ScanMode;
    icon: IconType;
    title: string;
    description: string;
    active: boolean;
  }) => {
    const handleClick = () => {
      setScanMode(mode);
      // Scroll the scan interface into view with smooth behavior
      const scanInterface = document.querySelector('.scan-interface');
      if (scanInterface) {
        const windowHeight = window.innerHeight;
        const elementRect = scanInterface.getBoundingClientRect();
        const elementTop = elementRect.top + window.pageYOffset;
        const targetScrollPosition = elementTop - (windowHeight - elementRect.height) / 2;
        
        window.scrollTo({
          top: targetScrollPosition,
          behavior: 'smooth'
        });
      }
    };

    return (
      <button
        onClick={handleClick}
        className={`relative flex flex-col items-center justify-center p-3 sm:p-4 lg:p-8 rounded-lg lg:rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] ${
          active
            ? 'bg-gradient-to-br from-[#8B0000] to-[#A31515] border-[#8B0000]/20 shadow-lg lg:shadow-xl'
            : 'bg-white border-stone-200/60 hover:border-[#8B0000]/20 hover:shadow-md lg:hover:shadow-lg'
        } ${!active && 'lg:hover:bg-gradient-to-br lg:hover:from-stone-50 lg:hover:to-red-50'}`}
      >
        <Icon 
          className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-10 lg:w-10 mb-2 lg:mb-4 transition-transform group-hover:scale-110 ${
            active ? 'text-white' : 'text-stone-600 lg:text-[#8B0000]'
          }`} 
        />
        <h3 className={`text-sm sm:text-base lg:text-xl font-semibold mb-1 lg:mb-2 ${
          active ? 'text-white' : 'text-stone-800'
        }`}>
          {title}
        </h3>
        <p className={`text-xs lg:text-sm leading-tight ${
          active ? 'text-white/90' : 'text-stone-600'
        }`}>
          {description}
        </p>
        {!active && (
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 lg:hover:opacity-10 rounded-lg lg:rounded-2xl transition-opacity" />
        )}
      </button>
    );
  };

  // Scanner View
  if (viewMode === 'scanner') {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20 pb-20">
        {/* Loading Overlay */}
        {isLoadingClient && (
          <>
            {/* Blur backdrop */}
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50" />
            {/* Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-xl text-center max-w-sm mx-auto border border-stone-200/50">
                <FaSpinner className="animate-spin text-3xl sm:text-4xl text-emerald-700 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-stone-800">Loading Client Data</h3>
                <p className="text-sm text-stone-600">Please wait while we fetch the client's information...</p>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
          {/* Header */}
          <div className="text-center mb-3 sm:mb-8 lg:mb-12">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-[#8B0000] to-[#A31515] rounded-2xl lg:rounded-3xl mb-2 sm:mb-4 lg:mb-6 shadow-xl transform transition-transform hover:scale-105">
              <FaQrcode className="h-5 w-5 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-white" />
            </div>
            <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold text-stone-800 mb-1 lg:mb-3">Admin Client Scanner</h1>
            <p className="text-xs sm:text-sm lg:text-lg text-stone-600 max-w-md lg:max-w-2xl mx-auto">
              Upload QR code images or search manually to find clients and manage their information
            </p>
          </div>

          {/* Scan Error */}
          {scanError && (
            <div className="mb-4 sm:mb-6 max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200/60 rounded-xl p-3 sm:p-4 flex items-start">
                <FaExclamationCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-red-800 mb-0.5">Scan Error</h4>
                  <p className="text-xs sm:text-sm text-red-700">{scanError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Scan Mode Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-3 sm:mb-6 lg:mb-8 max-w-3xl mx-auto">
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
          <div className="max-w-2xl mx-auto scan-interface">
            <div className="bg-white rounded-lg shadow-md border border-stone-200/60 overflow-hidden">
              {scanMode === 'camera' && (
                <div className="p-3 sm:p-4">
                  <QRCodeScanner
                    onScanSuccess={handleClientFound}
                    onScanError={handleScanError}
                    onManualEntry={() => setScanMode('manual')}
                  />
                </div>
              )}

              {scanMode === 'upload' && (
                <div className="p-3 sm:p-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg mb-2 sm:mb-3">
                      <FaUpload className="h-5 w-5 sm:h-6 sm:w-6 text-amber-700" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-800 mb-1">Upload QR Code</h3>
                    <p className="text-xs text-stone-600">Select an image file with a QR code</p>
                  </div>
                  
                  <div className="max-w-xs mx-auto">
                    <label className="group flex flex-col items-center justify-center w-full h-32 sm:h-36 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer bg-gradient-to-br from-stone-50 to-amber-50/50 hover:from-stone-100 hover:to-amber-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-3 pb-4 sm:pt-4 sm:pb-5">
                        {isScanning ? (
                          <>
                            <FaSpinner className="h-5 w-5 sm:h-6 sm:w-6 text-[#8B0000] animate-spin mb-2" />
                            <p className="text-xs sm:text-sm text-[#8B0000] font-medium">Scanning...</p>
                          </>
                        ) : (
                          <>
                            <FaUpload className="h-6 w-6 sm:h-7 sm:w-7 text-stone-400 mb-2 sm:mb-3 group-hover:text-stone-500 transition-colors" />
                            <p className="text-sm font-medium text-stone-700 mb-1 text-center">
                              <span className="text-[#8B0000]">Upload</span> or drag
                            </p>
                            <p className="text-xs text-stone-500">PNG, JPG (10MB max)</p>
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
                <div className="p-3 sm:p-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-stone-100 to-stone-50 rounded-lg mb-2 sm:mb-3">
                      <FaSearch className="h-5 w-5 sm:h-6 sm:w-6 text-stone-700" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-800 mb-1">Manual Search</h3>
                    <p className="text-xs text-stone-600">Search by name, phone, or ID</p>
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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-white shadow-sm border border-stone-200/60 text-stone-600 hover:text-stone-900 hover:shadow-md transition-all"
            >
              <FaTimes className="h-4 w-4" />
            </button>
            {clientInfo && (
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-stone-800">
                  {clientInfo.firstName} {clientInfo.lastName}
                </h1>
                <p className="text-xs text-stone-600">Client ID: {clientInfo.clientId} • Admin Dashboard</p>
              </div>
            )}
            {clientInfo && (
              <div className="flex items-center gap-2">
                <a
                  href={`/admin/clients/${clientInfo._id}/view`}
                  className="px-2 py-1 sm:px-3 sm:py-2 bg-white border border-stone-200/60 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <FaEye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </a>
                <a
                  href={`/admin/clients/${clientInfo._id}/edit`}
                  className="px-2 py-1 sm:px-3 sm:py-2 bg-gradient-to-br from-[#8B0000] to-[#A31515] text-white rounded-lg hover:from-[#7A0000] hover:to-[#920000] transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <FaEdit className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </a>
              </div>
            )}
          </div>

          {isLoadingClient ? (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="text-center">
                <FaSpinner className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-700 animate-spin mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-xl text-stone-600">Loading client information...</p>
              </div>
            </div>
          ) : clientInfo ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Main Client Info */}
              <div className="bg-white rounded-lg shadow-md border border-stone-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-[#8B0000] to-[#A31515] p-3 sm:p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <FaUser className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-white">{clientInfo.firstName} {clientInfo.lastName}</h2>
                        <p className="text-xs text-red-100">{clientInfo.email}</p>
                        {clientInfo.phoneNumber && (
                          <p className="text-xs text-red-100">{clientInfo.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      {(() => {
                        const badge = getLoyaltyStatusBadge(clientInfo.loyaltyStatus);
                        const Icon = badge.icon;
                        return (
                          <div className="bg-white/20 rounded-lg px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2">
                            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="text-xs font-medium">{badge.text}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                        <FaCut className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700" />
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-stone-800">{clientInfo.visitCount}</p>
                      <p className="text-xs text-stone-600">Visits</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                        <FaGift className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700" />
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-stone-800">{clientInfo.rewardsEarned}</p>
                      <p className="text-xs text-stone-600">Earned</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-stone-100 to-stone-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                        <FaCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-stone-700" />
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-stone-800">{clientInfo.rewardsRedeemed}</p>
                      <p className="text-xs text-stone-600">Used</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-stone-100 to-stone-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                        <FaCalendarAlt className="h-4 w-4 sm:h-5 sm:w-5 text-stone-700" />
                      </div>
                      <p className="text-sm sm:text-base font-bold text-stone-800">{formatDate(clientInfo.lastVisit)}</p>
                      <p className="text-xs text-stone-600">Last Visit</p>
                    </div>
                  </div>
                  
                  {/* Additional Admin Info */}
                  <div className="bg-gradient-to-br from-stone-50 to-amber-50/50 rounded-lg p-3 border border-stone-200/60">
                    <h4 className="font-semibold text-stone-800 mb-2 text-sm">Account Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-stone-600">Member Since</p>
                        <p className="font-medium text-stone-800">{formatDate(clientInfo.dateCreated)}</p>
                      </div>
                      <div>
                        <p className="text-stone-600">Account Status</p>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          clientInfo.accountActive 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {clientInfo.accountActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                                  </div>
                </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={() => setViewMode('visit-recording')}
                  className="flex items-center p-3 bg-gradient-to-br from-emerald-800 to-emerald-700 rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaPlus className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold">Record Visit</p>
                      <p className="text-xs text-emerald-100">Add services</p>
                    </div>
                    <FaArrowRight className="h-3.5 w-3.5 text-white/70" />
                  </div>
                </button>

                <button
                  onClick={() => setViewMode('rewards')}
                  className="flex items-center p-3 bg-gradient-to-br from-[#8B0000] to-[#A31515] rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaGift className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold">Rewards</p>
                      <p className="text-xs text-red-100">Redeem points</p>
                    </div>
                    <FaArrowRight className="h-3.5 w-3.5 text-white/70" />
                  </div>
                </button>

                <button
                  onClick={() => setViewMode('history')}
                  className="flex items-center p-3 bg-gradient-to-br from-stone-800 to-stone-700 rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaHistory className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold">History</p>
                      <p className="text-xs text-stone-100">View visits</p>
                    </div>
                    <FaArrowRight className="h-3.5 w-3.5 text-white/70" />
                  </div>
                </button>
              </div>

              {/* Loyalty Status */}
              {loyaltyStatus && (
                <div className="bg-white rounded-lg shadow-md border border-stone-200/60 overflow-hidden mb-4">
                  <div className="bg-gradient-to-br from-emerald-800 to-emerald-700 p-3 sm:p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <FaCrown className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-white">Loyalty Status</h3>
                    </div>
                    <div className="space-y-3">
                      {loyaltyStatus.selectedReward ? (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-emerald-100">Progress to Next Reward</span>
                            <span className="text-xs font-medium text-white">
                              {loyaltyStatus.currentProgressVisits} / {loyaltyStatus.selectedReward.visitsRequired} visits
                            </span>
                          </div>
                          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white rounded-full transition-all duration-500"
                              style={{ width: `${loyaltyStatus.progressPercentage}%` }}
                            />
                          </div>
                          <div className="mt-2 bg-white/10 rounded-lg p-2">
                            <p className="text-xs font-medium text-white">Next Reward: {loyaltyStatus.selectedReward.name}</p>
                            <p className="text-xs text-emerald-100">{loyaltyStatus.selectedReward.description}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/10 rounded-lg p-3 text-center">
                          <FaGift className="h-6 w-6 text-white/60 mx-auto mb-2" />
                          <p className="text-sm font-medium text-white">No Reward Goal Selected</p>
                          <p className="text-xs text-emerald-100">Client hasn't chosen a reward to work towards</p>
                          <button
                            onClick={() => setViewMode('rewards')}
                            className="mt-2 text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors"
                          >
                            Select Reward
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/10 rounded-lg p-2">
                          <p className="text-lg font-bold text-white">{loyaltyStatus.totalVisits}</p>
                          <p className="text-xs text-emerald-100">Total Visits</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2">
                          <p className="text-lg font-bold text-white">{loyaltyStatus.rewardsRedeemed}</p>
                          <p className="text-xs text-emerald-100">Used Rewards</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {loyaltyStatus?.eligibleRewards && loyaltyStatus.eligibleRewards.length > 0 ? (
                    <div className="p-3 sm:p-4 border-t border-stone-200/60">
                      <h4 className="text-sm font-semibold text-stone-800 mb-2">Available Rewards</h4>
                      <div className="space-y-2">
                        {loyaltyStatus.eligibleRewards.slice(0, 2).map((reward: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200/60"
                          >
                            <div className="flex items-center gap-2">
                              <FaGift className="h-3.5 w-3.5 text-emerald-700" />
                              <span className="text-sm font-medium text-emerald-800">{reward.name}</span>
                            </div>
                            <button
                              onClick={() => setViewMode('rewards')}
                              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded"
                            >
                              Redeem
                            </button>
                          </div>
                        ))}
                        {loyaltyStatus.eligibleRewards.length > 2 && (
                          <button
                            onClick={() => setViewMode('rewards')}
                            className="w-full text-center text-emerald-700 hover:text-emerald-800 font-medium text-xs py-2"
                          >
                            View {loyaltyStatus.eligibleRewards.length - 2} more rewards
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 border-t border-stone-200/60 text-center">
                      <FaGift className="h-6 w-6 text-stone-400 mx-auto mb-2" />
                      <p className="text-sm text-stone-600">No rewards available yet</p>
                      <p className="text-xs text-stone-500">Complete more visits to earn rewards</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Visits */}
              {recentVisits.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-stone-200/60 overflow-hidden">
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-bold text-stone-800 mb-3">Recent Visits</h3>
                    <div className="space-y-2">
                      {recentVisits.map((visit) => (
                        <div
                          key={visit._id}
                          className="flex items-center justify-between p-3 bg-gradient-to-br from-stone-50 to-amber-50/50 rounded-lg border border-stone-200/60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center">
                              <FaCut className="h-4 w-4 text-amber-700" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-stone-800">{formatDate(visit.visitDate)}</p>
                              <p className="text-xs text-stone-600 truncate max-w-[200px]">
                                {visit.services.map(s => s.name).join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#8B0000]">${visit.totalPrice.toFixed(2)}</p>
                            <p className="text-xs text-stone-600">{visit.barber}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>


          ) : (
            <div className="text-center py-12 sm:py-20">
              <FaExclamationCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-2xl font-bold text-stone-800 mb-2">Client Not Found</h2>
              <p className="text-sm text-stone-600 mb-4 sm:mb-6">Unable to load client information</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gradient-to-br from-[#8B0000] to-[#A31515] text-white rounded-lg hover:from-[#7A0000] hover:to-[#920000] transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <button
              onClick={() => setViewMode('client-overview')}
              className="p-2 rounded-lg bg-white shadow-sm border border-stone-200/60 text-stone-600 hover:text-stone-900 hover:shadow-md transition-all"
            >
              <FaTimes className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-stone-800">Record Visit</h1>
              <p className="text-xs text-stone-600">{clientInfo.firstName} {clientInfo.lastName} • Admin</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-stone-200/60 overflow-hidden">
            <div className="p-3 sm:p-4">
              <VisitRecordingForm
                clientInfo={clientInfo}
                onVisitCreated={handleVisitSuccess}
                onCancel={() => setViewMode('client-overview')}
                onNavigateToRewards={(clientId) => setViewMode('rewards')}
              />
            </div>
          </div>
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