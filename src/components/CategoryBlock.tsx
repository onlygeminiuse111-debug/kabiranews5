import React from 'react';
import { ChevronRight } from 'lucide-react';
import { NewsArticle, NewsCategory } from '../types/news';
import { ArticleCard } from './ArticleCard';
import { useLanguage } from '../contexts/LanguageContext';

interface CategoryBlockProps {
  category: NewsCategory;
  title: string;
  subtitle?: string;
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onViewMore: (category: NewsCategory) => void;
  bookmarks: string[];
  onToggleBookmark: (article: NewsArticle) => void;
  onShare: (article: NewsArticle, e: React.MouseEvent) => void;
  accentColor?: string;
}

export const CategoryBlock: React.FC<CategoryBlockProps> = ({
  category,
  title,
  subtitle,
  articles,
  onSelectArticle,
  onViewMore,
  bookmarks,
  onToggleBookmark,
  onShare,
}) => {
  const { language } = useLanguage();

  if (articles.length === 0) return null;

  return (
    <section className="my-8">
      {/* Block Header with clean typographic separation */}
      <div className="flex items-center justify-between pb-3.5 mb-5 border-b-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 bg-[#c41e24] rounded-full shrink-0"></span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => onViewMore(category)}
          className="flex items-center gap-1 text-xs font-bold text-[#c41e24] hover:underline dark:text-red-400 transition shrink-0 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-lg"
        >
          <span>{language === 'hi' ? 'सभी 4+ ख़बरें देखें' : 'View All'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2x2 Grid of articles (2 columns x 2 rows = 4 balanced editorial cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {articles.slice(0, 4).map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="grid"
            onSelect={onSelectArticle}
            isBookmarked={bookmarks.includes(article.id)}
            onToggleBookmark={onToggleBookmark}
            onShare={onShare}
          />
        ))}
      </div>
    </section>
  );
};
