'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaUserTie, FaSearch, FaFilter, FaEdit, FaChartLine, FaBan, FaTrash, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaEye, FaTh, FaList } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import BarberForm from '@/components/admin/barbers/BarberForm';
import BarberStatsModal from '@/components/admin/barbers/BarberStatsModal';

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

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [viewingStats, setViewingStats] = useState<Barber | null>(null);

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    filterBarbers();
  }, [barbers, searchTerm, statusFilter]);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/barbers');
      const data = await response.json();

      if (data.success) {
        setBarbers(data.barbers || []);
      } else {
        toast.error(data.error || 'Failed to fetch barbers');
      }
    } catch (error) {
      console.error('Error fetching barbers:', error);
      toast.error('Failed to fetch barbers');
    } finally {
      setLoading(false);
    }
  };

  const filterBarbers = () => {
    let filtered = [...barbers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(barber =>
        barber.name.toLowerCase().includes(term) ||
        barber.email.toLowerCase().includes(term) ||
        barber.username.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(barber => 
        statusFilter === 'active' ? barber.active : !barber.active
      );
    }

    setFilteredBarbers(filtered);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchBarbers();
  };

  const handleEditSuccess = () => {
    setEditingBarber(null);
    fetchBarbers();
  };

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber);
  };

  const handleViewStats = (barber: Barber) => {
    setViewingStats(barber);
  };

  const handleDeactivate = async (barberId: string, barberName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${barberName}? They will no longer be able to access the system.`)) {
      return;
    }

    setDeletingId(barberId);
    try {
      const response = await fetch(`/api/admin/barbers/${barberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });

      if (response.ok) {
        toast.success(`${barberName} has been deactivated`);
        fetchBarbers();
      } else {
        throw new Error('Failed to deactivate barber');
      }
    } catch (error) {
      toast.error('Failed to deactivate barber');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePermanentDelete = async (barberId: string, barberName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${barberName}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(barberId);
    try {
      const response = await fetch(`/api/admin/barbers/${barberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${barberName} has been permanently deleted`);
        fetchBarbers();
      } else {
        throw new Error('Failed to delete barber');
      }
    } catch (error) {
      toast.error('Failed to delete barber');
    } finally {
      setDeletingId(null);
    }
  };

  const getTotalStats = () => {
    const totalBarbers = barbers.length;
    const activeBarbers = barbers.filter(b => b.active).length;
    const inactiveBarbers = totalBarbers - activeBarbers;

    return { totalBarbers, activeBarbers, inactiveBarbers };
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

  const stats = getTotalStats();

  const BarberCard = ({ barber }: { barber: Barber }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={() => handleViewStats(barber)}
            className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 hover:ring-4 hover:ring-blue-500 hover:ring-opacity-30 transition-all duration-200 cursor-pointer mr-4"
            title="View Performance Statistics"
          >
            {barber.profilePicture ? (
              <img
                src={barber.profilePicture}
                alt={barber.name}
                className="h-16 w-16 object-cover"
              />
            ) : (
              <div className="h-16 w-16 flex items-center justify-center">
                <FaUser className="text-gray-400 text-2xl" />
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <button
              onClick={() => handleViewStats(barber)}
              className="text-left hover:text-blue-600 transition-colors cursor-pointer w-full"
              title="View Performance Statistics"
            >
              <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 mb-1">{barber.name}</h3>
              <p className="text-sm text-gray-500 mb-1">@{barber.username}</p>
            </button>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              barber.active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {barber.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <FaEnvelope className="text-gray-400 mr-3 flex-shrink-0" size={14} />
          <span className="truncate">{barber.email}</span>
        </div>
        {barber.phoneNumber && (
          <div className="flex items-center text-sm text-gray-600">
            <FaPhone className="text-gray-400 mr-3 flex-shrink-0" size={14} />
            <span className="truncate">{barber.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <FaCalendarAlt className="text-gray-400 mr-3 flex-shrink-0" size={14} />
          <span>Joined {formatDate(barber.joinDate)} ({calculateWorkDays(barber.joinDate)} days)</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          <span className="font-medium">Team Member</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewStats(barber)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Statistics"
          >
            <FaChartLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(barber)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            title="Edit Barber"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          {barber.active ? (
            <button
              onClick={() => handleDeactivate(barber._id, barber.name)}
              disabled={deletingId === barber._id}
              className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
              title="Deactivate Barber"
            >
              <FaBan className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handlePermanentDelete(barber._id, barber.name)}
              disabled={deletingId === barber._id}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Permanently Delete Barber"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const BarberTableRow = ({ barber }: { barber: Barber }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <button
            onClick={() => handleViewStats(barber)}
            className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all duration-200 cursor-pointer"
            title="View Performance Statistics"
          >
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
          </button>
          <div className="ml-4">
            <button
              onClick={() => handleViewStats(barber)}
              className="text-left hover:text-blue-600 transition-colors cursor-pointer"
              title="View Performance Statistics"
            >
              <div className="text-sm font-medium text-gray-900 hover:text-blue-600">{barber.name}</div>
              <div className="text-sm text-gray-500">@{barber.username}</div>
            </button>
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
            onClick={() => handleViewStats(barber)}
            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            title="View Statistics"
          >
            <FaChartLine size={16} />
          </button>
          <button
            onClick={() => handleEdit(barber)}
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
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading barbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaUserTie className="mr-3 text-black" />
            Team Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your barbershop team and track their performance
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-black transition-all duration-200 shadow-lg font-medium"
        >
          <FaPlus size={16} />
          Add Team Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-4 sm:p-6 aspect-square flex flex-col justify-center items-center text-center">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-xl mb-2 sm:mb-3">
            <FaUserTie className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-blue-600 mb-1">Total Team</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats.totalBarbers}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-4 sm:p-6 aspect-square flex flex-col justify-center items-center text-center">
          <div className="p-2 sm:p-3 bg-green-100 rounded-xl mb-2 sm:mb-3">
            <FaUserTie className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-green-600 mb-1">Active</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-900">{stats.activeBarbers}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-4 sm:p-6 aspect-square flex flex-col justify-center items-center text-center">
          <div className="p-2 sm:p-3 bg-red-100 rounded-xl mb-2 sm:mb-3">
            <FaUserTie className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-red-600 mb-1">Inactive</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-900">{stats.inactiveBarbers}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400"
              />
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" size={14} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaTh size={14} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaList size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barbers Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBarbers.map((barber) => (
            <BarberCard key={barber._id} barber={barber} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
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
                    Join Date
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
                {filteredBarbers.map((barber) => (
                  <BarberTableRow key={barber._id} barber={barber} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredBarbers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <FaUserTie className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No barbers found' : 'No team members yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first team member'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FaPlus size={16} />
              Add First Team Member
            </button>
          )}
        </div>
      )}

      {/* Create Barber Modal */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateForm(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <BarberForm
              onSubmit={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Barber Modal */}
      {editingBarber && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingBarber(null);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <BarberForm
              barber={editingBarber}
              onSubmit={handleEditSuccess}
              onCancel={() => setEditingBarber(null)}
              isEditing={true}
            />
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {viewingStats && (
        <BarberStatsModal
          barber={viewingStats}
          onClose={() => setViewingStats(null)}
          onEdit={() => {
            setEditingBarber(viewingStats);
            setViewingStats(null);
          }}
        />
      )}
    </div>
  );
} 