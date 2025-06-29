'use client';

import { useState } from 'react';
import { FaSearch, FaSpinner, FaUser, FaPhone, FaClock } from 'react-icons/fa';

interface ClientLookupProps {
  onClientFound: (clientId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function ClientLookup({
  onClientFound,
  onError,
  className = '',
}: ClientLookupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'phone' | 'clientId'>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<Array<{id: string, name: string, phone: string}>>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    if (searchTerm.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the general search API that searches across multiple fields
      const response = await fetch(`/api/clients/search?q=${encodeURIComponent(searchTerm.trim())}&page=1&limit=10`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No clients found matching your search');
          if (onError) onError('No clients found');
          return;
        }
        throw new Error('Failed to search for clients');
      }
      
      const data = await response.json();
      
      if (data.clients && data.clients.length > 0) {
        // If only one client found, select it automatically
        if (data.clients.length === 1) {
          const client = data.clients[0];
          onClientFound(client._id); // Use MongoDB _id for consistency
          
          // Add to recent searches
          if (!recentSearches.some(search => search.id === client._id)) {
            setRecentSearches(prev => [
              { 
                id: client._id, 
                name: `${client.firstName} ${client.lastName}`, 
                phone: client.phoneNumber 
              },
              ...prev.slice(0, 4)
            ]);
          }
        } else {
          // Multiple clients found - show them for selection
          setError(`Found ${data.clients.length} clients. Please be more specific or select from results below.`);
        }
      } else {
        setError('No clients found matching your search');
        if (onError) onError('No clients found');
      }
    } catch (err) {
      console.error('Error searching for clients:', err);
      setError('Failed to search for clients. Please try again.');
      if (onError) onError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearchClick = (clientId: string) => {
    onClientFound(clientId);
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'name': return 'Enter first name, last name, or both';
      case 'phone': return 'Enter phone number';
      case 'clientId': return 'Enter client ID';
      default: return 'Enter search term';
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case 'name': return FaUser;
      case 'phone': return FaPhone;
      case 'clientId': return FaSearch;
      default: return FaSearch;
    }
  };

  const SearchIcon = getSearchIcon();

  return (
    <div className={`${className}`}>
      <div className="bg-white rounded-xl shadow-lg border border-stone-200/60 overflow-hidden">
        {/* Search Type Selection */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">Search By</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { value: 'name', label: 'Name', icon: FaUser },
                  { value: 'phone', label: 'Phone', icon: FaPhone },
                  { value: 'clientId', label: 'Client ID', icon: FaSearch },
                ].map(({ value, label, icon: Icon }) => (
                  <label key={value} className="relative group">
                    <input
                      type="radio"
                      name="search-type"
                      value={value}
                      checked={searchType === value}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="sr-only"
                    />
                    <div 
                      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        searchType === value
                          ? 'bg-gradient-to-br from-[#8B0000] to-[#A31515] border-[#8B0000]/20 shadow-lg transform scale-[1.02]'
                          : 'border-stone-200/60 bg-white text-stone-700 hover:border-[#8B0000]/20 hover:shadow-md hover:scale-[1.01]'
                      }`}
                    >
                      <Icon 
                        className={`h-5 w-5 sm:h-6 sm:w-6 mb-2 transition-transform group-hover:scale-110 ${
                          searchType === value ? 'text-white' : 'text-[#8B0000]'
                        }`} 
                      />
                      <span className={`text-xs sm:text-sm font-medium ${
                        searchType === value ? 'text-white' : 'text-stone-800'
                      }`}>
                        {label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Search Input */}
            <div>
              <label htmlFor="search-term" className="block text-sm font-medium text-stone-700 mb-2">
                Search Term
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className={`h-4 w-4 transition-colors ${isLoading ? 'text-[#8B0000]' : 'text-stone-400 group-hover:text-[#8B0000]'}`} />
                </div>
                <input
                  type="text"
                  id="search-term"
                  className="pl-10 w-full p-3 sm:p-4 border border-stone-200/60 rounded-xl focus:ring-2 focus:ring-[#8B0000] focus:border-transparent transition-all text-stone-800 placeholder:text-stone-400 hover:border-[#8B0000]/20"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <FaSpinner className="animate-spin h-4 w-4 text-[#8B0000]" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50/50 border border-red-200/50 rounded-xl">
                <p className="text-red-800 text-sm font-medium">Search Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            )}
            
            {/* Search Button */}
            <button
              type="submit"
              disabled={isLoading || !searchTerm.trim() || searchTerm.trim().length < 2}
              className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                isLoading || !searchTerm.trim() || searchTerm.trim().length < 2
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-[#8B0000] to-[#A31515] text-white hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch className="h-4 w-4 mr-2" />
                  Search Client
                </>
              )}
            </button>
          </form>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-200/60">
              <h3 className="text-sm font-medium text-stone-700 mb-3 flex items-center">
                <FaClock className="h-4 w-4 mr-2 text-[#8B0000]" />
                Recent Searches
              </h3>
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <button
                    key={search.id}
                    onClick={() => handleRecentSearchClick(search.id)}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-stone-50 border border-stone-200/60 transition-all duration-300 group hover:border-[#8B0000]/20 hover:shadow-md"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-stone-100 to-stone-50 group-hover:from-[#8B0000]/5 group-hover:to-[#A31515]/5 mr-3">
                        <FaUser className="h-4 w-4 text-[#8B0000] opacity-70 group-hover:opacity-100" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-stone-800 group-hover:text-[#8B0000]">
                          {search.name}
                        </div>
                        <div className="text-xs text-stone-500">
                          {search.phone}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}