'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaUser, FaLock, FaEdit, FaCheck, FaTimes, FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface ClientData {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateCreated: string;
  lastLogin?: string;
  visitCount: number;
  totalLifetimeVisits: number;
  rewardsRedeemed: number;
  loyaltyStatus: string;
  accountActive: boolean;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ClientProfileForm() {
  const { data: session, update } = useSession();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch client data
  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clients/${session?.user?.id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setClientData(data.client);
        setProfileForm({
          firstName: data.client.firstName || '',
          lastName: data.client.lastName || '',
          phoneNumber: data.client.phoneNumber || ''
        });
      } else {
        toast.error(data.message || 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchClientData();
    }
  }, [session]);

  // Validate profile form
  const validateProfileForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!profileForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!profileForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!profileForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(profileForm.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!validateProfileForm()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/clients/${session?.user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setClientData(data.client);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        
        // Update session with new name
        await update({
          ...session,
          user: {
            ...session?.user,
            name: `${profileForm.firstName} ${profileForm.lastName}`
          }
        });
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/clients/${session?.user?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully!');
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormErrors({});
    if (clientData) {
      setProfileForm({
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        phoneNumber: clientData.phoneNumber
      });
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setFormErrors({});
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="p-6 text-center">
        <FaUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">Failed to load profile data</p>
        <button 
          onClick={fetchClientData}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {/* Profile Information */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-amber-500/20">
              <FaUser className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
              <p className="text-gray-600">Update your basic profile details</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <FaEdit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
              />
              {formErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
              />
              {formErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  formErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {formErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
              )}
            </div>

            <div className="flex items-center space-x-4 mt-6">
              <button
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <FaTimes className="h-4 w-4 mr-2 inline" />
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheck className="h-4 w-4 mr-2 inline" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
              <p className="text-lg text-gray-900">{clientData.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
              <p className="text-lg text-gray-900">{clientData.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
              <p className="text-lg text-gray-900">{clientData.phoneNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                clientData.accountActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {clientData.accountActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-amber-500/20">
            <FaUser className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
            <p className="text-gray-600">Your account details and statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/50">
            <p className="text-2xl font-bold bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 bg-clip-text text-transparent">{clientData.visitCount}</p>
            <p className="text-sm text-gray-600">Total Visits</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/50">
            <p className="text-2xl font-bold bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 bg-clip-text text-transparent">{clientData.totalLifetimeVisits}</p>
            <p className="text-sm text-gray-600">Lifetime Visits</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/50">
            <p className="text-2xl font-bold bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 bg-clip-text text-transparent">{clientData.rewardsRedeemed}</p>
            <p className="text-sm text-gray-600">Rewards Used</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/50">
            <p className="text-2xl font-bold bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 bg-clip-text text-transparent">{clientData.loyaltyStatus}</p>
            <p className="text-sm text-gray-600">Loyalty Status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/50">
            <span className="font-medium text-gray-700">Member since:</span>{' '}
            <span className="text-gray-900">{formatDate(clientData.dateCreated)}</span>
          </div>
          {clientData.lastLogin && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/50">
              <span className="font-medium text-gray-700">Last login:</span>{' '}
              <span className="text-gray-900">{formatDate(clientData.lastLogin)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}