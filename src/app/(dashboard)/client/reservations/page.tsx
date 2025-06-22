'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaPlus, FaPhone, FaCheck, FaTimes, FaInfo } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Reservation {
  _id: string;
  displayName: string;
  formattedDateTime: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  contactedAt?: string;
}

export default function ClientReservationsPage() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchReservations();
    }
  }, [session]);

  const fetchReservations = async () => {
    try {
      const response = await fetch(`/api/reservations?clientId=${session?.user?.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setReservations(data.reservations || []);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return FaClock;
      case 'contacted': return FaPhone;
      case 'confirmed': return FaCheck;
      case 'cancelled': return FaTimes;
      case 'completed': return FaCheck;
      default: return FaInfo;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
            <p className="text-gray-600 mt-1">Track your appointments and booking history</p>
          </div>
          <Link
            href="/reservations/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <FaPlus className="h-4 w-4" />
            New Reservation
          </Link>
        </div>

        {/* Reservations List */}
        {reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const StatusIcon = getStatusIcon(reservation.status);
              const isUpcoming = new Date(reservation.formattedDateTime) > new Date() && 
                                 ['pending', 'contacted', 'confirmed'].includes(reservation.status);
              
              return (
                <div
                  key={reservation._id}
                  className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all duration-200 hover:shadow-md ${
                    isUpcoming ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reservation.formattedDateTime}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                          <StatusIcon className="h-3 w-3" />
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                        {isUpcoming && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Upcoming
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="h-4 w-4" />
                          <span>Requested {formatRelativeTime(reservation.createdAt)}</span>
                        </div>
                        
                        {reservation.contactedAt && (
                          <div className="flex items-center gap-2">
                            <FaPhone className="h-4 w-4" />
                            <span>Contacted {formatRelativeTime(reservation.contactedAt)}</span>
                          </div>
                        )}
                      </div>

                      {reservation.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Your Notes:</strong> {reservation.notes}
                          </p>
                        </div>
                      )}

                      {reservation.adminNotes && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Barbershop Notes:</strong> {reservation.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status-specific messages */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {reservation.status === 'pending' && (
                      <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                        <FaClock className="h-4 w-4" />
                        <p className="text-sm">
                          We'll call you within 24 hours to confirm your appointment.
                        </p>
                      </div>
                    )}
                    
                    {reservation.status === 'contacted' && (
                      <div className="flex items-center gap-2 text-blue-700 bg-blue-50 p-3 rounded-lg">
                        <FaPhone className="h-4 w-4" />
                        <p className="text-sm">
                          We've contacted you about this appointment. Please check your phone!
                        </p>
                      </div>
                    )}
                    
                    {reservation.status === 'confirmed' && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                        <FaCheck className="h-4 w-4" />
                        <p className="text-sm">
                          Your appointment is confirmed! Please arrive on time.
                        </p>
                      </div>
                    )}
                    
                    {reservation.status === 'cancelled' && (
                      <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
                        <FaTimes className="h-4 w-4" />
                        <p className="text-sm">
                          This appointment has been cancelled.
                        </p>
                      </div>
                    )}
                    
                    {reservation.status === 'completed' && (
                      <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <FaCheck className="h-4 w-4" />
                        <p className="text-sm">
                          This appointment was completed. Thanks for visiting us!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <FaCalendarAlt className="mx-auto h-16 w-16 text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Reservations Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't made any reservations yet. Book your first appointment to get started!
            </p>
            <Link
              href="/reservations/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <FaCalendarAlt className="h-4 w-4" />
              Make Your First Reservation
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/reservations/new"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaPlus className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Book New Appointment</p>
                <p className="text-sm text-gray-600">Schedule your next visit</p>
              </div>
            </Link>
            
            <Link
              href="/client/history"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <FaClock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Visit History</p>
                <p className="text-sm text-gray-600">View your completed visits</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 