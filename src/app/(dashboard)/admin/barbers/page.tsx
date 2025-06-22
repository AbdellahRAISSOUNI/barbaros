'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaUserTie, FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import BarberForm from '@/components/admin/barbers/BarberForm';
import BarbersTable from '@/components/admin/barbers/BarbersTable';
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

  const getTotalStats = () => {
    const totalBarbers = barbers.length;
    const activeBarbers = barbers.filter(b => b.active).length;
    const inactiveBarbers = totalBarbers - activeBarbers;

    return { totalBarbers, activeBarbers, inactiveBarbers };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaUserTie className="mr-3 text-black" />
            Team Barbers
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
          Add New Barber
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Barbers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBarbers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaUserTie className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Barbers</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeBarbers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FaUserTie className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Barbers</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactiveBarbers}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <FaUserTie className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search barbers by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        {(searchTerm || statusFilter !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredBarbers.length} of {barbers.length} barbers
              {searchTerm && (
                <span className="ml-1">
                  matching "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="ml-1">
                  • <span className="font-medium">{statusFilter}</span> only
                </span>
              )}
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Barbers Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      ) : (
        <BarbersTable
          barbers={filteredBarbers}
          onEdit={handleEdit}
          onRefresh={fetchBarbers}
          onViewStats={handleViewStats}
        />
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <BarberForm
          onSubmit={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Form Modal */}
      {editingBarber && (
        <BarberForm
          barber={editingBarber}
          onSubmit={handleEditSuccess}
          onCancel={() => setEditingBarber(null)}
          isEditing={true}
        />
      )}

      {/* Stats Modal */}
      {viewingStats && (
        <BarberStatsModal
          barber={viewingStats}
          onClose={() => setViewingStats(null)}
        />
      )}
    </div>
  );
} 