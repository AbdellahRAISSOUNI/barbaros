'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaUser, FaCheck, FaArrowLeft, FaStar, FaSignInAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function GuestReservationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<any>(null);

  // Redirect if user is logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/client');
    }
  }, [session, status, router]);

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

    if (!formData.guestName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.guestPhone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (formData.guestPhone.length < 10) {
      toast.error('Please enter a valid phone number');
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

    setIsSubmitting(true);

    try {
      const requestData = {
        guestName: formData.guestName.trim(),
        guestPhone: formData.guestPhone.trim(),
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

  // Show loading while checking auth status
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center">
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
          <p className="mt-6 text-amber-800 font-medium">Loading reservation system...</p>
        </div>
      </div>
    );
  }

  if (isSuccess && reservationDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheck className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Reservation Sent Successfully!
            </h1>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-green-800 mb-4">Reservation Details:</h3>
              <div className="space-y-2 text-green-700">
                <p><strong>Name:</strong> {reservationDetails.displayName}</p>
                <p><strong>Date & Time:</strong> {reservationDetails.formattedDateTime}</p>
                <p><strong>Status:</strong> <span className="capitalize">{reservationDetails.status}</span></p>
                <p><strong>Contact:</strong> {reservationDetails.contactInfo}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
              <p className="text-blue-700 text-sm">
                We'll call you within 24 hours to confirm your appointment and discuss any specific requirements. 
                Please keep your phone available!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaArrowLeft className="inline-block mr-2" />
                Back to Home
              </Link>
              <Link 
                href="/reservations/new"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => {
                  setIsSuccess(false);
                  setReservationDetails(null);
                  setFormData({ guestName: '', guestPhone: '', preferredDate: '', preferredTime: '', notes: '' });
                }}
              >
                Make Another Reservation
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Barbaros
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaSignInAlt className="h-4 w-4" />
              Login to Book with Account
            </Link>
            <Link 
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="inline-block mr-2" />
              Back
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Guest Reservation
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Book your appointment quickly without creating an account
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md mx-auto">
              <p className="text-blue-800 text-sm">
                <strong>Have an account?</strong> <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Login here</Link> to book with your client profile and track your reservation history.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Guest Information
                  </h3>
                  <p className="text-gray-600 text-sm">No account needed - just fill in your details below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Guest Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="guestName"
                          name="guestName"
                          value={formData.guestName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="guestPhone"
                          name="guestPhone"
                          value={formData.guestPhone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="(123) 456-7890"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date and Time Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-600" />
                      Preferred Date & Time
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Date *
                        </label>
                        <input
                          type="date"
                          id="preferredDate"
                          name="preferredDate"
                          value={formData.preferredDate}
                          onChange={handleInputChange}
                          min={getMinDate()}
                          max={getMaxDate()}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Time *
                        </label>
                        <select
                          id="preferredTime"
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select time</option>
                          {timeSlots.map(slot => (
                            <option key={slot.value} value={slot.value}>
                              {slot.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any specific requests or preferences..."
                      maxLength={500}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {formData.notes.length}/500 characters
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Reservation...
                      </div>
                    ) : (
                      <>
                        <FaCalendarAlt className="inline-block mr-2" />
                        Send Reservation Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Account Benefits */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">
                  <FaStar className="inline-block mr-2 text-yellow-500" />
                  Want More Benefits?
                </h3>
                <ul className="space-y-3 text-sm text-blue-700 mb-4">
                  <li>• Track all your reservations</li>
                  <li>• Earn loyalty points</li>
                  <li>• Access exclusive rewards</li>
                  <li>• Faster booking process</li>
                  <li>• View visit history</li>
                </ul>
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login / Create Account
                </Link>
              </div>

              {/* Booking Process */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <div className="font-medium">Fill Form</div>
                      <div className="text-sm text-gray-600">Enter your details and preferred time</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <div className="font-medium">Get Confirmation Call</div>
                      <div className="text-sm text-gray-600">We'll call within 24 hours</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <div className="font-medium">Visit Us</div>
                      <div className="text-sm text-gray-600">Arrive on time for your appointment</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  <FaClock className="inline-block mr-2" />
                  Business Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>10:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 