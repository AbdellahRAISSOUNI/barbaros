'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaTimes, FaSpinner, FaUser } from 'react-icons/fa';
import { debounce } from 'lodash';
import LoadingAnimation from './LoadingAnimation';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  clientId: string;
}

interface ClientSearchProps {
  onSearch: (query: string) => void;
  onClientSelect?: (client: Client) => void;
  className?: string;
  showDropdown?: boolean;
  placeholder?: string;
}

export function ClientSearch({
  onSearch,
  onClientSelect,
  className = '',
  showDropdown = true,
  placeholder = "Search by name, phone, or client ID..."
}: ClientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/clients/search?q=${encodeURIComponent(query.trim())}&limit=5`);
        const data = await response.json();
        
        if (data.success) {
          setSuggestions(data.clients || []);
          setShowSuggestions(showDropdown && data.clients.length > 0);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [showDropdown]
  );

  // Handle input change with real-time search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    
    // Only call parent's onSearch for immediate filtering, not server search
    onSearch(value);
    
    // Trigger real-time server search only if showDropdown is true
    if (showDropdown) {
      debouncedSearch(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (client: Client) => {
    setSearchTerm(`${client.firstName} ${client.lastName}`);
    setShowSuggestions(false);
    onSearch(client.clientId);
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm text-black"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0 && showDropdown) {
                setShowSuggestions(true);
              }
            }}
            autoComplete="off"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <LoadingAnimation size="sm" />
            ) : (
              <FaSearch className="h-4 w-4 text-gray-400" />
            )}
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((client, index) => (
                <button
                  key={client._id}
                  type="button"
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => handleSuggestionClick(client)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <FaUser className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {client.phoneNumber} • ID: {client.clientId}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 text-sm font-medium min-w-[100px]"
        >
          Search
        </button>
      </form>
    </div>
  );
}