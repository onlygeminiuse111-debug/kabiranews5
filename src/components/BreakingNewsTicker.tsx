import React from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { useLanguage } from '../contexts/LanguageContext';

interface BreakingNewsTickerProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  articles,
  onSelectArticle,
}) => {
  const { language } = useLanguage();
  const breakingItems = articles.filter((a) => a.isBreaking);

  if (breakingItems.length === 0) return null;

  return (
    <div
      className="bg-[#c41e24] dark:bg-[#991b1b] text-white h-9 flex items-center border-b border-red-800/60 overflow-hidden select-none"
      role="region"
      aria-label="Breaking News Ticker"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center h-full px-2 sm:px-4">
        {/* Flash Label */}
        <div className="bg-[#991b1b] dark:bg-black/40 h-full px-2.5 sm:px-3 flex items-center gap-1.5 shrink-0 z-10 shadow-xs border-r border-red-700/50">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
          </span>
          <span className="font-black text-[11px] sm:text-xs tracking-wider uppercase flex items-center gap-1 text-white">
            <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="hidden xs:inline">ब्रेकिंग न्यूज़</span>
            <span className="xs:hidden">ब्रेकिंग</span>
          </span>
        </div>

        {/* Marquee Ticker */}
        <div className="overflow-hidden relative flex-1 h-full flex items-center px-3">
          <div className="animate-ticker flex items-center space-x-8 text-xs font-semibold">
            {[...breakingItems, ...breakingItems].map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                onClick={() => onSelectArticle(item)}
                className="hover:underline hover:text-yellow-200 transition shrink-0 flex items-center gap-2 text-left focus:outline-none"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
                <span>{item.title}</span>
                {item.state && (
                  <span className="text-[10px] bg-red-900/60 px-1.5 py-0.2 rounded text-red-200">
                    {item.state}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
