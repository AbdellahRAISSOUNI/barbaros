'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaEdit, FaSave, FaTimes, FaUpload, FaCamera } from 'react-icons/fa';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and settings</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FaEdit size={16} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-black to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                  {(isEditing ? editForm.profilePicture : profile.profilePicture) ? (
                    <img
                      src={isEditing ? editForm.profilePicture : profile.profilePicture}
                      alt={profile.name}
                      className="h-20 w-20 object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 flex items-center justify-center">
                      <FaUser className="text-white/60 text-2xl" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 p-2 bg-white text-gray-700 rounded-full cursor-pointer hover:bg-gray-50 transition-colors shadow-lg">
                    <FaCamera size={12} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-white/80">@{profile.username}</p>
                <div className="flex items-center mt-2">
                  <FaCalendarAlt className="mr-2" size={14} />
                  <span className="text-white/80">
                    Joined {formatDate(profile.joinDate)} • {calculateWorkDays(profile.joinDate)} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {isEditing ? (
              // Edit Form
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editForm.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaTimes className="inline mr-2" size={14} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaSave className="inline mr-2" size={14} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <p className="text-lg text-gray-900">{profile.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                      <p className="text-lg text-gray-900">{profile.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                      <p className="text-lg text-gray-900">@{profile.username}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                      <p className="text-lg text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                      <p className="text-lg text-gray-900 capitalize">{profile.role}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        profile.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/barber/scanner'}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <FaCamera className="h-5 w-5 text-gray-600 group-hover:text-gray-900 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Scanner</h4>
                  <p className="text-sm text-gray-600">Scan client QR codes</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/barber/visits'}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <FaCalendarAlt className="h-5 w-5 text-gray-600 group-hover:text-gray-900 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">My Visits</h4>
                  <p className="text-sm text-gray-600">View visit history</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/barber'}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <FaUser className="h-5 w-5 text-gray-600 group-hover:text-gray-900 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Dashboard</h4>
                  <p className="text-sm text-gray-600">View performance</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
