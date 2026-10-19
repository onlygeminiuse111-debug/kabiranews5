import React from 'react';
import { Bookmark, Share2, Clock, Eye, Sparkles, MessageCircle, ExternalLink } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { useLanguage } from '../contexts/LanguageContext';
import { getSmartArticleImage } from '../services/imageMatcher';

interface ArticleCardProps {
  article: NewsArticle;
  variant?: 'grid' | 'horizontal' | 'compact' | 'lead';
  rankIndex?: number;
  onSelect: (article: NewsArticle) => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: NewsArticle) => void;
  onShare: (article: NewsArticle, e: React.MouseEvent) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'grid',
  rankIndex,
  onSelect,
  isBookmarked,
  onToggleBookmark,
  onShare,
}) => {
  const { formatTimeAgo, language } = useLanguage();
  const displayImage = getSmartArticleImage(article);

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?article=${encodeURIComponent(article.id)}`;
    const text =
      `📰 *कबीरा न्यूज़ (Kabira News) - ई-पेपर बुलेटिन*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📍 *${(article.category || 'समाचार').toUpperCase()}* ${article.state ? `• ${article.state}` : ''}\n\n` +
      `🔥 *${article.title}*\n\n` +
      `📝 ${article.summary ? article.summary.slice(0, 150) + '...' : ''}\n\n` +
      `🌐 *पूरी खबर विस्तार से पढ़ें:* ${url}\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👉 *कबीरा न्यूज़ का आधिकारिक WhatsApp चैनल अभी फॉलो करें:*\nhttps://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N\n\n` +
      `📞 *न्यूज़ या विज्ञापन देने के लिए संपर्क:* नितेश जोशी 9893537306`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getCategoryLabel = () => {
    if (article.category === 'state' && article.state) {
      return `${article.state} ${article.city ? '· ' + article.city : ''}`;
    }
    const map: Record<string, string> = {
      national: 'देश',
      politics: 'राजनीति',
      sports: 'खेल',
      business: 'व्यापार',
      tech: 'तकनीक',
      entertainment: 'सिनेमा',
      world: 'दुनिया',
      health: 'सेहत',
      state: 'राज्य',
      education: 'शिक्षा',
    };
    return map[article.category] || article.category;
  };

  const getCategoryColor = () => {
    const map: Record<string, string> = {
      national: 'bg-red-600 text-white',
      politics: 'bg-rose-700 text-white',
      sports: 'bg-emerald-600 text-white',
      business: 'bg-blue-600 text-white',
      tech: 'bg-teal-600 text-white',
      entertainment: 'bg-purple-600 text-white',
      world: 'bg-indigo-600 text-white',
      health: 'bg-green-600 text-white',
      state: 'bg-amber-600 text-white',
      education: 'bg-sky-600 text-white',
    };
    return map[article.category] || 'bg-red-600 text-white';
  };

  // Lead variant (Big visual hero featured story)
  if (variant === 'lead') {
    return (
      <article
        onClick={() => onSelect(article)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-red-400 dark:hover:border-red-600 transition-all duration-300 flex flex-col h-full"
      >
        <div className="relative aspect-16/10 sm:aspect-16/9 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={displayImage}
            alt={article.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getSmartArticleImage({ ...article, imageUrl: undefined });
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
            {article.isBreaking && (
              <span className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                ब्रेकिंग न्यूज़
              </span>
            )}
            <span className={`text-[11px] font-black px-2.5 py-1 rounded-md shadow-md ${getCategoryColor()}`}>
              {getCategoryLabel()}
            </span>
          </div>

          {/* Quick Actions (WhatsApp & Bookmark) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={handleWhatsAppShare}
              className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white backdrop-blur-md transition shadow-md"
              title="ई-पेपर बुलेटिन WhatsApp पर शेयर करें"
              aria-label="WhatsApp Share"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(article);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition shadow-md ${
                isBookmarked
                  ? 'bg-red-600 text-white'
                  : 'bg-white/90 text-slate-800 dark:bg-slate-900/90 dark:text-white hover:bg-white'
              }`}
              title="बुकमार्क करें"
              aria-label="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Mobile Overlay Title */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:hidden">
            <h2 className="text-lg font-black text-white leading-tight font-serif drop-shadow-md line-clamp-2">
              {article.title}
            </h2>
          </div>
        </div>

        {/* Desktop / Tablet Headline & Body */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <h2 className="hidden sm:block text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition font-serif">
              {article.title}
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {article.summary}
            </p>
          </div>

          {/* Unboxed Metadata */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              {article.author?.avatar ? (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : null}
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                {article.author?.name || 'कबीरा न्यूज़ डेस्क'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeAgo(article.publishedAt)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views.toLocaleString('hi-IN')} व्यूज
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Horizontal variant (e.g. side lists)
  if (variant === 'horizontal') {
    return (
      <article
        onClick={() => onSelect(article)}
        className="group cursor-pointer p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-500 shadow-xs hover:shadow-md transition flex gap-3.5 items-center"
      >
        <div className="relative w-24 h-20 sm:w-28 sm:h-22 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={displayImage}
            alt={article.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getSmartArticleImage({ ...article, imageUrl: undefined });
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {article.isBreaking && (
            <span className="absolute top-1 left-1 bg-red-600 text-[9px] text-white font-extrabold px-1 rounded shadow-xs">
              ब्रेकिंग
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs ${getCategoryColor()}`}>
              {getCategoryLabel()}
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400">{formatTimeAgo(article.publishedAt)}</span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition font-serif">
            {article.title}
          </h3>
        </div>
      </article>
    );
  }

  // Compact variant with ranking index (e.g. 01, 02 for Top 5)
  if (variant === 'compact') {
    return (
      <article
        onClick={() => onSelect(article)}
        className="group cursor-pointer py-3 border-b border-slate-100 dark:border-slate-700/80 last:border-none flex items-start gap-3.5"
      >
        {rankIndex !== undefined ? (
          <span className="text-xl font-black text-red-600 dark:text-red-400 font-mono w-6 shrink-0 pt-0.5">
            {String(rankIndex + 1).padStart(2, '0')}
          </span>
        ) : (
          <span className="text-red-600 font-black text-lg">•</span>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug font-serif">
            {article.title}
          </h4>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            <span className="font-semibold text-red-600 dark:text-red-400">{getCategoryLabel()}</span>
            <span aria-hidden="true">·</span>
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </article>
    );
  }

  // Standard Grid Card (Used in 2x2 grid and category matrices)
  return (
    <article
      onClick={() => onSelect(article)}
      className="group cursor-pointer rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-red-400 dark:hover:border-red-500 transition-all duration-300 flex flex-col overflow-hidden"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={displayImage}
          alt={article.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getSmartArticleImage({ ...article, imageUrl: undefined });
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category & Breaking badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {article.isBreaking && (
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wide animate-pulse">
              ब्रेकिंग
            </span>
          )}
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded shadow-sm uppercase tracking-wider ${getCategoryColor()}`}>
            {getCategoryLabel()}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
          <button
            onClick={handleWhatsAppShare}
            className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white backdrop-blur-md transition shadow-md"
            title="WhatsApp पर शेयर करें"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition shadow-md ${
              isBookmarked ? 'bg-red-600 text-white' : 'bg-black/40 text-white hover:bg-black/70'
            }`}
            title="सहेजें"
            aria-label="Bookmark"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(article, e);
            }}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition shadow-md"
            title="शेयर करें"
            aria-label="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition font-serif">
            {article.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Unboxed footer metadata */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
            {article.author?.name || 'कबीरा न्यूज़'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-red-600 dark:text-red-400 font-medium">{formatTimeAgo(article.publishedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{article.views} व्यूज</span>
          </div>
        </div>
      </div>
    </article>
  );
};
