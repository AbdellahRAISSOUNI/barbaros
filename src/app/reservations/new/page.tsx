'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaUser, FaCheck, FaArrowLeft, FaStar, FaSignInAlt, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

export default function GuestReservationPage() {
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

  if (isSuccess && reservationDetails) {
    return (
      <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center p-4" style={{
        '--off-white': '#FAFAF8',
        '--deep-green': '#1B3B36',
        '--dark-red': '#8B2635',
        '--dark-brown': '#1A1A1A',
        '--warm-beige': '#F0EBE3',
        '--premium-green': '#2A5A4B', 
      } as React.CSSProperties}>
        <div className="max-w-2xl w-full">
          <div className="bg-white p-12 border border-[var(--deep-green)] border-opacity-10 text-center">
            <FaCheck className="h-16 w-16 text-[var(--deep-green)] mx-auto mb-8" />
            
            <h1 className="text-3xl md:text-4xl font-light text-[var(--deep-green)] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Reservation Sent Successfully
            </h1>
            
            <div className="bg-[var(--warm-beige)] bg-opacity-30 border border-[var(--deep-green)] border-opacity-10 p-8 mb-8 text-left">
              <h3 className="font-light text-[var(--deep-green)] mb-6 text-lg tracking-wider">RESERVATION DETAILS</h3>
              <div className="space-y-3 text-[var(--dark-brown)] font-light">
                <p><strong>Name:</strong> {reservationDetails.displayName}</p>
                <p><strong>Date & Time:</strong> {reservationDetails.formattedDateTime}</p>
                <p><strong>Status:</strong> <span className="capitalize">{reservationDetails.status}</span></p>
                <p><strong>Contact:</strong> {reservationDetails.contactInfo}</p>
              </div>
            </div>

            <div className="bg-[var(--deep-green)] p-6 mb-8">
              <p className="text-white text-sm font-light">
                Your reservation has been received. We'll contact you shortly to confirm your appointment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="px-8 py-3 bg-[var(--deep-green)] text-white text-sm font-light tracking-wider hover:bg-[var(--premium-green)] transition-colors duration-300"
              >
                <FaArrowLeft className="inline-block mr-2" />
                BACK TO HOME
              </Link>
              <Link 
                href="/reservations/new"
                className="px-8 py-3 bg-[var(--dark-red)] text-white text-sm font-light tracking-wider hover:bg-opacity-80 transition-colors duration-300"
                onClick={() => {
                  setIsSuccess(false);
                  setReservationDetails(null);
                  setFormData({ guestName: '', guestPhone: '', preferredDate: '', preferredTime: '', notes: '' });
                }}
              >
                MAKE ANOTHER RESERVATION
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--off-white)]" style={{
      '--off-white': '#FAFAF8',
      '--deep-green': '#1B3B36',
      '--dark-red': '#8B2635',
      '--dark-brown': '#1A1A1A',
      '--warm-beige': '#F0EBE3',
      '--premium-green': '#2A5A4B',
    } as React.CSSProperties}>
      {/* Header */}
      <header className="bg-white border-b border-[var(--deep-green)] border-opacity-10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-2xl font-light text-[var(--deep-green)]" style={{ fontFamily: 'Playfair Display, serif' }}>
            BARBAROS
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[var(--deep-green)] text-white text-sm font-light tracking-wider hover:bg-[var(--premium-green)] transition-colors duration-300"
            >
              <FaSignInAlt className="h-4 w-4" />
              LOGIN TO BOOK
            </Link>
            <Link 
              href="/"
              className="px-4 py-2 text-[var(--deep-green)] hover:text-[var(--dark-red)] transition-colors duration-300 text-sm font-light tracking-wider"
            >
              <FaArrowLeft className="inline-block mr-2" />
              BACK
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[var(--deep-green)] mb-4 sm:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Guest Reservation
            </h1>
            <p className="text-lg sm:text-xl font-light text-[var(--dark-brown)] opacity-80 max-w-2xl mx-auto mb-6">
              Book your appointment quickly without creating an account
            </p>
            <div className="max-w-md mx-auto p-4 sm:p-6 bg-[var(--deep-green)]">
              <p className="text-white text-sm font-light">
                Have an account? <Link href="/login" className="underline hover:text-[var(--warm-beige)] transition-colors duration-300">Login here</Link> to book with your client profile and track your reservation history.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 sm:p-12 border border-[var(--deep-green)] border-opacity-10">
                <div className="mb-8 sm:mb-12">
                  <h3 className="text-xl font-light mb-4 flex items-center gap-3 text-[var(--deep-green)] tracking-wider">
                    <FaUser className="text-[var(--deep-green)]" />
                    GUEST INFORMATION
                  </h3>
                  <p className="text-[var(--dark-brown)] text-sm font-light opacity-70">No account needed - just fill in your details below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                  {/* Guest Information */}
                  <div className="space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      <div>
                        <label htmlFor="guestName" className="block text-sm font-light text-[var(--deep-green)] mb-3 tracking-wider">
                          FULL NAME *
                        </label>
                        <input
                          type="text"
                          id="guestName"
                          name="guestName"
                          value={formData.guestName}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm font-light tracking-wider text-[var(--dark-brown)] placeholder-gray-400 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="guestPhone" className="block text-sm font-light text-[var(--deep-green)] mb-3 tracking-wider">
                          PHONE NUMBER *
                        </label>
                        <input
                          type="tel"
                          id="guestPhone"
                          name="guestPhone"
                          value={formData.guestPhone}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm font-light tracking-wider text-[var(--dark-brown)] placeholder-gray-400 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300"
                          placeholder="(123) 456-7890"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date and Time Selection */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-light flex items-center gap-3 text-[var(--deep-green)] tracking-wider">
                      <FaCalendarAlt className="text-[var(--deep-green)]" />
                      PREFERRED DATE & TIME
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      <div>
                        <label htmlFor="preferredDate" className="block text-sm font-light text-[var(--deep-green)] mb-3 tracking-wider">
                          PREFERRED DATE *
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
                          className="w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm font-light tracking-wider text-[var(--dark-brown)] focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="preferredTime" className="block text-sm font-light text-[var(--deep-green)] mb-3 tracking-wider">
                          PREFERRED TIME *
                        </label>
                        <select
                          id="preferredTime"
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm font-light tracking-wider text-[var(--dark-brown)] focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300"
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
                    <label htmlFor="notes" className="block text-sm font-light text-[var(--deep-green)] mb-3 tracking-wider">
                      SPECIAL REQUESTS (OPTIONAL)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-transparent border border-[var(--deep-green)] border-opacity-20 p-4 text-sm font-light tracking-wider text-[var(--dark-brown)] placeholder-gray-400 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300"
                      placeholder="Any specific requests or preferences..."
                      maxLength={500}
                    />
                    <div className="text-right text-xs text-[var(--dark-brown)] opacity-60 mt-2 font-light">
                      {formData.notes.length}/500 characters
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 sm:px-12 py-4 bg-[var(--dark-red)] text-white text-sm font-light tracking-wider hover:bg-[var(--premium-green)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center justify-center">
                          <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                          SENDING RESERVATION...
                        </span>
                      ) : (
                        <>
                          <FaCalendarAlt className="inline-block mr-2" />
                          SEND RESERVATION REQUEST
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6 sm:space-y-8">
              {/* Account Benefits */}
              <div className="bg-white p-6 sm:p-8 border border-[var(--deep-green)] border-opacity-10">
                <h3 className="text-lg font-light mb-6 text-[var(--deep-green)] tracking-wider">
                  <FaStar className="inline-block mr-2 text-[var(--dark-red)]" />
                  WANT MORE BENEFITS?
                </h3>
                <ul className="space-y-3 text-sm text-[var(--dark-brown)] font-light mb-6 opacity-80">
                  <li>• Track all your reservations</li>
                  <li>• Earn loyalty points</li>
                  <li>• Access exclusive rewards</li>
                  <li>• Get priority booking</li>
                  <li>• Receive special offers</li>
                </ul>
                <Link
                  href="/register"
                  className="block w-full text-center px-6 py-3 bg-[var(--deep-green)] text-white text-sm font-light tracking-wider hover:bg-[var(--premium-green)] transition-colors duration-300"
                >
                  CREATE AN ACCOUNT
                </Link>
              </div>

              {/* Booking Process */}
              <div className="bg-white p-8 border border-[var(--deep-green)] border-opacity-10">
                <h3 className="text-lg font-light mb-6 text-[var(--deep-green)] tracking-wider">HOW IT WORKS</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-[var(--deep-green)] bg-opacity-10 flex items-center justify-center mr-4 mt-1">
                      <span className="text-[var(--deep-green)] font-light text-sm">1</span>
                    </div>
                    <div>
                      <div className="font-light text-[var(--dark-brown)] tracking-wider">FILL FORM</div>
                      <div className="text-sm text-[var(--dark-brown)] opacity-70 font-light">Enter your details and preferred time</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-[var(--deep-green)] bg-opacity-10 flex items-center justify-center mr-4 mt-1">
                      <span className="text-[var(--deep-green)] font-light text-sm">2</span>
                    </div>
                    <div>
                      <div className="font-light text-[var(--dark-brown)] tracking-wider">GET CONFIRMATION CALL</div>
                      <div className="text-sm text-[var(--dark-brown)] opacity-70 font-light">We'll call within 24 hours</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-[var(--deep-green)] bg-opacity-10 flex items-center justify-center mr-4 mt-1">
                      <span className="text-[var(--deep-green)] font-light text-sm">3</span>
                    </div>
                    <div>
                      <div className="font-light text-[var(--dark-brown)] tracking-wider">VISIT US</div>
                      <div className="text-sm text-[var(--dark-brown)] opacity-70 font-light">Arrive on time for your appointment</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white p-8 border border-[var(--deep-green)] border-opacity-10">
                <h3 className="text-lg font-light mb-6 text-[var(--deep-green)] tracking-wider">
                  <FaClock className="inline-block mr-2" />
                  BUSINESS HOURS
                </h3>
                <div className="space-y-3 text-sm font-light text-[var(--dark-brown)]">
                  <div className="flex justify-between">
                    <span>Tuesday — Friday</span>
                    <span>9:00 AM — 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>9:00 AM — 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday — Monday</span>
                    <span>Closed</span>
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