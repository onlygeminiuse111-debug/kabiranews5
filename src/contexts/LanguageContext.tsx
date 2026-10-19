import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'hi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatHindiDate: (dateInput: string | Date) => string;
  formatTimeAgo: (dateInput: string | Date) => string;
}

const DICTIONARY: Record<string, { hi: string; en: string }> = {
  siteName: { hi: 'कबीरा न्यूज़', en: 'Kabira News' },
  tagline: { hi: 'निष्पक्ष • निर्भीक • विश्वसनीय', en: 'Fearless • Impartial • Trusted' },
  breakingNews: { hi: 'ब्रेकिंग न्यूज़', en: 'Breaking News' },
  trending: { hi: 'ट्रेंडिंग', en: 'Trending' },
  latestNews: { hi: 'ताज़ा ख़बरें', en: 'Latest News' },
  topStories: { hi: 'प्रमुख समाचार', en: 'Top Stories' },
  popularNews: { hi: 'सबसे लोकप्रिय', en: 'Most Popular' },
  readMore: { hi: 'पूरी ख़बर पढ़ें', en: 'Read Full Story' },
  listenNews: { hi: 'ख़बर सुनें', en: 'Listen to Story' },
  stopListening: { hi: 'रोकें', en: 'Stop Audio' },
  share: { hi: 'शेयर करें', en: 'Share' },
  bookmark: { hi: 'सहेजें', en: 'Save' },
  bookmarked: { hi: 'सहेजा गया', en: 'Saved' },
  savedStories: { hi: 'सहेजी गई ख़बरें', en: 'Saved Stories' },
  fontSize: { hi: 'अक्षर आकार', en: 'Font Size' },
  searchPlaceholder: { hi: 'समाचार, शहर या विषय खोजें...', en: 'Search news, cities, or topics...' },
  adminPortal: { hi: 'संपादक पैनल', en: 'Admin Panel' },
  ePaper: { hi: 'ई-पेपर', en: 'e-Paper' },
  liveTv: { hi: 'लाइव न्यूज़', en: 'Live News' },
  installApp: { hi: 'ऐप इंस्टॉल करें', en: 'Install App' },
  all: { hi: 'सभी', en: 'All' },
  relatedNews: { hi: 'संबंधित ख़बरें', en: 'Related Stories' },
  comments: { hi: 'पाठकों की राय', en: 'Comments' },
  addComment: { hi: 'अपनी राय लिखें', en: 'Add Comment' },
  author: { hi: 'संवाददाता', en: 'Reporter' },
  published: { hi: 'प्रकाशित', en: 'Published' },
  updated: { hi: 'अपडेटेड', en: 'Updated' },
  views: { hi: 'व्यूज', en: 'Views' },
  minRead: { hi: 'मिनट का पठन', en: 'min read' },
  selectState: { hi: 'राज्य चुनें', en: 'Select State' },
  selectCity: { hi: 'शहर चुनें', en: 'Select City' },
  noArticlesFound: { hi: 'कोई समाचार नहीं मिला। कृपया अन्य शब्द या श्रेणी खोजें।', en: 'No articles found. Please try another search.' },
  offlineWarning: { hi: 'आप ऑफ़लाइन हैं। पूर्व-लोड किए गए समाचार दिखाए जा रहे हैं।', en: 'You are offline. Showing cached news articles.' },
  exportZip: { hi: 'प्रोजेक्ट डाउनलोड (ZIP)', en: 'Download Project (ZIP)' },
};

const HINDI_MONTHS = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const HINDI_DAYS = [
  'रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kabira_lang') as Language) || 'hi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kabira_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    if (DICTIONARY[key]) {
      return DICTIONARY[key][language];
    }
    return key;
  };

  const formatHindiDate = (dateInput: string | Date): string => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';

    if (language === 'en') {
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

    const dayName = HINDI_DAYS[d.getDay()];
    const dateNum = d.getDate();
    const monthName = HINDI_MONTHS[d.getMonth()];
    const year = d.getFullYear();

    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  };

  const formatTimeAgo = (dateInput: string | Date): string => {
    const d = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (language === 'en') {
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    }

    // Hindi relative time
    if (diffMinutes < 1) return 'अभी-अभी';
    if (diffMinutes < 60) return `${diffMinutes} मिनट पहले`;
    if (diffHours < 24) return `${diffHours} घंटे पहले`;
    if (diffDays === 1) return 'कल';
    return `${diffDays} दिन पहले`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatHindiDate,
        formatTimeAgo,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
