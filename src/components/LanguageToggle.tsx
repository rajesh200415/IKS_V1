import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe size={20} className="text-green-100" />
      <div className="flex bg-green-500 rounded-lg p-1">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
            language === 'en'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-green-100 hover:text-white'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('ta')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
            language === 'ta'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-green-100 hover:text-white'
          }`}
        >
          தமிழ்
        </button>
      </div>
    </div>
  );
};

export default LanguageToggle;