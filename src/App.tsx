import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import { Disease, SearchType } from './types';
import { apiService } from './services/api';
import { useLanguage } from './contexts/LanguageContext';

function App() {
  const { language } = useLanguage();
  const [searchResults, setSearchResults] = useState<Disease[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiConnected, setIsApiConnected] = useState(false);

  // Check API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        console.log('🔍 Checking API connection...');
        await apiService.healthCheck();
        setIsApiConnected(true);
        setApiError(null);
        console.log('✅ API connection successful');
      } catch (error) {
        console.error('❌ API connection failed:', error);
        setIsApiConnected(false);
        setApiError('Unable to connect to backend API. Please ensure the server is running on http://localhost:5000');
      }
    };

    checkApiConnection();
  }, []);

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

    try {
      console.log(`🔍 Searching for: "${query}" (type: ${type}, language: ${language})`);
      
      // Use API service to search diseases
      const diseases = await apiService.searchDiseases(query, type, language);
      
      console.log(`✅ Search completed: ${diseases.length} results found`);
      setSearchResults(diseases);
      setApiError(null);
      
    } catch (error) {
      console.error('❌ Search error:', error);
      setApiError('Search failed. Please check your connection and try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [language]);

  // Show API connection error
  if (!isApiConnected && apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">API Connection Error</h2>
            <p className="text-gray-600 mb-6">{apiError}</p>
            <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
              <p className="font-semibold mb-2">To fix this issue:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Navigate to the server directory</li>
                <li>Run: <code className="bg-gray-200 px-1 rounded">npm install</code></li>
                <li>Run: <code className="bg-gray-200 px-1 rounded">npm run dev</code></li>
                <li>Ensure MongoDB is running locally</li>
              </ol>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 pb-8">
        {/* API Status Indicator */}
        {isApiConnected && (
          <div className="mx-4 mt-4 mb-2">
            <div className="bg-green-100 border border-green-200 rounded-lg p-2 text-center">
              <span className="text-green-700 text-sm">
                🟢 Connected to MongoDB Backend | Language: {language.toUpperCase()}
              </span>
            </div>
          </div>
        )}
        
        {apiError && (
          <div className="mx-4 mt-4 mb-2">
            <div className="bg-red-100 border border-red-200 rounded-lg p-2 text-center">
              <span className="text-red-700 text-sm">
                🔴 {apiError}
              </span>
            </div>
          </div>
        )}
        
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