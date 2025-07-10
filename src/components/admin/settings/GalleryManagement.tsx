'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Transformation, TransformationCategory, ServiceType } from '@/lib/db/models/transformation';

interface GalleryManagementProps {
  onClose?: () => void;
}

interface ImageUpload {
  file: File;
  preview: string;
  type: 'before' | 'after';
}

export default function GalleryManagement({ onClose }: GalleryManagementProps) {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<Transformation | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [services, setServices] = useState<any[]>([
    { _id: '1', name: 'COMPLETE TRANSFORMATION' },
    { _id: '2', name: 'EXECUTIVE STYLING' },
    { _id: '3', name: 'BEARD SCULPTING' },
    { _id: '4', name: 'MODERN CUT' },
    { _id: '5', name: 'CLASSIC GENTLEMAN' }
  ]);
  const [categories, setCategories] = useState<any[]>([
    { _id: '1', name: 'Classic' },
    { _id: '2', name: 'Executive' },
    { _id: '3', name: 'Beard' },
    { _id: '4', name: 'Modern' },
    { _id: '5', name: 'Special' }
  ]);
  
  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    service: '',
    description: '',
    category: '',
    featured: false,
  });
  
  const [beforeImages, setBeforeImages] = useState<ImageUpload[]>([]);
  const [afterImages, setAfterImages] = useState<ImageUpload[]>([]);
  
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  // Fetch transformations
  const fetchTransformations = async () => {
    try {
      const response = await fetch('/api/admin/transformations');
      if (response.ok) {
        const data = await response.json();
        setTransformations(data);
      }
    } catch (error) {
      console.error('Failed to fetch transformations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch services and categories
  const fetchServicesAndCategories = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch('/api/services?limit=100&isActive=true'),
        fetch('/api/service-categories?limit=100&activeOnly=true')
      ]);
      
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        // Handle API response format: {success: true, services: []} or {success: true, data: []}
        const apiServices = servicesData.services || servicesData.data || servicesData;
        if (Array.isArray(apiServices) && apiServices.length > 0) {
          setServices(apiServices);
        }
        // If API returns empty array or invalid data, keep the default fallback values
      }
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        // Handle API response format: {success: true, categories: []} or {success: true, data: []}
        const apiCategories = categoriesData.categories || categoriesData.data || categoriesData;
        if (Array.isArray(apiCategories) && apiCategories.length > 0) {
          setCategories(apiCategories);
        }
        // If API returns empty array or invalid data, keep the default fallback values
      }
    } catch (error) {
      console.error('Failed to fetch services/categories:', error);
      // Keep default fallback values that were initialized in useState
    }
  };

  useEffect(() => {
    fetchTransformations();
    fetchServicesAndCategories();
  }, []);

  // Handle file selection
  const handleFileSelect = (files: FileList | null, type: 'before' | 'after') => {
    if (!files) return;

    const newImages: ImageUpload[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview, type });
      }
    });

    if (type === 'before') {
      setBeforeImages(prev => [...prev, ...newImages]);
    } else {
      setAfterImages(prev => [...prev, ...newImages]);
    }
  };

  // Remove image
  const removeImage = (index: number, type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforeImages(prev => {
        URL.revokeObjectURL(prev[index].preview);
        return prev.filter((_, i) => i !== index);
      });
    } else {
      setAfterImages(prev => {
        URL.revokeObjectURL(prev[index].preview);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (beforeImages.length === 0 || afterImages.length === 0) {
      alert('Please upload both before and after images');
      return;
    }

    if (!formData.clientName || !formData.service || !formData.description || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      // Create FormData for file uploads
      const uploadData = new FormData();
      
      // Add form fields
      uploadData.append('clientName', formData.clientName);
      uploadData.append('service', formData.service);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);
      uploadData.append('featured', formData.featured.toString());
      
      // Add before images
      beforeImages.forEach((img, index) => {
        uploadData.append(`beforeImages`, img.file);
      });
      
      // Add after images
      afterImages.forEach((img, index) => {
        uploadData.append(`afterImages`, img.file);
      });

      const response = await fetch('/api/admin/transformations', {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        // Reset form
        setFormData({
          clientName: '',
          service: '',
          description: '',
          category: '',
          featured: false,
        });
        setBeforeImages([]);
        setAfterImages([]);
        setShowUploadForm(false);
        
        // Refresh list
        fetchTransformations();
        
        alert('Transformation uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload transformation');
    } finally {
      setUploading(false);
    }
  };

  // Delete transformation
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transformation?')) return;

    try {
      const response = await fetch(`/api/admin/transformations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTransformations();
        alert('Transformation deleted successfully!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete transformation');
    }
  };

  // Toggle featured status
  const toggleFeatured = async (transformation: Transformation) => {
    try {
      const response = await fetch(`/api/admin/transformations/${transformation._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !transformation.featured }),
      });

      if (response.ok) {
        fetchTransformations();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gallery Management</h2>
            <p className="text-sm text-gray-600 mt-1">Manage before/after transformations for the public gallery</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              {showUploadForm ? 'Cancel' : 'Add New'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Transformation</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select a service</option>
                    {Array.isArray(services) && services.map(service => (
                      <option key={service._id} value={service.name}>{service.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select a category</option>
                    {Array.isArray(categories) && categories.map(category => (
                      <option key={category._id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured on homepage</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Before Images
                  </label>
                  <div
                    onClick={() => beforeInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors"
                  >
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">Click to upload before images</p>
                  </div>
                  <input
                    ref={beforeInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files, 'before')}
                    className="hidden"
                  />
                  
                  {/* Before Image Previews */}
                  {beforeImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {beforeImages.map((img, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={img.preview}
                            alt={`Before ${index + 1}`}
                            width={150}
                            height={150}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, 'before')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* After Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    After Images
                  </label>
                  <div
                    onClick={() => afterInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors"
                  >
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">Click to upload after images</p>
                  </div>
                  <input
                    ref={afterInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files, 'after')}
                    className="hidden"
                  />
                  
                  {/* After Image Previews */}
                  {afterImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {afterImages.map((img, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={img.preview}
                            alt={`After ${index + 1}`}
                            width={150}
                            height={150}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, 'after')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || beforeImages.length === 0 || afterImages.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Transformation'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transformations List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Existing Transformations ({transformations.length})
          </h3>
          
          {transformations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transformations uploaded yet. Add your first transformation above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transformations.map((transformation) => (
                <div key={transformation._id?.toString()} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{transformation.clientName}</h4>
                    {transformation.featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{transformation.service}</p>
                  <p className="text-xs text-gray-500 mb-3">{transformation.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {transformation.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFeatured(transformation)}
                        className="p-1 text-yellow-600 hover:text-yellow-700"
                        title="Toggle Featured"
                      >
                        <svg className="w-4 h-4" fill={transformation.featured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(transformation._id?.toString() || '')}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 