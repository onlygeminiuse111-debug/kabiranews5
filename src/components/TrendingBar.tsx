import React from 'react';
import { Flame } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TrendingBarProps {
  onSelectTag: (tag: string) => void;
  selectedTag: string | null;
}

const TRENDING_TAGS = [
  { tag: 'ISRO', label: '#चंद्रयान_4' },
  { tag: 'Cricket', label: '#T20WorldCup' },
  { tag: 'Metro', label: '#भोपाल_इंदौर_मेट्रो' },
  { tag: 'AI', label: '#भारत_एआई' },
  { tag: 'Sensex', label: '#शेयर_बाज़ार_85000' },
  { tag: 'Parliament', label: '#संसद_सत्र' },
  { tag: 'Varanasi', label: '#काशी_अयोध्या_क्रूज़' },
  { tag: 'Ayurveda', label: '#आयुर्वेद_रिसर्च' },
];

export const TrendingBar: React.FC<TrendingBarProps> = ({ onSelectTag, selectedTag }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-amber-50/80 dark:bg-slate-900/90 border-b border-amber-200/70 dark:border-slate-800 py-1.5 px-2 sm:px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1 font-black text-red-600 dark:text-red-400 shrink-0 uppercase tracking-wider text-[11px]">
          <Flame className="w-3.5 h-3.5 fill-red-600 animate-bounce" />
          <span>{t('trending')}:</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {TRENDING_TAGS.map(({ tag, label }) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isActive ? '' : tag)}
                className={`px-3 py-0.5 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-red-400 hover:text-red-600 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
