import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { SearchType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchSectionProps {
  onSearch: (query: string, type: SearchType) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('symptoms');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchTypes = [
    { value: 'symptoms' as SearchType, label: t('search.symptoms') },
    { value: 'disease' as SearchType, label: t('search.diseaseName') },
  ];

  // Dynamic search - trigger search as user types
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const debounceTimer = setTimeout(() => {
        onSearch(searchQuery, searchType);
      }, 300); // 300ms delay for debouncing

      return () => clearTimeout(debounceTimer);
    } else if (searchQuery.trim().length === 0) {
      // Clear results when search is empty
      onSearch('', searchType);
    }
  }, [searchQuery, searchType, onSearch]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, searchType);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const selectedType = searchTypes.find(type => type.value === searchType);

  const getPlaceholder = () => {
    return searchType === 'symptoms' ? t('search.enterSymptoms') : t('search.enterDisease');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mx-4 mt-6">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
          {t('search.title')}
        </h2>
        <p className="text-gray-600">{t('search.subtitle')}</p>
      </div>

      {/* Search Filter and Input */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full md:w-48 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
          >
            <span className="font-medium text-gray-700">
              {t('search.filterBy')}: {selectedType?.label}
            </span>
            <ChevronDown 
              size={20} 
              className={`text-gray-500 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
              {searchTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setSearchType(type.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                    searchType === type.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={getPlaceholder()}
            className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search size={24} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={!searchQuery.trim()}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <Search size={20} className="inline mr-2" />
        {t('search.button')}
      </button>

      {/* Dynamic Search Indicator */}
      {searchQuery.trim().length >= 2 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {t('search.dynamicIndicator')}
          </p>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchSection;