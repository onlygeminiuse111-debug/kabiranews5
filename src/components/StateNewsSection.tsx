import React, { useState } from 'react';
import { MapPin, Building, ChevronRight } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { ArticleCard } from './ArticleCard';
import { INDIAN_STATES, POPULAR_CITIES } from '../data/categories';
import { useLanguage } from '../contexts/LanguageContext';

interface StateNewsSectionProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  bookmarks: string[];
  onToggleBookmark: (article: NewsArticle) => void;
  onShare: (article: NewsArticle, e: React.MouseEvent) => void;
}

export const StateNewsSection: React.FC<StateNewsSectionProps> = ({
  articles,
  onSelectArticle,
  bookmarks,
  onToggleBookmark,
  onShare,
}) => {
  const { language } = useLanguage();
  const [activeState, setActiveState] = useState<string>('मध्य प्रदेश');
  const [activeCity, setActiveCity] = useState<string | null>(null);

  // Filter state news
  const stateArticles = articles.filter((a) => {
    if (a.state) {
      if (activeCity) {
        return a.state === activeState && a.city === activeCity;
      }
      return a.state === activeState;
    }
    return false;
  });

  const cities = POPULAR_CITIES[activeState] || [];

  return (
    <section className="bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 dark:from-slate-900/80 dark:to-slate-900/40 py-8 border-y border-amber-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-serif">
                {language === 'hi' ? 'राज्य और शहर की ख़बरें' : 'Regional State & City News'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi' ? 'आपके अपने प्रदेश, शहर और अंचल की हर ताज़ा ज़मीनी रिपोर्ट' : 'Ground reporting from states and districts'}
              </p>
            </div>
          </div>

          {/* State Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {INDIAN_STATES.slice(0, 6).map((state) => (
              <button
                key={state}
                onClick={() => {
                  setActiveState(state);
                  setActiveCity(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeState === state
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* City Filter Chips */}
        {cities.length > 0 && (
          <div className="flex items-center gap-1.5 mb-6 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="font-semibold text-gray-500 dark:text-gray-400 shrink-0 flex items-center gap-1 text-[11px]">
              <Building className="w-3.5 h-3.5" />
              शहर:
            </span>
            <button
              onClick={() => setActiveCity(null)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                activeCity === null
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              }`}
            >
              सभी ज़िले ({activeState})
            </button>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city === activeCity ? null : city)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition whitespace-nowrap ${
                  activeCity === city
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {/* Articles Grid: 2x2 Layout (4 stories) */}
        {stateArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {stateArticles.slice(0, 4).map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                variant="grid"
                onSelect={onSelectArticle}
                isBookmarked={bookmarks.includes(art.id)}
                onToggleBookmark={onToggleBookmark}
                onShare={onShare}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#16191f] rounded-2xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-800">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">
              {activeState} {activeCity ? `(${activeCity})` : ''} के लिए कोई विशेष समाचार उपलब्ध नहीं है।
            </p>
            <p className="text-xs text-gray-400 mt-1">
              कृपया अन्य राज्य चुनें।
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
