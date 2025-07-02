'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPhone, FaEye, FaEyeSlash, FaTrash, FaFilter, FaBell, FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaUsers } from 'react-icons/fa';
import { HiCalendarDays, HiPhone, HiEye, HiEyeSlash, HiTrash, HiMagnifyingGlass, HiCheckCircle, HiXCircle, HiClock, HiUser, HiUserGroup, HiBell, HiChatBubbleLeftRight } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

interface Reservation {
  _id: string;
  displayName: string;
  contactInfo: string;
  formattedDateTime: string;
  preferredDate: string;
  preferredTime: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled' | 'completed';
  isRead: boolean;
  source: 'guest' | 'client_account';
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  contactedAt?: string;
  contactedBy?: { name: string; email: string };
  clientId?: { firstName: string; lastName: string; email: string; phoneNumber: string };
  guestName?: string;
  guestPhone?: string;
}

interface ReservationStats {
  overview: {
    total: number;
    unread: number;
    pending: number;
    contacted: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    today: number;
    upcoming: number;
    recent24h: number;
  };
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    contacted: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const statusIcons = {
    pending: HiClock,
    contacted: HiPhone,
    confirmed: HiCheckCircle,
    cancelled: HiXCircle,
    completed: HiCheckCircle
  };

  useEffect(() => {
    fetchReservations();
    fetchStats();
    
    // Poll for new reservations every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [selectedStatus, selectedSource, showUnreadOnly]);

  const fetchReservations = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedSource !== 'all') params.append('source', selectedSource);
      if (showUnreadOnly) params.append('isRead', 'false');
      
      const response = await fetch(`/api/reservations?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setReservations(data.reservations);
      } else {
        toast.error('Failed to fetch reservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/reservations/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateReservationStatus = async (id: string, action: string, newStatus?: string) => {
    try {
      const body: any = { action };
      if (newStatus) body.status = newStatus;
      
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        fetchReservations();
        fetchStats();
        toast.success(
          action === 'mark_read' ? 'Marked as read' :
          action === 'mark_unread' ? 'Marked as unread' :
          `Reservation ${newStatus === 'contacted' ? 'marked as contacted' : 
            newStatus === 'confirmed' ? 'confirmed' : 
            newStatus === 'completed' ? 'completed' : 
            newStatus === 'cancelled' ? 'cancelled' : 
            `updated to ${newStatus}`} and marked as read`
        );
      } else {
        toast.error('Failed to update reservation');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Failed to update reservation');
    }
  };

  const fixUnreadReservations = async () => {
    try {
      const response = await fetch('/api/reservations/fix-unread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        fetchReservations();
        fetchStats();
        toast.success(`Fixed ${data.details.updated} processed reservations that were incorrectly marked as unread`);
      } else {
        toast.error('Failed to fix unread reservations');
      }
    } catch (error) {
      console.error('Error fixing unread reservations:', error);
      toast.error('Failed to fix unread reservations');
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;
    
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchReservations();
        fetchStats();
        toast.success('Reservation deleted');
      } else {
        toast.error('Failed to delete reservation');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Failed to delete reservation');
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        reservation.displayName.toLowerCase().includes(search) ||
        reservation.contactInfo.toLowerCase().includes(search) ||
        reservation.formattedDateTime.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const isNew = !reservation.isRead && reservation.status === 'pending';
    const StatusIcon = statusIcons[reservation.status];
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-white rounded-2xl shadow-sm border ${
          isNew ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-yellow-100' : 'border-gray-200 hover:border-gray-300'
        } p-5 transition-all duration-200 hover:shadow-md`}
      >
        {/* New Badge */}
        {isNew && (
          <div className="flex items-center justify-between mb-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-sm"
            >
              <HiBell className="h-4 w-4" />
              NEW RESERVATION
            </motion.div>
            <span className="text-xs text-gray-500 font-medium">{formatRelativeTime(reservation.createdAt)}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {reservation.source === 'guest' ? 
                  <HiUser className="h-5 w-5 text-gray-500" /> : 
                  <HiUserGroup className="h-5 w-5 text-gray-500" />
                }
                {reservation.displayName}
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[reservation.status]}`}>
                <StatusIcon className="h-4 w-4" />
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <HiCalendarDays className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium">{reservation.formattedDateTime}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <HiPhone className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium">{reservation.contactInfo}</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full font-medium text-gray-600">
                  {reservation.source === 'guest' ? 'Guest' : 'Account'}
                </span>
              </div>

              {reservation.notes && (
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <HiChatBubbleLeftRight className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    {reservation.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-4">
            <button
              onClick={() => updateReservationStatus(reservation._id, reservation.isRead ? 'mark_unread' : 'mark_read')}
              className={`p-2 rounded-xl transition-all ${
                reservation.isRead 
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 hover:shadow-sm' 
                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:shadow-sm'
              }`}
              title={reservation.isRead ? 'Mark as unread' : 'Mark as read'}
            >
              {reservation.isRead ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => {
                setSelectedReservation(reservation);
                setShowDetailsModal(true);
              }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all hover:shadow-sm"
              title="View details"
            >
              <HiMagnifyingGlass className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => deleteReservation(reservation._id)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all hover:shadow-sm"
              title="Delete reservation"
            >
              <HiTrash className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {reservation.status === 'pending' && (
            <button
              onClick={() => updateReservationStatus(reservation._id, 'update_status', 'contacted')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-xl hover:shadow-md hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
            >
              <HiPhone className="h-4 w-4" />
              Mark Contacted
            </button>
          )}
          {reservation.status === 'contacted' && (
            <button
              onClick={() => updateReservationStatus(reservation._id, 'update_status', 'confirmed')}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-xl hover:shadow-md hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2"
            >
              <HiCheckCircle className="h-4 w-4" />
              Confirm
            </button>
          )}
          {['pending', 'contacted'].includes(reservation.status) && (
            <button
              onClick={() => updateReservationStatus(reservation._id, 'update_status', 'cancelled')}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded-xl hover:shadow-md hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2"
            >
              <HiXCircle className="h-4 w-4" />
              Cancel
            </button>
          )}
          {reservation.status === 'confirmed' && (
            <button
              onClick={() => updateReservationStatus(reservation._id, 'update_status', 'completed')}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-xl hover:shadow-md hover:from-gray-700 hover:to-gray-800 transition-all flex items-center gap-2"
            >
              <HiCheckCircle className="h-4 w-4" />
              Complete
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex justify-center items-center">
        <div className="text-center">
          <LoadingAnimation size="lg" className="mb-4" />
          <p className="text-amber-800 font-medium">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reservations Management</h1>
              <p className="text-gray-600 mt-1">Manage and track all customer reservations</p>
            </div>
            <div className="flex items-center gap-3">
              {stats && stats.overview.unread > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow-lg"
                >
                  <HiBell className="h-4 w-4" />
                  <span className="font-semibold">{stats.overview.unread} New</span>
                </motion.div>
              )}
              
              {stats && stats.overview.unread > 0 && (
                <button
                  onClick={fixUnreadReservations}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title="Fix notifications for processed reservations"
                >
                  Fix Notifications
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.overview.total}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Total</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-3 sm:p-4 rounded-xl shadow-sm border border-yellow-200 hover:shadow-md transition-shadow">
                <div className="text-lg sm:text-2xl font-bold text-yellow-700">{stats.overview.pending}</div>
                <div className="text-xs sm:text-sm text-yellow-600 font-medium">Pending</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 sm:p-4 rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                <div className="text-lg sm:text-2xl font-bold text-blue-700">{stats.overview.contacted}</div>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">Contacted</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                <div className="text-lg sm:text-2xl font-bold text-green-700">{stats.overview.confirmed}</div>
                <div className="text-xs sm:text-sm text-green-600 font-medium">Confirmed</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-3 sm:p-4 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
                <div className="text-lg sm:text-2xl font-bold text-purple-700">{stats.overview.today}</div>
                <div className="text-xs sm:text-sm text-purple-600 font-medium">Today</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 sm:p-4 rounded-xl shadow-sm border border-indigo-200 hover:shadow-md transition-shadow">
                <div className="text-lg sm:text-2xl font-bold text-indigo-700">{stats.overview.upcoming}</div>
                <div className="text-xs sm:text-sm text-indigo-600 font-medium">Upcoming</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <HiMagnifyingGlass className="text-gray-500" />
                <span className="font-medium text-gray-700 text-sm sm:text-base">Filters:</span>
              </div>
              
              <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-black"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-black"
                >
                  <option value="all">All Sources</option>
                  <option value="guest">Guest Bookings</option>
                  <option value="client_account">Account Bookings</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 select-none">Unread only</span>
              </label>

              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search reservations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black placeholder:text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation) => (
                <ReservationCard key={reservation._id} reservation={reservation} />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <HiCalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
                <p className="text-gray-500">No reservations match your current filters.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedReservation && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDetailsModal(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-gray-100">
                    <HiCalendarDays className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Reservation Details</h2>
                    <p className="text-sm text-gray-500">View complete reservation information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <HiXCircle className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-5">
                {/* Main Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <HiUser className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-medium">{selectedReservation.displayName}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500">Contact</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <HiPhone className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-medium">{selectedReservation.contactInfo}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <HiCalendarDays className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-medium">{selectedReservation.formattedDateTime}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500">Source</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      {selectedReservation.source === 'guest' ? 
                        <HiUser className="h-4 w-4 text-gray-500" /> : 
                        <HiUserGroup className="h-4 w-4 text-gray-500" />
                      }
                      <p className="text-sm font-medium capitalize">{selectedReservation.source.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedReservation.status]}`}>
                        {statusIcons[selectedReservation.status]({ className: "h-4 w-4" })}
                        {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <HiClock className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-medium">{new Date(selectedReservation.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedReservation.notes && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <HiChatBubbleLeftRight className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{selectedReservation.notes}</p>
                    </div>
                  </div>
                )}

                {/* Contact History */}
                {selectedReservation.contactedAt && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500">Contact History</label>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <HiPhone className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Contacted on {new Date(selectedReservation.contactedAt).toLocaleString()}
                        </p>
                        {selectedReservation.contactedBy && (
                          <p className="text-xs text-blue-700">
                            by {selectedReservation.contactedBy.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-200 flex justify-end gap-2.5">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-3 py-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                >
                  Close
                </button>
                {selectedReservation.status === 'pending' && (
                  <button
                    onClick={() => {
                      updateReservationStatus(selectedReservation._id, 'update_status', 'contacted');
                      setShowDetailsModal(false);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-md hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm flex items-center gap-1.5"
                  >
                    <HiPhone className="h-3.5 w-3.5" />
                    Mark Contacted
                  </button>
                )}
                {selectedReservation.status === 'contacted' && (
                  <button
                    onClick={() => {
                      updateReservationStatus(selectedReservation._id, 'update_status', 'confirmed');
                      setShowDetailsModal(false);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-md hover:from-green-700 hover:to-green-800 transition-all font-medium text-sm flex items-center gap-1.5"
                  >
                    <HiCheckCircle className="h-3.5 w-3.5" />
                    Confirm
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 