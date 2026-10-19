import React from 'react';
import { Bookmark, X, Trash2, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { useLanguage } from '../contexts/LanguageContext';

interface BookmarksModalProps {
  bookmarkedArticles: NewsArticle[];
  onClose: () => void;
  onSelectArticle: (article: NewsArticle) => void;
  onRemoveBookmark: (articleId: string) => void;
  onClearAll: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  bookmarkedArticles,
  onClose,
  onSelectArticle,
  onRemoveBookmark,
  onClearAll,
}) => {
  const { language, formatTimeAgo } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-red-600 fill-red-600" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {language === 'hi' ? 'सहेजे गए समाचार (Bookmarks)' : 'Saved Stories'}
            </h3>
            <span className="text-xs bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-2 py-0.5 rounded-full">
              {bookmarkedArticles.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {bookmarkedArticles.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold"
              >
                सभी हटाएं
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarkedArticles.length > 0 ? (
            bookmarkedArticles.map((article) => (
              <div
                key={article.id}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 flex items-center gap-3 group"
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-16 h-14 object-cover rounded-lg shrink-0 cursor-pointer"
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                  }}
                />

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                  }}
                >
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">
                    {article.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-red-600 transition leading-snug">
                    {article.title}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {formatTimeAgo(article.publishedAt)}
                  </span>
                </div>

                <button
                  onClick={() => onRemoveBookmark(article.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition shrink-0"
                  title="हटाएं"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">कोई लेख सहेजा नहीं गया है।</p>
              <p className="text-xs text-gray-400 mt-1">
                किसी भी समाचार कार्ड पर बुकमार्क आइकन दबाकर बाद में पढ़ने के लिए सहेजें।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
