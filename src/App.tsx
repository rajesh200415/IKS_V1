import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import { Disease, SearchType } from './types';
import { mockDiseases } from './data/mockData';
import { useLanguage } from './contexts/LanguageContext';

function App() {
  const { language } = useLanguage();
  const [searchResults, setSearchResults] = useState<Disease[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const handleSearch = useCallback(async (query: string, type: SearchType) => {
    // If query is empty, reset results
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setLastSearchQuery('');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setLastSearchQuery(query);

    // Simulate API call delay for manual search button clicks
    // For dynamic search, we'll make it faster
    const delay = query.length >= 2 ? 200 : 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Filter diseases based on search type and query
    const filteredDiseases = mockDiseases.filter(disease => {
      const searchTerm = query.toLowerCase();
      
      switch (type) {
        case 'symptoms':
          // Search in both English and Tamil symptoms
          const englishSymptoms = disease.symptoms.some(symptom => 
            symptom.toLowerCase().includes(searchTerm)
          );
          const tamilSymptoms = language === 'ta' && disease.symptomsTa ? 
            disease.symptomsTa.some(symptom => 
              symptom.toLowerCase().includes(searchTerm)
            ) : false;
          return englishSymptoms || tamilSymptoms;
          
        case 'disease':
          // Search in both English and Tamil disease names
          const englishName = disease.name.toLowerCase().includes(searchTerm) ||
            disease.treatmentName.toLowerCase().includes(searchTerm);
          const tamilName = language === 'ta' && (disease.nameTa || disease.treatmentNameTa) ?
            (disease.nameTa?.toLowerCase().includes(searchTerm) || 
             disease.treatmentNameTa?.toLowerCase().includes(searchTerm)) : false;
          return englishName || tamilName;
          
        default:
          return false;
      }
    });

    setSearchResults(filteredDiseases);
    setIsSearching(false);
  }, [language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 pb-8">
        <SearchSection onSearch={handleSearch} />
        
        <div className="mt-8 mx-4">
          <ResultsSection 
            results={searchResults}
            isSearching={isSearching}
            hasSearched={hasSearched}
            searchQuery={lastSearchQuery}
          />
        </div>
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;