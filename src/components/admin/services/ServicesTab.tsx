'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaEyeSlash, FaImage, FaCut } from 'react-icons/fa';
import ServiceForm from './ServiceForm';
import { toast } from 'react-hot-toast';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
  categoryId: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  popularityScore: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export default function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [currentPage, searchTerm, filterCategory, filterStatus]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
      });

      if (filterCategory) params.append('categoryId', filterCategory);
      if (filterStatus) params.append('isActive', filterStatus);

      const response = await fetch(`/api/services?${params}`);
      const data = await response.json();

      if (data.success) {
        setServices(data.services);
        setTotalPages(data.pagination.pages);
      } else {
        toast.error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/service-categories?activeOnly=true');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Service deleted successfully');
        fetchServices();
      } else {
        toast.error(data.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error deleting service');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}?action=toggle-status`, {
        method: 'PATCH',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Service status updated');
        fetchServices();
      } else {
        toast.error(data.message || 'Failed to update service status');
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error('Error updating service status');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingService(null);
    fetchServices();
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-black"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {(searchTerm || filterCategory || filterStatus) && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FaPlus />
          Add Service
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <FaCut className="mx-auto text-4xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterCategory || filterStatus
              ? 'Try adjusting your filters'
              : 'Get started by creating your first service'}
          </p>
          {!(searchTerm || filterCategory || filterStatus) && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FaPlus />
              Add Service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Service Image */}
              <div className="h-32 bg-gray-100 relative">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaImage className="text-2xl text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleToggleStatus(service._id)}
                    className={`p-1 rounded-full ${
                      service.isActive
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                    title={service.isActive ? 'Active' : 'Inactive'}
                  >
                    {service.isActive ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
                  </button>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-1">{service.name}</h3>
                  <span className="text-lg font-semibold text-green-600">
                    {service.price} MAD
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>{service.durationMinutes} min</span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {service.categoryId?.name || 'No Category'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black"
                  >
                    <FaEdit size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="flex items-center justify-center px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm bg-black text-white rounded-lg">
              {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Service Form Modal */}
      {showForm && (
        <ServiceForm
          service={editingService}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
} 