import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'header.title': 'VetCare Info Portal',
    'header.subtitle': 'Your trusted companion for animal health',
    
    // Search Section
    'search.title': 'Search Animal Health Information',
    'search.subtitle': 'Find diseases by symptoms or disease names',
    'search.filterBy': 'Filter by',
    'search.symptoms': 'Symptoms',
    'search.diseaseName': 'Disease Name',
    'search.enterSymptoms': 'Enter symptoms...',
    'search.enterDisease': 'Enter disease name...',
    'search.button': 'Search Diseases',
    'search.dynamicIndicator': 'Searching as you type... (minimum 2 characters)',
    
    // Results Section
    'results.title': 'Search Results',
    'results.found': 'result found',
    'results.foundPlural': 'results found',
    'results.ready': 'Ready to Search',
    'results.readyDesc': 'Enter symptoms or disease names to find relevant information',
    'results.searching': 'Searching for',
    'results.noResults': 'No Results Found',
    'results.noResultsDesc': 'Try searching with different keywords or check your spelling',
    
    // Disease Card
    'card.affects': 'Affects',
    'card.symptoms': 'Symptoms',
    'card.ingredients': 'Ingredients',
    'card.preparation': 'Preparation',
    'card.dosage': 'Dosage & Application',
    'card.severity.high': 'High',
    'card.severity.medium': 'Medium',
    'card.severity.low': 'Low',
    
    // Chatbot
    'chat.title': 'AI VetCare Assistant',
    'chat.welcome': "Hello! 🙏 I'm your VetCare AI assistant, ready to help with animal health questions.\n\n🔍 **I can help with:**\n• Symptom identification\n• Disease information\n• Treatment methods\n• Prevention measures\n\n**Try asking:** 'What causes fever in cattle?' or 'How to treat milk reduction?'",
    'chat.placeholder': 'Ask about symptoms, diseases, or treatments...',
    
    // Footer
    'footer.about': 'About VetCare',
    'footer.aboutDesc': 'Providing reliable veterinary information to help farmers and animal owners make informed decisions about their livestock health.',
    'footer.quickLinks': 'Quick Links',
    'footer.aboutUs': 'About Us',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.emergency': 'Emergency Contact',
    'footer.emergencyVet': 'Emergency Vet: 1-800-VET-HELP',
    'footer.email': 'info@vetcare.com',
    'footer.disclaimer': 'Medical Disclaimer:',
    'footer.disclaimerText': 'This information is for educational purposes only. Always consult with a qualified veterinarian for proper diagnosis and treatment of your animals.',
    'footer.copyright': '© 2024 VetCare Info Portal. All rights reserved.',
    
    // Animals
    'animals.cattle': 'Cattle',
    'animals.buffaloes': 'Buffaloes',
  },
  ta: {
    // Header
    'header.title': 'வெட்கேர் தகவல் போர்ட்டல்',
    'header.subtitle': 'விலங்கு நலனுக்கான உங்கள் நம்பகமான துணை',
    
    // Search Section
    'search.title': 'விலங்கு நல தகவல்களை தேடுங்கள்',
    'search.subtitle': 'அறிகுறிகள் அல்லது நோய் பெயர்களால் நோய்களை கண்டறியுங்கள்',
    'search.filterBy': 'வடிகட்டு',
    'search.symptoms': 'அறிகுறிகள்',
    'search.diseaseName': 'நோய் பெயர்',
    'search.enterSymptoms': 'அறிகுறிகளை உள்ளிடுங்கள்...',
    'search.enterDisease': 'நோய் பெயரை உள்ளிடுங்கள்...',
    'search.button': 'நோய்களை தேடுங்கள்',
    'search.dynamicIndicator': 'நீங்கள் தட்டச்சு செய்யும்போது தேடுகிறது... (குறைந்தது 2 எழுத்துகள்)',
    
    // Results Section
    'results.title': 'தேடல் முடிவுகள்',
    'results.found': 'முடிவு கிடைத்தது',
    'results.foundPlural': 'முடிவுகள் கிடைத்தன',
    'results.ready': 'தேடலுக்கு தயார்',
    'results.readyDesc': 'தொடர்புடைய தகவல்களை கண்டறிய அறிகுறிகள் அல்லது நோய் பெயர்களை உள்ளிடுங்கள்',
    'results.searching': 'தேடுகிறது',
    'results.noResults': 'முடிவுகள் இல்லை',
    'results.noResultsDesc': 'வேறு முக்கிய வார்த்தைகளுடன் தேட முயற்சிக்கவும் அல்லது உங்கள் எழுத்துப்பிழையை சரிபார்க்கவும்',
    
    // Disease Card
    'card.affects': 'பாதிக்கும் விலங்குகள்',
    'card.symptoms': 'அறிகுறிகள்',
    'card.ingredients': 'பொருட்கள்',
    'card.preparation': 'தயாரிப்பு',
    'card.dosage': 'அளவு மற்றும் பயன்பாடு',
    'card.severity.high': 'அதிக',
    'card.severity.medium': 'நடுத்தர',
    'card.severity.low': 'குறைவு',
    
    // Chatbot
    'chat.title': 'AI வெட்கேர் உதவியாளர்',
    'chat.welcome': 'வணக்கம்! 🙏 நான் உங்கள் வெட்கேர் AI உதவியாளர். விலங்கு நல கேள்விகளில் உங்களுக்கு உதவ தயாராக இருக்கிறேன்.\n\n🔍 **நான் உதவக்கூடிய விஷயங்கள்:**\n• அறிகுறிகள் அடையாளம் காணுதல்\n• நோய் தகவல்கள்\n• சிகிச்சை முறைகள்\n• தடுப்பு நடவடிக்கைகள்\n\n**இவற்றைக் கேட்டு பாருங்கள்:** \'மாட்டில் காய்ச்சலுக்கு என்ன காரணம்?\' அல்லது \'பால் குறைவை எப்படி சிகிச்சை செய்வது?\'',
    'chat.placeholder': 'அறிகுறிகள், நோய்கள் அல்லது சிகிச்சைகளைப் பற்றி கேளுங்கள்...',
    
    // Footer
    'footer.about': 'வெட்கேர் பற்றி',
    'footer.aboutDesc': 'விவசாயிகள் மற்றும் விலங்கு உரிமையாளர்கள் தங்கள் கால்நடைகளின் நலனைப் பற்றி தகவலறிந்த முடிவுகளை எடுக்க உதவும் நம்பகமான கால்நடை தகவல்களை வழங்குதல்.',
    'footer.quickLinks': 'விரைவு இணைப்புகள்',
    'footer.aboutUs': 'எங்களைப் பற்றி',
    'footer.contact': 'தொடர்பு',
    'footer.privacy': 'தனியுரிமை கொள்கை',
    'footer.terms': 'சேவை விதிமுறைகள்',
    'footer.emergency': 'அவசர தொடர்பு',
    'footer.emergencyVet': 'அவசர கால்நடை மருத்துவர்: 1-800-VET-HELP',
    'footer.email': 'info@vetcare.com',
    'footer.disclaimer': 'மருத்துவ மறுப்பு:',
    'footer.disclaimerText': 'இந்த தகவல் கல்வி நோக்கங்களுக்காக மட்டுமே. உங்கள் விலங்குகளின் சரியான நோயறிதல் மற்றும் சிகிச்சைக்கு எப்போதும் தகுதிவாய்ந்த கால்நடை மருத்துவரை அணுகவும்.',
    'footer.copyright': '© 2024 வெட்கேர் தகவல் போர்ட்டல். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    
    // Animals
    'animals.cattle': 'மாடுகள்',
    'animals.buffaloes': 'எருமைகள்',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};