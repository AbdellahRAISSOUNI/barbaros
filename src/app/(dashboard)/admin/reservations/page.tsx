'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPhone, FaEye, FaEyeSlash, FaTrash, FaFilter, FaBell, FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
    pending: FaClock,
    contacted: FaPhone,
    confirmed: FaCheckCircle,
    cancelled: FaTimesCircle,
    completed: FaCheckCircle
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
        className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all duration-200 hover:shadow-lg ${
          isNew ? 'border-yellow-300 bg-yellow-50 shadow-lg' : 'border-gray-200'
        }`}
      >
        {/* New Badge */}
        {isNew && (
          <div className="flex items-center justify-between mb-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-medium"
            >
              <FaBell className="h-3 w-3" />
              NEW RESERVATION
            </motion.div>
            <span className="text-xs text-gray-500">{formatRelativeTime(reservation.createdAt)}</span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{reservation.displayName}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[reservation.status]}`}>
                <StatusIcon className="h-3 w-3" />
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="h-4 w-4" />
                <span>{reservation.formattedDateTime}</span>
              </div>
              <div className="flex items-center gap-2">
                {reservation.source === 'guest' ? <FaUser className="h-4 w-4" /> : <FaUsers className="h-4 w-4" />}
                <span>{reservation.contactInfo}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                  {reservation.source === 'guest' ? 'Guest' : 'Account'}
                </span>
              </div>
            </div>

            {reservation.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Notes:</strong> {reservation.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => updateReservationStatus(reservation._id, reservation.isRead ? 'mark_unread' : 'mark_read')}
              className={`p-2 rounded-lg transition-colors ${
                reservation.isRead 
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
              title={reservation.isRead ? 'Mark as unread' : 'Mark as read'}
            >
              {reservation.isRead ? <FaEyeSlash /> : <FaEye />}
            </button>
            
            <button
              onClick={() => {
                setSelectedReservation(reservation);
                setShowDetailsModal(true);
              }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="View details"
            >
              <FaSearch />
            </button>
            
            <button
              onClick={() => deleteReservation(reservation._id)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete reservation"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {reservation.status === 'pending' && (
            <button
              onClick={() => updateReservationStatus(reservation._id, 'update_status', 'contacted')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark Contacted
            </button>
          )}
          {reservation.status === 'contacted' && (
            <button
              onClick={() => updateReservationStatus(reservation._id, 'update_status', 'confirmed')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirm
            </button>
          )}
          {['pending', 'contacted'].includes(reservation.status) && (
            <button
              onClick={() => updateReservationStatus(reservation._id, 'update_status', 'cancelled')}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          )}
          {reservation.status === 'confirmed' && (
            <button
              onClick={() => updateReservationStatus(reservation._id, 'update_status', 'completed')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Complete
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                  <FaBell className="h-4 w-4" />
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{stats.overview.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-yellow-600">{stats.overview.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">{stats.overview.contacted}</div>
                <div className="text-sm text-gray-600">Contacted</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-green-600">{stats.overview.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">{stats.overview.today}</div>
                <div className="text-sm text-gray-600">Today</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-indigo-600">{stats.overview.upcoming}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-500" />
                <span className="font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="guest">Guest Bookings</option>
                <option value="client_account">Account Bookings</option>
              </select>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Unread only</span>
              </label>

              <div className="flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder="Search reservations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
                <p className="text-gray-500">No reservations match your current filters.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Reservation Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-lg">{selectedReservation.displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact</label>
                    <p className="text-lg">{selectedReservation.contactInfo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <p className="text-lg">{selectedReservation.formattedDateTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Source</label>
                    <p className="text-lg capitalize">{selectedReservation.source.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-lg capitalize">{selectedReservation.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-lg">{new Date(selectedReservation.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedReservation.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedReservation.notes}</p>
                  </div>
                )}
                
                {selectedReservation.contactedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contacted At</label>
                    <p className="text-gray-700">{new Date(selectedReservation.contactedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 