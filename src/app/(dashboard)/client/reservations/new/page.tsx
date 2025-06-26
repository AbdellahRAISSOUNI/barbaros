'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaCheck, FaArrowLeft, FaStar, FaUser, FaChevronRight, FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Premium Scissor Loading Component
const ScissorLoader = () => (
  <div className="flex items-center justify-center">
    <div className="relative">
      {/* Animated scissors */}
      <div className="relative w-16 h-16">
        {/* Left blade */}
        <div className="absolute top-2 left-2 w-3 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full transform rotate-45 origin-bottom animate-pulse shadow-lg"></div>
        {/* Right blade */}
        <div className="absolute top-2 right-2 w-3 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full transform -rotate-45 origin-bottom animate-pulse shadow-lg"></div>
        {/* Center screw */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-700 rounded-full shadow-inner"></div>
        {/* Cutting motion */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div className="w-1 h-1 bg-amber-300 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>
      {/* Sparkle effects */}
      <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
      <div className="absolute -bottom-2 -right-2 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping delay-300"></div>
      <div className="absolute top-0 -right-3 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-700"></div>
    </div>
  </div>
);

export default function ClientReservationPage() {
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<any>(null);

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.preferredDate || !formData.preferredTime) {
      toast.error('Please select both date and time');
      return false;
    }

    // Validate selected date is not in the past
    const selectedDate = new Date(formData.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      toast.error('Please select a future date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!session?.user?.id) {
      toast.error('Authentication error. Please login again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        clientId: session.user.id,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        notes: formData.notes.trim() || undefined
      };

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create reservation');
      }

      setReservationDetails(data.reservation);
      setIsSuccess(true);
      toast.success('Reservation created successfully!');

    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && reservationDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50 flex items-center justify-center p-2 sm:p-4">
        <div className="max-w-2xl w-full">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 text-center border border-emerald-200/50 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-200/30 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaCheck className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-900 to-green-800 bg-clip-text text-transparent mb-4">
                Reservation Confirmed!
              </h1>
              
              <div className="bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200/50 rounded-2xl p-4 sm:p-6 mb-6 text-left">
                <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <FaCrown className="h-4 w-4" />
                  Premium Reservation Details
                </h3>
                <div className="space-y-2 text-emerald-800">
                  <p><strong>Client:</strong> {reservationDetails.displayName}</p>
                  <p><strong>Date & Time:</strong> {reservationDetails.formattedDateTime}</p>
                  <p><strong>Status:</strong> <span className="capitalize font-semibold">{reservationDetails.status}</span></p>
                  <p><strong>Contact:</strong> {reservationDetails.contactInfo}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/50 rounded-2xl p-4 sm:p-6 mb-8">
                <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <ScissorLoader />
                  What's Next?
                </h3>
                <p className="text-amber-800 text-sm">
                  Our premium concierge will contact you within 24 hours to confirm your appointment and discuss any personalized preferences.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  href="/client/reservations"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <FaCalendarAlt className="h-4 w-4" />
                  View All Reservations
                  <FaChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/client"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
                >
                  <FaArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-6 pb-20 sm:pb-6">
        {/* Premium Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 bg-clip-text text-transparent">
                Book Premium Appointment
              </h1>
              <p className="text-amber-700 mt-1 text-sm sm:text-base">Schedule your personalized barbershop experience</p>
            </div>
            <Link
              href="/client/reservations"
              className="group inline-flex items-center gap-2 px-4 py-2 text-amber-700 hover:text-amber-900 transition-colors font-medium"
            >
              <FaArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Reservations
            </Link>
          </div>
        </div>

        {/* Single Column Layout */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-8 border border-amber-200/50 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full -translate-y-24 translate-x-24"></div>
            
            <div className="relative z-10">
              {/* Client Info Section */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                    <FaUser className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-amber-900">Client Information</h2>
                    <p className="text-amber-700 text-sm">Premium member booking</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-4 border border-amber-200/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-amber-800 font-medium">Name:</span>
                      <p className="text-amber-900 font-semibold">{session?.user?.name}</p>
                    </div>
                    <div>
                      <span className="text-amber-800 font-medium">Phone:</span>
                      <p className="text-amber-900 font-semibold">{(session?.user as any)?.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="flex items-center gap-2 text-amber-900 font-semibold mb-3">
                    <FaCalendarAlt className="h-4 w-4" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/50 bg-white/80 backdrop-blur-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all text-amber-900 font-medium"
                    required
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="flex items-center gap-2 text-amber-900 font-semibold mb-3">
                    <FaClock className="h-4 w-4" />
                    Preferred Time
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/50 bg-white/80 backdrop-blur-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all text-amber-900 font-medium"
                    required
                  >
                    <option value="">Select your preferred time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-2 text-amber-900 font-semibold mb-3">
                    <FaStar className="h-4 w-4" />
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any specific requests or preferences for your appointment..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/50 bg-white/80 backdrop-blur-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all text-amber-900 placeholder-amber-600/60 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <ScissorLoader />
                        <span className="ml-2">Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaCheck className="h-4 w-4" />
                        Confirm Premium Reservation
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 