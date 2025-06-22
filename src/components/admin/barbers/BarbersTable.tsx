'use client';

import { useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaChartLine, FaBan } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Barber {
  _id: string;
  name: string;
  email: string;
  username: string;
  profilePicture?: string;
  phoneNumber?: string;
  active: boolean;
  joinDate: string;
  createdAt: string;
}

interface BarbersTableProps {
  barbers: Barber[];
  onEdit: (barber: Barber) => void;
  onRefresh: () => void;
  onViewStats: (barber: Barber) => void;
}

export default function BarbersTable({ barbers, onEdit, onRefresh, onViewStats }: BarbersTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeactivate = async (barberId: string, barberName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${barberName}? This will disable their login access.`)) {
      return;
    }

    try {
      setDeletingId(barberId);
      
      const response = await fetch(`/api/admin/barbers/${barberId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Barber deactivated successfully');
        onRefresh();
      } else {
        toast.error(data.error || 'Failed to deactivate barber');
      }
    } catch (error) {
      console.error('Error deactivating barber:', error);
      toast.error('Failed to deactivate barber');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePermanentDelete = async (barberId: string, barberName: string) => {
    if (!confirm(`⚠️ PERMANENT DELETE ⚠️\n\nAre you sure you want to PERMANENTLY delete ${barberName} from the database?\n\nThis action cannot be undone and will remove all their data.`)) {
      return;
    }

    try {
      setDeletingId(barberId);
      
      const response = await fetch(`/api/admin/barbers/${barberId}?permanent=true`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Barber permanently deleted from database');
        onRefresh();
      } else {
        toast.error(data.error || 'Failed to delete barber');
      }
    } catch (error) {
      console.error('Error deleting barber:', error);
      toast.error('Failed to delete barber');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateWorkDays = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (barbers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No barbers found</h3>
          <p className="text-gray-500">Get started by adding your first barber to the team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Team Barbers ({barbers.length})</h3>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Barber
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Work Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {barbers.map((barber) => (
              <tr key={barber._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {barber.profilePicture ? (
                        <img
                          src={barber.profilePicture}
                          alt={barber.name}
                          className="h-12 w-12 object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center">
                          <FaUser className="text-gray-400 text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{barber.name}</div>
                      <div className="text-sm text-gray-500">@{barber.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center mb-1">
                      <FaEnvelope className="text-gray-400 mr-2" size={12} />
                      {barber.email}
                    </div>
                    {barber.phoneNumber && (
                      <div className="flex items-center">
                        <FaPhone className="text-gray-400 mr-2" size={12} />
                        {barber.phoneNumber}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center mb-1">
                      <FaCalendarAlt className="text-gray-400 mr-2" size={12} />
                      {formatDate(barber.joinDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {calculateWorkDays(barber.joinDate)} days
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    barber.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {barber.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewStats(barber)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="View Statistics"
                    >
                      <FaChartLine size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(barber)}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Edit Barber"
                    >
                      <FaEdit size={16} />
                    </button>
                    {barber.active ? (
                      <button
                        onClick={() => handleDeactivate(barber._id, barber.name)}
                        disabled={deletingId === barber._id}
                        className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                        title="Deactivate Barber"
                      >
                        <FaBan size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePermanentDelete(barber._id, barber.name)}
                        disabled={deletingId === barber._id}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Permanently Delete Barber"
                      >
                        <FaTrash size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-200">
        {barbers.map((barber) => (
          <div key={barber._id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {barber.profilePicture ? (
                    <img
                      src={barber.profilePicture}
                      alt={barber.name}
                      className="h-14 w-14 object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 flex items-center justify-center">
                      <FaUser className="text-gray-400 text-xl" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-lg font-medium text-gray-900">{barber.name}</div>
                  <div className="text-sm text-gray-500">@{barber.username}</div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    barber.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {barber.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FaEnvelope className="text-gray-400 mr-3" size={14} />
                {barber.email}
              </div>
              {barber.phoneNumber && (
                <div className="flex items-center text-sm text-gray-600">
                  <FaPhone className="text-gray-400 mr-3" size={14} />
                  {barber.phoneNumber}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <FaCalendarAlt className="text-gray-400 mr-3" size={14} />
                Joined {formatDate(barber.joinDate)} ({calculateWorkDays(barber.joinDate)} days)
              </div>
            </div>



            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => onViewStats(barber)}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors text-sm"
              >
                <FaChartLine size={14} />
                Stats
              </button>
              <button
                onClick={() => onEdit(barber)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-sm"
              >
                <FaEdit size={14} />
                Edit
              </button>
              {barber.active ? (
                <button
                  onClick={() => handleDeactivate(barber._id, barber.name)}
                  disabled={deletingId === barber._id}
                  className="flex items-center gap-2 px-3 py-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  <FaBan size={14} />
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={() => handlePermanentDelete(barber._id, barber.name)}
                  disabled={deletingId === barber._id}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  <FaTrash size={14} />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 