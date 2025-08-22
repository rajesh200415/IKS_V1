import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages = [
    { code: 'en', name: t('languages.en') },
    { code: 'ta', name: t('languages.ta') },
    { code: 'hi', name: t('languages.hi') },
    { code: 'te', name: t('languages.te') },
    { code: 'ml', name: t('languages.ml') }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative flex items-center space-x-2">
      <Globe size={20} className="text-green-100" />
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 bg-green-500 hover:bg-green-400 px-3 py-1 rounded-lg text-sm font-medium text-white transition-all duration-200"
        >
          <span>{currentLanguage?.name}</span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                    language === lang.code ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LanguageToggle;