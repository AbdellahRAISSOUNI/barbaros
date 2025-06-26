'use client';

import { useState } from 'react';
import { FaDownload, FaFileExport, FaDatabase, FaChartBar, FaHistory, FaGift, FaUserShield, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface DataExportCenterProps {
  clientId: string;
}

interface ExportOptions {
  visits: boolean;
  loyalty: boolean;
  profile: boolean;
  analytics: boolean;
}

export default function DataExportCenter({ clientId }: DataExportCenterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    visits: true,
    loyalty: true,
    profile: true,
    analytics: true
  });

  // Individual export functions
  const exportVisitHistory = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/clients/${clientId}/visits/export?format=${format}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visit-history-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Visit history exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to export visit history');
      }
    } catch (error) {
      console.error('Error exporting visit history:', error);
      toast.error('Failed to export visit history');
    } finally {
      setIsExporting(false);
    }
  };

  const exportLoyaltyData = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/loyalty/${clientId}/export`);
      
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loyalty-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Loyalty data exported successfully');
      } else {
        toast.error('Failed to export loyalty data');
      }
    } catch (error) {
      console.error('Error exporting loyalty data:', error);
      toast.error('Failed to export loyalty data');
    } finally {
      setIsExporting(false);
    }
  };

  const exportServiceAnalytics = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/clients/${clientId}/service-history`);
      
      if (response.ok) {
        const data = await response.json();
        const exportData = {
          exportDate: new Date().toISOString(),
          clientId,
          serviceAnalytics: data.services,
          monthlyTrends: data.monthlyTrends,
          summary: {
            totalServiceTypes: data.services.length,
            totalServicesUsed: data.services.reduce((sum: number, s: any) => sum + s.count, 0),
            totalSpent: data.services.reduce((sum: number, s: any) => sum + s.totalSpent, 0),
            averageServicePrice: data.services.reduce((sum: number, s: any) => sum + s.averagePrice, 0) / data.services.length || 0
          }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `service-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Service analytics exported successfully');
      } else {
        toast.error('Failed to export service analytics');
      }
    } catch (error) {
      console.error('Error exporting service analytics:', error);
      toast.error('Failed to export service analytics');
    } finally {
      setIsExporting(false);
    }
  };

  const exportProfileData = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/clients/${clientId}`);
      
      if (response.ok) {
        const data = await response.json();
        const exportData = {
          exportDate: new Date().toISOString(),
          profileData: {
            firstName: data.client.firstName,
            lastName: data.client.lastName,
            phoneNumber: data.client.phoneNumber,
            dateCreated: data.client.dateCreated,
            totalLifetimeVisits: data.client.totalLifetimeVisits,
            loyaltyStatus: data.client.loyaltyStatus,
            accountActive: data.client.accountActive
          }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Profile data exported successfully');
      } else {
        toast.error('Failed to export profile data');
      }
    } catch (error) {
      console.error('Error exporting profile data:', error);
      toast.error('Failed to export profile data');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllData = async () => {
    try {
      setIsExporting(true);
      toast.loading('Gathering all your data...', { id: 'export-all' });

      // Fetch all data
      const [visitsResponse, loyaltyResponse, analyticsResponse, profileResponse] = await Promise.all([
        exportOptions.visits ? fetch(`/api/clients/${clientId}/visits/export?format=json`) : null,
        exportOptions.loyalty ? fetch(`/api/loyalty/${clientId}/export`) : null,
        exportOptions.analytics ? fetch(`/api/clients/${clientId}/service-history`) : null,
        exportOptions.profile ? fetch(`/api/clients/${clientId}`) : null
      ]);

      const allData: any = {
        exportDate: new Date().toISOString(),
        clientId,
        dataTypes: Object.entries(exportOptions).filter(([, selected]) => selected).map(([type]) => type)
      };

      if (exportOptions.visits && visitsResponse?.ok) {
        allData.visitHistory = await visitsResponse.json();
      }

      if (exportOptions.loyalty && loyaltyResponse?.ok) {
        allData.loyaltyData = await loyaltyResponse.json();
      }

      if (exportOptions.analytics && analyticsResponse?.ok) {
        allData.serviceAnalytics = await analyticsResponse.json();
      }

      if (exportOptions.profile && profileResponse?.ok) {
        const profileData = await profileResponse.json();
        allData.profileData = {
          firstName: profileData.client.firstName,
          lastName: profileData.client.lastName,
          phoneNumber: profileData.client.phoneNumber,
          dateCreated: profileData.client.dateCreated,
          totalLifetimeVisits: profileData.client.totalLifetimeVisits,
          loyaltyStatus: profileData.client.loyaltyStatus,
          accountActive: profileData.client.accountActive
        };
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complete-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Complete data export downloaded successfully!', { id: 'export-all' });
    } catch (error) {
      console.error('Error exporting all data:', error);
      toast.error('Failed to export all data', { id: 'export-all' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (option: keyof ExportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Visit History</h3>
          <p className="text-sm text-gray-600">Download your complete visit history</p>
        </div>
        <button
          onClick={() => exportVisitHistory('csv')}
          disabled={isExporting}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <FaSpinner className="h-4 w-4 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <FaDownload className="h-4 w-4" />
              <span>Export CSV</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Loyalty History</h3>
          <p className="text-sm text-gray-600">Download your loyalty program history</p>
        </div>
        <button
          onClick={() => toast.success('Coming soon!')}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <FaDownload className="h-4 w-4" />
          <span>Coming Soon</span>
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Account Data</h3>
          <p className="text-sm text-gray-600">Request a copy of all your account data</p>
        </div>
        <button
          onClick={() => toast.success('Coming soon!')}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <FaDownload className="h-4 w-4" />
          <span>Coming Soon</span>
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>• Exports are generated in CSV format for easy viewing in spreadsheet applications</p>
        <p>• Data exports may take a few moments to generate</p>
        <p>• All data is encrypted during transfer</p>
      </div>
    </div>
  );
}