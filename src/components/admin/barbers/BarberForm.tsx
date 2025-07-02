'use client';

import { useState, useRef } from 'react';
import { FaUpload, FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { AdminModal } from '@/components/ui/AdminModal';

interface Barber {
  _id: string;
  name: string;
  email: string;
  username: string;
  profilePicture?: string;
  phoneNumber?: string;
  active: boolean;
  joinDate: string;
}

interface BarberFormProps {
  barber?: Barber;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function BarberForm({ barber, onSubmit, onCancel, isEditing = false }: BarberFormProps) {
  const [formData, setFormData] = useState({
    name: barber?.name || '',
    email: barber?.email || '',
    username: barber?.username || '',
    password: '',
    confirmPassword: '',
    phoneNumber: barber?.phoneNumber || '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(barber?.profilePicture || '');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.username.trim() || !formData.phoneNumber.trim()) {
      toast.error('Please fill in all required fields (name, username, phone)');
      return;
    }

    if (!isEditing && !formData.password) {
      toast.error('Password is required for new barbers');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Validate email only if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    try {
      setLoading(true);

      const submitData: any = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        username: formData.username.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      };

      // Add password for new barbers
      if (!isEditing && formData.password) {
        submitData.password = formData.password;
      }

      // Handle image upload
      if (imageFile) {
        try {
          const base64Image = await convertImageToBase64(imageFile);
          submitData.profilePicture = base64Image;
        } catch (error) {
          console.error('Error converting image:', error);
          toast.error('Error processing image');
          return;
        }
      } else if (imagePreview && !isEditing) {
        // Keep existing image for edits
        submitData.profilePicture = imagePreview;
      }

      const url = isEditing ? `/api/admin/barbers/${barber?._id}` : '/api/admin/barbers';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isEditing ? 'Barber updated successfully' : 'Barber created successfully');
        onSubmit();
      } else {
        toast.error(data.error || data.message || 'Failed to save barber');
      }
    } catch (error) {
      console.error('Error saving barber:', error);
      toast.error('Error saving barber');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? 'Edit Barber' : 'Add New Barber'}
      maxWidth="2xl"
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-6">
            
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Picture
              </label>
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32 bg-gray-100 rounded-full border-4 border-gray-200 group">
                    {imagePreview ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            // Create a modal to view the image in full size
                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4';
                            modal.onclick = () => modal.remove();
                            modal.innerHTML = `
                              <div class="relative max-w-2xl max-h-[90vh]">
                                <img src="${imagePreview}" alt="Profile preview" class="w-full h-full object-contain rounded-lg shadow-2xl">
                                <button class="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">×</button>
                              </div>
                            `;
                            document.body.appendChild(modal);
                          }}
                          className="w-full h-full rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          title="Click to view full size"
                        >
                          <img
                            src={imagePreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-sm font-bold shadow-lg"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-full">
                        <FaUser className="text-gray-400 text-4xl" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-900"
                  >
                    <FaUpload size={14} className="text-gray-900" />
                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Max 5MB. JPG, PNG, WebP supported.
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400 text-black"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2" />
                  Phone Number *
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400 text-black"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Email Address (optional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400 text-black"
                  placeholder="Enter email address (optional)"
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Account Information
              </h3>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-2" />
                  Username *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="Enter username"
                  required
                  disabled={isEditing} // Don't allow username changes
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                )}
              </div>

              {(!isEditing || formData.password) && (
                <>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      <FaLock className="inline mr-2" />
                      {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black pr-10"
                        placeholder="Enter password"
                        required={!isEditing}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 p-1"
                      >
                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      <FaLock className="inline mr-2" />
                      Confirm Password {!isEditing && '*'}
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black pr-10"
                        placeholder="Confirm password"
                        required={!isEditing && !!formData.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 p-1"
                      >
                        {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg text-sm sm:text-base"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Barber' : 'Create Barber')}
            </button>
          </div>
        </form>
    </AdminModal>
  );
} 