import React from 'react';
import { Flame, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { ArticleCard } from './ArticleCard';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroSectionProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  bookmarks: string[];
  onToggleBookmark: (article: NewsArticle) => void;
  onShare: (article: NewsArticle, e: React.MouseEvent) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  articles,
  onSelectArticle,
  bookmarks,
  onToggleBookmark,
  onShare,
}) => {
  const { language } = useLanguage();

  if (articles.length === 0) return null;

  // Determine lead article
  const leadArticle = articles.find((a) => a.isHeroHighlight) || articles[0];
  const secondaryArticles = articles.filter((a) => a.id !== leadArticle.id).slice(0, 2);
  const quickHeadlines = articles.slice(3, 8);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* Left: Lead Featured Big Card (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col">
          <ArticleCard
            article={leadArticle}
            variant="lead"
            onSelect={onSelectArticle}
            isBookmarked={bookmarks.includes(leadArticle.id)}
            onToggleBookmark={onToggleBookmark}
            onShare={onShare}
          />
        </div>

        {/* Right: Side Top 2 Stories + Speed Headlines (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          {/* Top 2 Side Horizontal Cards */}
          <div className="space-y-3">
            {secondaryArticles.map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                variant="horizontal"
                onSelect={onSelectArticle}
                isBookmarked={bookmarks.includes(art.id)}
                onToggleBookmark={onToggleBookmark}
                onShare={onShare}
              />
            ))}
          </div>

          {/* Quick News (फ़टाफ़ट समाचार - Top 5) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide text-slate-900 dark:text-white">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>फ़टाफ़ट समाचार (Top 5)</span>
              </div>
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                LIVE
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
              {quickHeadlines.map((art, idx) => (
                <ArticleCard
                  key={art.id}
                  article={art}
                  variant="compact"
                  rankIndex={idx}
                  onSelect={onSelectArticle}
                  isBookmarked={bookmarks.includes(art.id)}
                  onToggleBookmark={onToggleBookmark}
                  onShare={onShare}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
