import React from 'react';
import { Heart, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Shield size={28} className="text-green-100" />
              <Heart size={20} className="text-red-300" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{t('header.title')}</h1>
              <p className="text-green-100 text-xs md:text-sm">
                {t('header.subtitle')}
              </p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;