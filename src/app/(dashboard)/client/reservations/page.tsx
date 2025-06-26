'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaPlus, FaPhone, FaCheck, FaTimes, FaInfo, FaHistory, FaChevronRight, FaStar } from 'react-icons/fa';
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
      case 'pending': return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200/50';
      case 'contacted': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200/50';
      case 'confirmed': return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200/50';
      case 'cancelled': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200/50';
      case 'completed': return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200/50';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200/50';
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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            {/* Premium Scissor Loading Animation */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                {/* Animated scissors */}
                <div className="relative w-20 h-20">
                  {/* Left blade */}
                  <div className="absolute top-3 left-3 w-4 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full transform rotate-45 origin-bottom animate-pulse shadow-lg"></div>
                  {/* Right blade */}
                  <div className="absolute top-3 right-3 w-4 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full transform -rotate-45 origin-bottom animate-pulse shadow-lg"></div>
                  {/* Center screw */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-amber-700 rounded-full shadow-inner"></div>
                  {/* Cutting motion */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                    <div className="w-1.5 h-1.5 bg-amber-300 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                {/* Sparkle effects */}
                <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 -right-2 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping delay-300"></div>
                <div className="absolute top-0 -right-3 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-700"></div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-amber-800 font-medium">Loading your premium reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-6 pb-20 sm:pb-6">
        {/* Premium Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 bg-clip-text text-transparent">
                My Reservations
              </h1>
              <p className="text-amber-700 mt-1 text-sm sm:text-base">Manage your upcoming appointments with elegance</p>
            </div>
            <Link
              href="/client/reservations/new"
              className="group relative inline-flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FaPlus className="h-4 w-4 relative z-10" />
              <span className="relative z-10">New Reservation</span>
            </Link>
          </div>
        </div>

        {/* Reservations List */}
        {reservations.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {reservations.map((reservation) => {
              const StatusIcon = getStatusIcon(reservation.status);
              const isUpcoming = new Date(reservation.formattedDateTime) > new Date() && 
                                 ['pending', 'contacted', 'confirmed'].includes(reservation.status);
              
              return (
                <div
                  key={reservation._id}
                  className={`relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border-2 p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                    isUpcoming 
                      ? 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-green-50/50' 
                      : 'border-amber-200/50 bg-gradient-to-br from-white/50 to-amber-50/30'
                  }`}
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                  
                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold text-amber-900">
                            {reservation.formattedDateTime}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${getStatusColor(reservation.status)}`}>
                            <StatusIcon className="h-3 w-3" />
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </span>
                          {isUpcoming && (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                              ✨ Upcoming
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-amber-700 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-100 rounded-lg">
                              <FaCalendarAlt className="h-3 w-3 text-amber-600" />
                            </div>
                            <span>Requested {formatRelativeTime(reservation.createdAt)}</span>
                          </div>
                          
                          {reservation.contactedAt && (
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-100 rounded-lg">
                                <FaPhone className="h-3 w-3 text-blue-600" />
                              </div>
                              <span>Contacted {formatRelativeTime(reservation.contactedAt)}</span>
                            </div>
                          )}
                        </div>

                        {reservation.notes && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
                            <p className="text-sm text-amber-800">
                              <strong className="text-amber-900">Your Notes:</strong> {reservation.notes}
                            </p>
                          </div>
                        )}

                        {reservation.adminNotes && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50">
                            <p className="text-sm text-emerald-800">
                              <strong className="text-emerald-900">Barbershop Notes:</strong> {reservation.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Messages */}
                    <div className="mt-4 pt-4 border-t border-amber-200/50">
                      {reservation.status === 'pending' && (
                        <div className="flex items-center gap-3 text-amber-800 bg-gradient-to-r from-amber-100 to-yellow-100 p-4 rounded-xl shadow-sm">
                          <div className="p-2 bg-amber-200 rounded-lg">
                            <FaClock className="h-4 w-4 text-amber-700" />
                          </div>
                          <p className="text-sm font-medium">
                            We'll contact you within 24 hours to confirm your premium appointment.
                          </p>
                        </div>
                      )}
                      
                      {reservation.status === 'contacted' && (
                        <div className="flex items-center gap-3 text-blue-800 bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-xl shadow-sm">
                          <div className="p-2 bg-blue-200 rounded-lg">
                            <FaPhone className="h-4 w-4 text-blue-700" />
                          </div>
                          <p className="text-sm font-medium">
                            We've reached out about your appointment. Please check your phone!
                          </p>
                        </div>
                      )}
                      
                      {reservation.status === 'confirmed' && (
                        <div className="flex items-center gap-3 text-emerald-800 bg-gradient-to-r from-emerald-100 to-green-100 p-4 rounded-xl shadow-sm">
                          <div className="p-2 bg-emerald-200 rounded-lg">
                            <FaCheck className="h-4 w-4 text-emerald-700" />
                          </div>
                          <p className="text-sm font-medium">
                            Your premium appointment is confirmed! We're excited to serve you.
                          </p>
                        </div>
                      )}
                      
                      {reservation.status === 'completed' && (
                        <div className="flex items-center gap-3 text-emerald-800 bg-gradient-to-r from-emerald-100 to-green-100 p-4 rounded-xl shadow-sm">
                          <div className="p-2 bg-emerald-200 rounded-lg">
                            <FaStar className="h-4 w-4 text-emerald-700" />
                          </div>
                          <p className="text-sm font-medium">
                            Thank you for choosing our premium service! We hope you loved your experience.
                          </p>
                        </div>
                      )}
                      
                      {reservation.status === 'cancelled' && (
                        <div className="flex items-center gap-3 text-red-800 bg-gradient-to-r from-red-100 to-rose-100 p-4 rounded-xl shadow-sm">
                          <div className="p-2 bg-red-200 rounded-lg">
                            <FaTimes className="h-4 w-4 text-red-700" />
                          </div>
                          <p className="text-sm font-medium">
                            This appointment was cancelled. Feel free to book another appointment anytime.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="relative max-w-md mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-amber-200/50">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FaCalendarAlt className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full"></div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-amber-900 mb-3">No Reservations Yet</h3>
                <p className="text-amber-700 mb-6 text-sm sm:text-base">Start your premium barbershop journey by booking your first appointment</p>
                
                <Link
                  href="/client/reservations/new"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <FaPlus className="h-4 w-4" />
                  <span>Book Your First Appointment</span>
                  <FaChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 