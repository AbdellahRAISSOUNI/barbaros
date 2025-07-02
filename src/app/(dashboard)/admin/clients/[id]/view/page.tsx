'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaQrcode, FaTrash, FaPlus, FaHistory, FaGift, FaUser } from 'react-icons/fa';
import { VisitRecordingForm } from '@/components/ui/VisitRecordingForm';
import { VisitHistoryView } from '@/components/ui/VisitHistoryView';
import { QRCodeModal } from '@/components/ui/QRCodeModal';
import RewardRedemptionInterface from '@/components/ui/RewardRedemptionInterface';
import toast from 'react-hot-toast';

interface ClientInfo {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  visitCount: number;
  rewardsEarned: number;
  rewardsRedeemed: number;
  qrCodeUrl?: string;
  lastVisit?: Date;
  accountActive: boolean;
  dateCreated: Date;
  totalLifetimeVisits: number;
  currentProgressVisits: number;
  loyaltyStatus: string;
  totalSpent?: number;
  averageVisitValue?: number;
}

type ViewMode = 'info' | 'recording' | 'history' | 'rewards';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('info');
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientInfo();
      
      // Check URL parameters for initial tab
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab && ['info', 'recording', 'history', 'rewards'].includes(tab)) {
        setViewMode(tab as ViewMode);
      }
    }
  }, [clientId]);

  const fetchClientInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/clients/${clientId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch client information');
      }
      
      const data = await response.json();
      
      // The API returns { success: true, client: {...} }
      if (data.success && data.client) {
        setClientInfo(data.client);
      } else {
        throw new Error(data.message || 'Failed to fetch client information');
      }
    } catch (err) {
      console.error('Error fetching client info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load client information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisitCreated = () => {
    setViewMode('info');
    fetchClientInfo(); // Refresh client data
    toast.success('Visit recorded successfully!');
  };

  const handleBackToList = () => {
    router.push('/admin/clients');
  };

  const handleEdit = () => {
    router.push(`/admin/clients/${clientId}/edit`);
  };

  const handleDelete = async () => {
    if (!clientInfo) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${clientInfo.firstName} ${clientInfo.lastName}? This action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast.success('Client deleted successfully');
          router.push('/admin/clients');
        } else {
          throw new Error('Failed to delete client');
        }
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client information...</p>
        </div>
      </div>
    );
  }

  if (error || !clientInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-lg">{error || 'Client not found'}</div>
          <button
            onClick={handleBackToList}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {clientInfo.firstName} {clientInfo.lastName}
              </h1>
              <p className="text-gray-600">Client ID: {clientInfo.clientId}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowQRModal(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <FaQrcode className="h-4 w-4" />
              <span>QR Code</span>
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaEdit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <FaTrash className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setViewMode('info')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'info'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUser className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setViewMode('recording')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'recording'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaPlus className="inline mr-2" />
              Record Visit
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'history'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaHistory className="inline mr-2" />
              Visit History
            </button>
            <button
              onClick={() => setViewMode('rewards')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'rewards'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaGift className="inline mr-2" />
              Rewards
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'info' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Client Information */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Client Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <p className="text-gray-900">{clientInfo.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <p className="text-gray-900">{clientInfo.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{clientInfo.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                      <p className="text-gray-900">{clientInfo.clientId}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                      <p className="text-gray-900">
                        {clientInfo.dateCreated 
                          ? new Date(clientInfo.dateCreated).toLocaleDateString()
                          : 'Unknown'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Visit</label>
                      <p className="text-gray-900">
                        {clientInfo.lastVisit 
                          ? new Date(clientInfo.lastVisit).toLocaleDateString()
                          : 'No visits yet'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                        clientInfo.accountActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {clientInfo.accountActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loyalty Status</label>
                      <span className="inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {clientInfo.loyaltyStatus || 'new'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Visits</span>
                    <span className="font-semibold text-gray-900">{clientInfo.visitCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lifetime Visits</span>
                    <span className="font-semibold text-gray-900">{clientInfo.totalLifetimeVisits || clientInfo.visitCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rewards Earned</span>
                    <span className="font-semibold text-gray-900">{clientInfo.rewardsEarned || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rewards Redeemed</span>
                    <span className="font-semibold text-gray-900">{clientInfo.rewardsRedeemed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available Rewards</span>
                    <span className="font-semibold text-green-600">
                      {(clientInfo.rewardsEarned || 0) - (clientInfo.rewardsRedeemed || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'recording' && (
          <VisitRecordingForm
            clientInfo={{
              _id: clientInfo._id,
              firstName: clientInfo.firstName,
              lastName: clientInfo.lastName,
              email: '', // Not available in our client model
              visitCount: clientInfo.visitCount,
              phone: clientInfo.phoneNumber
            }}
            onVisitCreated={handleVisitCreated}
            onCancel={() => setViewMode('info')}
            onNavigateToRewards={(clientId) => setViewMode('rewards')}
          />
        )}

        {viewMode === 'history' && (
          <VisitHistoryView
            clientId={clientInfo._id}
            clientName={`${clientInfo.firstName} ${clientInfo.lastName}`}
            onBack={() => setViewMode('info')}
          />
        )}

        {viewMode === 'rewards' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <RewardRedemptionInterface
              clientId={clientInfo._id}
              barberName="Admin"
              onRedemptionComplete={(redemption) => {
                console.log('Reward redeemed:', redemption);
                fetchClientInfo(); // Refresh client data
                toast.success('Reward redeemed successfully!');
              }}
            />
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && clientInfo && (
        <QRCodeModal
          clientId={clientInfo._id}
          clientName={`${clientInfo.firstName} ${clientInfo.lastName}`}
          qrCodeUrl={clientInfo.qrCodeUrl}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
}
