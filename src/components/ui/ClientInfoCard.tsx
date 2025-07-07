'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaCut, FaGift, FaPlus, FaHistory, FaCrown, FaCheck } from 'react-icons/fa';
import { VisitRecordingForm } from './VisitRecordingForm';
import { VisitHistoryView } from './VisitHistoryView';
import RewardRedemptionInterface from './RewardRedemptionInterface';
import LoadingAnimation from './LoadingAnimation';

interface Visit {
  _id: string;
  visitDate: string;
  services: Array<{
    name: string;
    price: number;
  }>;
  totalPrice: number;
  barber: string;
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

interface ClientInfo {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  visitCount: number;
  rewardsEarned: number;
  rewardsRedeemed: number;
  qrCodeUrl: string;
  lastVisit?: Date;
  accountActive: boolean;
  totalLifetimeVisits: number;
  currentProgressVisits: number;
  loyaltyStatus: string;
}

type ViewMode = 'info' | 'recording' | 'history' | 'rewards';

interface ClientInfoCardProps {
  clientId: string;
  onClose?: () => void;
  className?: string;
}

export function ClientInfoCard({
  clientId,
  onClose,
  className = '',
}: ClientInfoCardProps) {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('info');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch client information
        const clientResponse = await fetch(`/api/clients/${clientId}`);
        if (!clientResponse.ok) {
          throw new Error('Failed to fetch client information');
        }
        const clientData = await clientResponse.json();
        setClientInfo(clientData);
        
        // Fetch loyalty status for accurate progress tracking
        try {
          const loyaltyResponse = await fetch(`/api/loyalty/${clientId}`);
          if (loyaltyResponse.ok) {
            const loyaltyData = await loyaltyResponse.json();
            if (loyaltyData.success) {
              setLoyaltyStatus(loyaltyData.loyaltyStatus);
            }
          }
        } catch (loyaltyError) {
          console.error('Error fetching loyalty status:', loyaltyError);
        }
        
        // Fetch recent visits
        try {
          const visitsResponse = await fetch(`/api/clients/${clientId}/visits?limit=3`);
          if (visitsResponse.ok) {
            const visitsData = await visitsResponse.json();
            setRecentVisits(visitsData.visits || []);
          }
        } catch (visitsError) {
          console.error('Error fetching visits:', visitsError);
        }
        
      } catch (err) {
        console.error('Error fetching client info:', err);
        setError('Failed to load client information');
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchAllData();
    }
  }, [clientId]);

  const handleVisitCreated = () => {
    setViewMode('info');
    // Refresh all data to update counts
    if (clientId) {
      const refreshData = async () => {
        try {
          const [clientResponse, loyaltyResponse, visitsResponse] = await Promise.all([
            fetch(`/api/clients/${clientId}`),
            fetch(`/api/loyalty/${clientId}`),
            fetch(`/api/clients/${clientId}/visits?limit=3`)
          ]);
          
          if (clientResponse.ok) {
            const clientData = await clientResponse.json();
            setClientInfo(clientData);
          }
          
          if (loyaltyResponse.ok) {
            const loyaltyData = await loyaltyResponse.json();
            if (loyaltyData.success) {
              setLoyaltyStatus(loyaltyData.loyaltyStatus);
            }
          }
          
          if (visitsResponse.ok) {
            const visitsData = await visitsResponse.json();
            setRecentVisits(visitsData.visits || []);
          }
        } catch (err) {
          console.error('Error refreshing data:', err);
        }
      };
      refreshData();
    }
  };

  const handleBackToInfo = () => {
    setViewMode('info');
  };

  // Handle different view modes
  if (viewMode === 'recording' && clientInfo) {
    return (
      <VisitRecordingForm
        clientInfo={{
          _id: clientInfo._id,
          firstName: clientInfo.firstName,
          lastName: clientInfo.lastName,
          email: clientInfo.email || '',
          visitCount: clientInfo.visitCount,
          phone: clientInfo.phoneNumber
        }}
        onVisitCreated={handleVisitCreated}
        onCancel={handleBackToInfo}
        onNavigateToRewards={(clientId) => setViewMode('rewards')}
      />
    );
  }

  if (viewMode === 'history' && clientInfo) {
    return (
      <VisitHistoryView
        clientId={clientInfo._id}
        clientName={`${clientInfo.firstName} ${clientInfo.lastName}`}
        onBack={handleBackToInfo}
      />
    );
  }

  if (viewMode === 'rewards' && clientInfo) {
    return (
      <RewardRedemptionInterface
        clientId={clientInfo._id}
        barberName="Admin" // You might want to get the actual barber name from context
        onRedemptionComplete={() => {
          // Refresh data after redemption
          setViewMode('info');
          // Call the existing fetchAllData function
          const refreshData = async () => {
            try {
              const [clientResponse, loyaltyResponse, visitsResponse] = await Promise.all([
                fetch(`/api/clients/${clientId}`),
                fetch(`/api/loyalty/${clientId}`),
                fetch(`/api/clients/${clientId}/visits?limit=3`)
              ]);

              if (clientResponse.ok) {
                const clientData = await clientResponse.json();
                setClientInfo(clientData.client);
              }

              if (loyaltyResponse.ok) {
                const loyaltyData = await loyaltyResponse.json();
                if (loyaltyData.success) {
                  setLoyaltyStatus(loyaltyData.loyaltyStatus);
                }
              }

              if (visitsResponse.ok) {
                const visitsData = await visitsResponse.json();
                setRecentVisits(visitsData.visits || []);
              }
            } catch (err) {
              console.error('Error refreshing data:', err);
            }
          };
          refreshData();
        }}
        onClose={handleBackToInfo}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <LoadingAnimation size="lg" />
      </div>
    );
  }

  if (error || !clientInfo) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error || 'Client information not found'}</div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-black text-white rounded-md"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const getLoyaltyStatusColor = (status: string) => {
    switch (status) {
      case 'milestone_reached': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoyaltyStatusText = (status: string) => {
    switch (status) {
      case 'milestone_reached': return 'Milestone Reached!';
      case 'active': return 'Active Member';
      case 'new': return 'New Member';
      default: return 'Member';
    }
  };

  // Use loyalty status data if available, otherwise fall back to client info
  const displayVisitCount = loyaltyStatus?.totalVisits ?? clientInfo.totalLifetimeVisits ?? clientInfo.visitCount;
  const displayCurrentProgress = loyaltyStatus?.currentProgressVisits ?? clientInfo.currentProgressVisits;
  const displayRewardsRedeemed = loyaltyStatus?.rewardsRedeemed ?? clientInfo.rewardsRedeemed;

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-full p-3">
              <FaUser className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{clientInfo.firstName} {clientInfo.lastName}</h2>
              <p className="text-gray-300">Client ID: {clientInfo.clientId}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              clientInfo.accountActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {clientInfo.accountActive ? 'Active' : 'Inactive'}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              getLoyaltyStatusColor(clientInfo.loyaltyStatus)
            }`}>
              {getLoyaltyStatusText(clientInfo.loyaltyStatus)}
            </span>
            
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors p-2"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Reward Button - Moved to top for maximum visibility */}
      {loyaltyStatus && (loyaltyStatus.canRedeem || loyaltyStatus.eligibleRewards?.length > 0) && (
        <div className="px-6 pt-2 pb-4">
          <button
            onClick={() => setViewMode('rewards')}
            className="w-full flex items-center justify-center px-8 py-6 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 text-white rounded-xl hover:from-emerald-600 hover:via-green-700 hover:to-emerald-800 transition-all shadow-xl hover:shadow-2xl font-bold text-xl transform hover:scale-105 animate-pulse border-2 border-white/20"
          >
            <div className="absolute left-4 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
            <FaGift className="h-8 w-8 mr-3 animate-bounce" />
            🎉 {loyaltyStatus.canRedeem 
              ? 'REDEEM YOUR REWARD NOW!' 
              : `${loyaltyStatus.eligibleRewards?.length} REWARD${loyaltyStatus.eligibleRewards?.length !== 1 ? 'S' : ''} READY TO CLAIM!`}
            <div className="absolute right-4 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 rounded-full p-2">
                <FaPhone className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Phone Number</div>
                <div className="text-gray-900">{clientInfo.phoneNumber || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <FaCut className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{displayVisitCount}</div>
                    <div className="text-sm text-blue-600">Total Visits</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <FaGift className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">{displayRewardsRedeemed}</div>
                    <div className="text-sm text-green-600">Rewards Used</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Last visit: {formatDate(clientInfo.lastVisit)}
            </div>
          </div>
        </div>

        {/* Loyalty Progress */}
        {loyaltyStatus && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loyalty Progress</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              {loyaltyStatus.selectedReward ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">
                      Working towards: {loyaltyStatus.selectedReward.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {displayCurrentProgress} / {loyaltyStatus.selectedReward.visitsRequired} visits
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(loyaltyStatus.progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  {loyaltyStatus.canRedeem && (
                    <div className="mt-3 flex items-center text-green-600">
                      <FaCheck className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Ready to redeem!</span>
                    </div>
                  )}
                  {loyaltyStatus.visitsToNextReward > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {loyaltyStatus.visitsToNextReward} more visit{loyaltyStatus.visitsToNextReward !== 1 ? 's' : ''} to complete
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-600">
                  <p>No reward selected. Client can choose a reward to work towards.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Visits */}
        {recentVisits.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Visits</h3>
            <div className="space-y-3">
              {recentVisits.map((visit) => (
                <div key={visit._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(visit.visitDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Services: {visit.services.map(s => s.name).join(', ')}
                      </div>
                      <div className="text-sm text-gray-600">
                        Barber: {visit.barber}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {visit.totalPrice} MAD
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setViewMode('recording')}
            className="flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <FaPlus className="h-4 w-4 mr-2" />
            Record New Visit
          </button>
          
          <button
            onClick={() => setViewMode('history')}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <FaHistory className="h-4 w-4 mr-2" />
            View Full History
          </button>
          
          <button
            onClick={() => window.open(clientInfo.qrCodeUrl, '_blank')}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <FaCrown className="h-4 w-4 mr-2" />
            View QR Code
          </button>
        </div>
      </div>
    </div>
  );
}