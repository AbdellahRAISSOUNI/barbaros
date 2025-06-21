'use client';

import { useState } from 'react';
import { FaDownload, FaFileExport, FaDatabase, FaChartBar, FaHistory, FaGift, FaUserShield } from 'react-icons/fa';
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
          <FaFileExport className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Data Export Center</h2>
          <p className="text-sm text-gray-600">Download your personal data in various formats</p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaUserShield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Data Privacy & Rights</h3>
            <p className="text-sm text-blue-800">
              You have the right to access, export, and manage your personal data. All exports are generated in real-time 
              and contain only your personal information. Downloaded files should be stored securely.
            </p>
          </div>
        </div>
      </div>

      {/* Individual Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Visit History */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FaHistory className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Visit History</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Complete record of all your appointments, services, and payments</p>
          <div className="flex gap-2">
            <button
              onClick={() => exportVisitHistory('csv')}
              disabled={isExporting}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportVisitHistory('json')}
              disabled={isExporting}
              className="flex-1 px-3 py-2 border border-blue-600 text-blue-600 text-sm rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Loyalty Data */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FaGift className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-gray-900">Loyalty & Rewards</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Your loyalty status, progress, and reward redemption history</p>
          <button
            onClick={exportLoyaltyData}
            disabled={isExporting}
            className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            Export JSON
          </button>
        </div>

        {/* Service Analytics */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FaChartBar className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-gray-900">Service Analytics</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Your service preferences, usage patterns, and spending insights</p>
          <button
            onClick={exportServiceAnalytics}
            disabled={isExporting}
            className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Export JSON
          </button>
        </div>

        {/* Profile Data */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FaDatabase className="w-5 h-5 text-orange-600" />
            <h3 className="font-medium text-gray-900">Profile Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Your account information, contact details, and preferences</p>
          <button
            onClick={exportProfileData}
            disabled={isExporting}
            className="w-full px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Complete Export Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Data Export</h3>
        <p className="text-sm text-gray-600 mb-4">
          Download all your data in a single file. Choose which data types to include:
        </p>

        {/* Export Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exportOptions.visits}
              onChange={() => handleOptionChange('visits')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Visit History</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exportOptions.loyalty}
              onChange={() => handleOptionChange('loyalty')}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">Loyalty Data</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exportOptions.analytics}
              onChange={() => handleOptionChange('analytics')}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Analytics</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exportOptions.profile}
              onChange={() => handleOptionChange('profile')}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Profile Data</span>
          </label>
        </div>

        {/* Export All Button */}
        <button
          onClick={exportAllData}
          disabled={isExporting || !Object.values(exportOptions).some(Boolean)}
          className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaDownload className="w-5 h-5" />
          {isExporting ? 'Exporting...' : 'Export Selected Data'}
        </button>

        {!Object.values(exportOptions).some(Boolean) && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Please select at least one data type to export
          </p>
        )}
      </div>

      {/* Export Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Export Information</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• CSV files can be opened in Excel or Google Sheets</li>
          <li>• JSON files contain complete data and can be imported into other systems</li>
          <li>• All exports include timestamps and are generated in real-time</li>
          <li>• Your data remains secure and is only downloaded to your device</li>
        </ul>
      </div>
    </div>
  );
}