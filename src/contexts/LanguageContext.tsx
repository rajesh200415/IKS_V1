import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta' | 'hi' | 'te' | 'ml';

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
    
    // Language names
    'languages.en': 'English',
    'languages.ta': 'தமிழ்',
    'languages.hi': 'हिन्दी',
    'languages.te': 'తెలుగు',
    'languages.ml': 'മലയാളം',
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
    
    // Language names
    'languages.en': 'English',
    'languages.ta': 'தமிழ்',
    'languages.hi': 'हिन्दी',
    'languages.te': 'తెలుగు',
    'languages.ml': 'മലയാളം',
  },
  hi: {
    // Header
    'header.title': 'वेटकेयर सूचना पोर्टल',
    'header.subtitle': 'पशु स्वास्थ्य के लिए आपका विश्वसनीय साथी',
    
    // Search Section
    'search.title': 'पशु स्वास्थ्य जानकारी खोजें',
    'search.subtitle': 'लक्षणों या बीमारी के नाम से बीमारियां खोजें',
    'search.filterBy': 'फ़िल्टर करें',
    'search.symptoms': 'लक्षण',
    'search.diseaseName': 'बीमारी का नाम',
    'search.enterSymptoms': 'लक्षण दर्ज करें...',
    'search.enterDisease': 'बीमारी का नाम दर्ज करें...',
    'search.button': 'बीमारियां खोजें',
    'search.dynamicIndicator': 'टाइप करते समय खोज रहे हैं... (न्यूनतम 2 अक्षर)',
    
    // Results Section
    'results.title': 'खोज परिणाम',
    'results.found': 'परिणाम मिला',
    'results.foundPlural': 'परिणाम मिले',
    'results.ready': 'खोजने के लिए तैयार',
    'results.readyDesc': 'संबंधित जानकारी खोजने के लिए लक्षण या बीमारी के नाम दर्ज करें',
    'results.searching': 'खोज रहे हैं',
    'results.noResults': 'कोई परिणाम नहीं मिला',
    'results.noResultsDesc': 'अलग कीवर्ड के साथ खोजने की कोशिश करें या अपनी वर्तनी जांचें',
    
    // Disease Card
    'card.affects': 'प्रभावित करता है',
    'card.symptoms': 'लक्षण',
    'card.ingredients': 'सामग्री',
    'card.preparation': 'तैयारी',
    'card.dosage': 'खुराक और उपयोग',
    'card.severity.high': 'उच्च',
    'card.severity.medium': 'मध्यम',
    'card.severity.low': 'कम',
    
    // Animals
    'animals.cattle': 'मवेशी',
    'animals.buffaloes': 'भैंस',
    
    // Language names
    'languages.en': 'English',
    'languages.ta': 'தமிழ்',
    'languages.hi': 'हिन्दी',
    'languages.te': 'తెలుగు',
    'languages.ml': 'മലയാളം',
  },
  te: {
    // Header
    'header.title': 'వెట్‌కేర్ సమాచార పోర్టల్',
    'header.subtitle': 'పశు ఆరోగ్యం కోసం మీ నమ్మకమైన భాగస్వామి',
    
    // Search Section
    'search.title': 'పశు ఆరోగ్య సమాచారాన్ని వెతకండి',
    'search.subtitle': 'లక్షణాలు లేదా వ్యాధి పేర్లతో వ్యాధులను కనుగొనండి',
    'search.filterBy': 'ఫిల్టర్ చేయండి',
    'search.symptoms': 'లక్షణాలు',
    'search.diseaseName': 'వ్యాధి పేరు',
    'search.enterSymptoms': 'లక్షణాలను నమోదు చేయండి...',
    'search.enterDisease': 'వ్యాధి పేరును నమోదు చేయండి...',
    'search.button': 'వ్యాధులను వెతకండి',
    'search.dynamicIndicator': 'మీరు టైప్ చేస్తున్నప్పుడు వెతుకుతోంది... (కనీసం 2 అక్షరాలు)',
    
    // Results Section
    'results.title': 'వెతుకులాట ఫలితాలు',
    'results.found': 'ఫలితం దొరికింది',
    'results.foundPlural': 'ఫలితాలు దొరికాయి',
    'results.ready': 'వెతకడానికి సిద్ధం',
    'results.readyDesc': 'సంబంధిత సమాచారాన్ని కనుగొనడానికి లక్షణాలు లేదా వ్యాధి పేర్లను నమోదు చేయండి',
    'results.searching': 'వెతుకుతోంది',
    'results.noResults': 'ఫలితాలు లేవు',
    'results.noResultsDesc': 'వేరే కీవర్డ్‌లతో వెతకడానికి ప్రయత్నించండి లేదా మీ స్పెల్లింగ్ తనిఖీ చేయండి',
    
    // Disease Card
    'card.affects': 'ప్రభావితం చేస్తుంది',
    'card.symptoms': 'లక్షణాలు',
    'card.ingredients': 'పదార్థాలు',
    'card.preparation': 'తయారీ',
    'card.dosage': 'మోతాదు మరియు వాడుక',
    'card.severity.high': 'అధిక',
    'card.severity.medium': 'మధ్యమ',
    'card.severity.low': 'తక్కువ',
    
    // Animals
    'animals.cattle': 'పశువులు',
    'animals.buffaloes': 'గేదెలు',
    
    // Language names
    'languages.en': 'English',
    'languages.ta': 'தமிழ்',
    'languages.hi': 'हिन्दी',
    'languages.te': 'తెలుగు',
    'languages.ml': 'മലയാളം',
  },
  ml: {
    // Header
    'header.title': 'വെറ്റ്‌കെയർ വിവര പോർട്ടൽ',
    'header.subtitle': 'മൃഗങ്ങളുടെ ആരോഗ്യത്തിനുള്ള നിങ്ങളുടെ വിശ്വസ്ത പങ്കാളി',
    
    // Search Section
    'search.title': 'മൃഗങ്ങളുടെ ആരോഗ്യ വിവരങ്ങൾ തിരയുക',
    'search.subtitle': 'ലക്ഷണങ്ങൾ അല്ലെങ്കിൽ രോഗത്തിന്റെ പേര് ഉപയോഗിച്ച് രോഗങ്ങൾ കണ്ടെത്തുക',
    'search.filterBy': 'ഫിൽട്ടർ ചെയ്യുക',
    'search.symptoms': 'ലക്ഷണങ്ങൾ',
    'search.diseaseName': 'രോഗത്തിന്റെ പേര്',
    'search.enterSymptoms': 'ലക്ഷണങ്ങൾ നൽകുക...',
    'search.enterDisease': 'രോഗത്തിന്റെ പേര് നൽകുക...',
    'search.button': 'രോഗങ്ങൾ തിരയുക',
    'search.dynamicIndicator': 'നിങ്ങൾ ടൈപ്പ് ചെയ്യുമ്പോൾ തിരയുന്നു... (കുറഞ്ഞത് 2 അക്ഷരങ്ങൾ)',
    
    // Results Section
    'results.title': 'തിരയൽ ഫലങ്ങൾ',
    'results.found': 'ഫലം കണ്ടെത്തി',
    'results.foundPlural': 'ഫലങ്ങൾ കണ്ടെത്തി',
    'results.ready': 'തിരയാൻ തയ്യാർ',
    'results.readyDesc': 'പ്രസക്തമായ വിവരങ്ങൾ കണ്ടെത്താൻ ലക്ഷണങ്ങൾ അല്ലെങ്കിൽ രോഗത്തിന്റെ പേര് നൽകുക',
    'results.searching': 'തിരയുന്നു',
    'results.noResults': 'ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല',
    'results.noResultsDesc': 'വ്യത്യസ്ത കീവേഡുകൾ ഉപയോഗിച്ച് തിരയാൻ ശ്രമിക്കുക അല്ലെങ്കിൽ നിങ്ങളുടെ സ്പെല്ലിംഗ് പരിശോധിക്കുക',
    
    // Disease Card
    'card.affects': 'ബാധിക്കുന്നു',
    'card.symptoms': 'ലക്ഷണങ്ങൾ',
    'card.ingredients': 'ചേരുവകൾ',
    'card.preparation': 'തയ്യാറാക്കൽ',
    'card.dosage': 'ഡോസേജും ഉപയോഗവും',
    'card.severity.high': 'ഉയർന്ന',
    'card.severity.medium': 'ഇടത്തരം',
    'card.severity.low': 'കുറഞ്ഞ',
    
    // Animals
    'animals.cattle': 'കന്നുകാലികൾ',
    'animals.buffaloes': 'എരുമകൾ',
    
    // Language names
    'languages.en': 'English',
    'languages.ta': 'தமிழ்',
    'languages.hi': 'हिन्दी',
    'languages.te': 'తెలుగు',
    'languages.ml': 'മലയാളം',
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