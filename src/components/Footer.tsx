import React from 'react';
import { Mail, Phone, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.about')}</h4>
            <p className="text-gray-300 leading-relaxed">
              {t('footer.aboutDesc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">{t('footer.aboutUs')}</a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">{t('footer.contact')}</a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">{t('footer.terms')}</a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.emergency')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-green-400" />
                <span className="text-gray-300">{t('footer.emergencyVet')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-green-400" />
                <span className="text-gray-300">{t('footer.email')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex items-start space-x-2 mb-4">
            <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-300">
                <strong>{t('footer.disclaimer')}</strong> {t('footer.disclaimerText')}
              </p>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;