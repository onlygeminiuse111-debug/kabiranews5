import React from 'react';
import { CATEGORIES } from '../data/categories';
import { NewsCategory } from '../types/news';
import { useLanguage } from '../contexts/LanguageContext';
import { Home, MapPin, Sparkles } from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: NewsCategory | 'all';
  onSelectCategory: (cat: NewsCategory | 'all') => void;
  onOpenStateModal: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenStateModal,
}) => {
  const { language, t } = useLanguage();

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 transition-colors select-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center overflow-x-auto no-scrollbar py-1.5 gap-1 sm:gap-2">
          {/* All / Home Tab */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold whitespace-nowrap rounded-lg transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#c41e24] text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:text-[#c41e24] dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t('all')}</span>
          </button>

          {/* Categories */}
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-bold whitespace-nowrap rounded-lg transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#c41e24] text-white shadow-xs'
                    : 'text-gray-700 dark:text-gray-300 hover:text-[#c41e24] dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/80'
                }`}
              >
                {language === 'hi' ? cat.nameHi : cat.nameEn}
              </button>
            );
          })}

          {/* Regional State / City Quick Picker Tab */}
          <button
            onClick={onOpenStateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 ml-auto text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/80 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/60 transition whitespace-nowrap shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'hi' ? 'अपना शहर चुनें' : 'Choose City'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
