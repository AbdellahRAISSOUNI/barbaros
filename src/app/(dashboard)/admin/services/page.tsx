'use client';

import { useState } from 'react';
import { FaCut, FaTags } from 'react-icons/fa';
import ServicesTab from '@/components/admin/services/ServicesTab';
import CategoriesTab from '@/components/admin/services/CategoriesTab';

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Services Management</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaCut className="inline mr-2" />
            Services
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaTags className="inline mr-2" />
            Categories
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'services' && <ServicesTab />}
        {activeTab === 'categories' && <CategoriesTab />}
      </div>
    </div>
  );
} 