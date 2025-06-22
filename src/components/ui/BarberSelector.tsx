'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaUser, FaChevronDown } from 'react-icons/fa';

interface Barber {
  _id: string;
  name: string;
  profilePicture?: string;
  active: boolean;
}

interface BarberSelectorProps {
  selectedBarberId?: string;
  selectedBarberName?: string;
  onBarberChange: (barberId: string | undefined, barberName: string) => void;
  disabled?: boolean;
}

export default function BarberSelector({ 
  selectedBarberId, 
  selectedBarberName, 
  onBarberChange, 
  disabled = false 
}: BarberSelectorProps) {
  const { data: session } = useSession();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isBarber = session?.user?.role === 'barber';
  const isAdmin = session?.user?.role === 'owner' || session?.user?.role === 'receptionist';

  useEffect(() => {
    if (isBarber && session?.user?.id) {
      // For barbers, auto-select themselves
      fetchCurrentBarberInfo();
    } else if (isAdmin) {
      // For admins, load all barbers for selection
      fetchAllBarbers();
    }
  }, [session, isBarber, isAdmin]);

  const fetchCurrentBarberInfo = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/admin/barbers/${session.user.id}`);
      const data = await response.json();

      if (data.success) {
        // Auto-select the current barber
        onBarberChange(data.barber._id, data.barber.name);
      }
    } catch (error) {
      console.error('Error fetching current barber:', error);
    }
  };

  const fetchAllBarbers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/barbers');
      const data = await response.json();

      if (data.success) {
        const activeBarbers = data.barbers.filter((barber: Barber) => barber.active);
        setBarbers(activeBarbers);
      }
    } catch (error) {
      console.error('Error fetching barbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarberSelect = (barber: Barber) => {
    onBarberChange(barber._id, barber.name);
    setIsOpen(false);
  };

  const selectedBarber = barbers.find(b => b._id === selectedBarberId);

  // For barbers, show a read-only display
  if (isBarber) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FaUser className="inline mr-1" />
          Barber
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Barber'}
                  className="h-8 w-8 object-cover"
                />
              ) : (
                <div className="h-8 w-8 flex items-center justify-center">
                  <FaUser className="text-gray-400 text-sm" />
                </div>
              )}
            </div>
            <span className="text-gray-900 font-medium">
              {selectedBarberName || session?.user?.name || 'You'}
            </span>
          </div>
          <span className="ml-auto text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-full">
            Auto-selected
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Visits will be automatically attributed to you
        </p>
      </div>
    );
  }

  // For admins, show a dropdown selector
  if (isAdmin) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FaUser className="inline mr-1" />
          Select Barber *
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
            disabled={disabled || loading}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-black focus:border-transparent flex items-center justify-between ${
              disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              {selectedBarber ? (
                <>
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                    {selectedBarber.profilePicture ? (
                      <img
                        src={selectedBarber.profilePicture}
                        alt={selectedBarber.name}
                        className="h-8 w-8 object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 flex items-center justify-center">
                        <FaUser className="text-gray-400 text-sm" />
                      </div>
                    )}
                  </div>
                  <span className="text-gray-900">{selectedBarber.name}</span>
                </>
              ) : (
                <span className="text-gray-500">
                  {loading ? 'Loading barbers...' : 'Choose a barber'}
                </span>
              )}
            </div>
            <FaChevronDown 
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown */}
          {isOpen && !disabled && !loading && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {barbers.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No active barbers available
                </div>
              ) : (
                barbers.map((barber) => (
                  <button
                    key={barber._id}
                    type="button"
                    onClick={() => handleBarberSelect(barber)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center transition-colors ${
                      selectedBarberId === barber._id ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                      {barber.profilePicture ? (
                        <img
                          src={barber.profilePicture}
                          alt={barber.name}
                          className="h-8 w-8 object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 flex items-center justify-center">
                          <FaUser className="text-gray-400 text-sm" />
                        </div>
                      )}
                    </div>
                    <span>{barber.name}</span>
                    {selectedBarberId === barber._id && (
                      <span className="ml-auto text-blue-600 text-sm">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {!selectedBarberId && (
          <p className="text-xs text-red-500 mt-1">
            Please select which barber performed the services
          </p>
        )}
      </div>
    );
  }

  // Fallback for other roles
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <FaUser className="inline mr-1" />
        Barber Name *
      </label>
      <input
        type="text"
        value={selectedBarberName || ''}
        onChange={(e) => onBarberChange(undefined, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        placeholder="Enter barber name"
        required
        disabled={disabled}
      />
    </div>
  );
} 