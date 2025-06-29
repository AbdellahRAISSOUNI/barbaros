'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaEdit, FaSave, FaTimes, FaUpload, FaLock, FaKey } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface BarberProfile {
  _id: string;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  profilePicture?: string;
  joinDate: string;
  role: string;
  active: boolean;
}

export default function BarberProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    profilePicture: ''
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/barbers/${session?.user?.id}`);
      const data = await response.json();

      if (data.success) {
        setProfile(data.barber);
        setEditForm({
          name: data.barber.name || '',
          email: data.barber.email || '',
          phoneNumber: data.barber.phoneNumber || '',
          profilePicture: data.barber.profilePicture || ''
        });
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm(prev => ({ ...prev, profilePicture: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/admin/barbers/${session?.user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.barber);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long');
        return;
      }

      setSaving(true);

      const response = await fetch('/api/barber/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password updated successfully');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error updating password');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        profilePicture: profile.profilePicture || ''
      });
    }
    setIsEditing(false);
  };

  const handlePasswordCancel = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateWorkDays = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-stone-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-stone-600 text-sm">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 pt-2 pb-3 sm:py-3 lg:py-4 space-y-2 md:space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800 leading-none">My Profile</h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">Manage your personal information</p>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            {!isEditing && !isChangingPassword && (
              <>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-colors text-xs sm:text-sm"
                >
                  <FaKey className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Password</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold bg-gradient-to-r from-emerald-800 to-emerald-700 text-white hover:from-emerald-900 hover:to-emerald-800 transition-colors text-xs sm:text-sm"
                >
                  <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-stone-200/60 overflow-hidden backdrop-blur-sm">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="relative mx-auto sm:mx-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-xl overflow-hidden bg-white/20 flex-shrink-0 backdrop-blur-sm">
                  {(isEditing ? editForm.profilePicture : profile.profilePicture) ? (
                    <img
                      src={isEditing ? editForm.profilePicture : profile.profilePicture}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <FaUser className="text-white/60 text-3xl sm:text-4xl lg:text-5xl" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 p-2 sm:p-3 bg-white text-emerald-800 rounded-full cursor-pointer hover:bg-emerald-50 transition-colors shadow-lg">
                    <FaUpload className="w-3 h-3 sm:w-4 sm:h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">{profile.name}</h2>
                <p className="text-emerald-100 text-sm sm:text-base lg:text-lg">@{profile.username}</p>
                <div className="flex items-center justify-center sm:justify-start mt-2 text-sm sm:text-base">
                  <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-emerald-100">
                    Joined {formatDate(profile.joinDate)} • {calculateWorkDays(profile.joinDate)} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {isEditing ? (
              // Edit Form
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-stone-600 mb-1 sm:mb-2">
                      <FaUser className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:border-emerald-700 focus:ring-emerald-700/20 transition-colors text-sm sm:text-base placeholder-stone-800"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-stone-600 mb-1 sm:mb-2">
                      <FaEnvelope className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:border-emerald-700 focus:ring-emerald-700/20 transition-colors text-sm sm:text-base placeholder-stone-800"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-stone-600 mb-1 sm:mb-2">
                      <FaPhone className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editForm.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:border-emerald-700 focus:ring-emerald-700/20 transition-colors text-sm sm:text-base placeholder-stone-800"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end pt-4 sm:pt-6">
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto order-1 sm:order-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors text-sm sm:text-base"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold bg-gradient-to-r from-emerald-800 to-emerald-700 text-white hover:from-emerald-900 hover:to-emerald-800 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : isChangingPassword ? (
              // Password Change Form
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-stone-600 mb-1 sm:mb-2">
                      <FaLock className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:border-emerald-700 focus:ring-emerald-700/20 transition-colors text-sm sm:text-base placeholder-stone-800"
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-stone-600 mb-1 sm:mb-2">
                      <FaLock className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:border-emerald-700 focus:ring-emerald-700/20 transition-colors text-sm sm:text-base placeholder-stone-800"
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-stone-600 mb-1 sm:mb-2">
                      <FaLock className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:border-emerald-700 focus:ring-emerald-700/20 transition-colors text-sm sm:text-base placeholder-stone-800"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end pt-4 sm:pt-6">
                  <button
                    onClick={handlePasswordCancel}
                    className="w-full sm:w-auto order-1 sm:order-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors text-sm sm:text-base"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordSave}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold bg-gradient-to-r from-emerald-800 to-emerald-700 text-white hover:from-emerald-900 hover:to-emerald-800 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-stone-500 mb-1">Email</label>
                    <p className="text-base sm:text-lg text-stone-800">{profile.email}</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-stone-500 mb-1">Username</label>
                    <p className="text-base sm:text-lg text-stone-800">@{profile.username}</p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-stone-500 mb-1">Phone Number</label>
                    <p className="text-base sm:text-lg text-stone-800">{profile.phoneNumber || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-stone-500 mb-1">Role</label>
                    <p className="text-base sm:text-lg text-stone-800 capitalize">{profile.role}</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-stone-500 mb-1">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                      profile.active 
                        ? 'bg-emerald-100 text-emerald-900' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
