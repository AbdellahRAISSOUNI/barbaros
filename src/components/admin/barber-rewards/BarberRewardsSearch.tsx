'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface BarberRewardsSearchProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onTypeChange: (type: string) => void;
  onSortChange: (sort: string) => void;
}

export default function BarberRewardsSearch({
  onSearch,
  onCategoryChange,
  onTypeChange,
  onSortChange
}: BarberRewardsSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white rounded-lg shadow-sm">
      {/* Search Input */}
      <div className="relative flex-grow">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search rewards"
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <select
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        defaultValue=""
      >
        <option value="">All Categories</option>
        <option value="milestone">Milestone</option>
        <option value="performance">Performance</option>
        <option value="loyalty">Loyalty</option>
        <option value="quality">Quality</option>
      </select>

      {/* Type Filter */}
      <select
        onChange={(e) => onTypeChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        defaultValue=""
      >
        <option value="">All Types</option>
        <option value="monetary">Monetary</option>
        <option value="gift">Gift</option>
        <option value="time_off">Time Off</option>
        <option value="recognition">Recognition</option>
      </select>

      {/* Sort */}
      <select
        onChange={(e) => onSortChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        defaultValue="priority"
      >
        <option value="priority">Sort by Priority</option>
        <option value="name">Sort by Name</option>
        <option value="type">Sort by Type</option>
        <option value="category">Sort by Category</option>
        <option value="created">Sort by Created Date</option>
      </select>
    </div>
  );
} 