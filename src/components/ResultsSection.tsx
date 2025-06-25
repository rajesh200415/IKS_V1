import React from 'react';
import { SearchX, FileText } from 'lucide-react';
import { Disease } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import DiseaseCard from './DiseaseCard';

interface ResultsSectionProps {
  results: Disease[];
  isSearching: boolean;
  hasSearched: boolean;
  searchQuery: string;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  results, 
  isSearching, 
  hasSearched, 
  searchQuery 
}) => {
  const { t } = useLanguage();

  if (!hasSearched) {
    return (
      <div className="text-center py-12">
        <FileText size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('results.ready')}</h3>
        <p className="text-gray-500">
          {t('results.readyDesc')}
        </p>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('results.searching')} "{searchQuery}"...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <SearchX size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('results.noResults')}</h3>
        <p className="text-gray-500">
          {t('results.noResultsDesc')}
        </p>
      </div>
    );
  }

  const getResultsText = () => {
    if (results.length === 1) {
      return `1 ${t('results.found')}`;
    }
    return `${results.length} ${t('results.foundPlural')}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          {t('results.title')}
        </h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {getResultsText()}
        </span>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {results.map((disease) => (
          <DiseaseCard key={disease.id} disease={disease} />
        ))}
      </div>
    </div>
  );
};

export default ResultsSection;