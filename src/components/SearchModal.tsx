import React, { useState, useMemo } from 'react';
import { Search, X, Clock, ArrowRight, Filter } from 'lucide-react';
import { NewsArticle, NewsCategory } from '../types/news';
import { CATEGORIES, INDIAN_STATES } from '../data/categories';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchModalProps {
  articles: NewsArticle[];
  onClose: () => void;
  onSelectArticle: (article: NewsArticle) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ articles, onClose, onSelectArticle }) => {
  const { language, formatTimeAgo } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Category filter
      if (selectedCategory !== 'all' && art.category !== selectedCategory) {
        return false;
      }
      // State filter
      if (selectedState !== 'all' && art.state !== selectedState) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const inTitle = art.title.toLowerCase().includes(q);
        const inSummary = art.summary.toLowerCase().includes(q);
        const inContent = art.content.toLowerCase().includes(q);
        const inAuthor = art.author?.name?.toLowerCase().includes(q);
        const inTags = art.tags?.some((t) => t.toLowerCase().includes(q));
        return inTitle || inSummary || inContent || inAuthor || inTags;
      }
      return true;
    });
  }, [articles, searchTerm, selectedCategory, selectedState]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 sm:pt-16">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-red-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="समाचार, राजनेता, खिलाड़ी, शहर या विषय खोजें..."
            className="flex-1 bg-transparent text-base sm:text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> श्रेणी:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          >
            <option value="all">सभी श्रेणियां</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameHi}
              </option>
            ))}
          </select>

          <span className="font-semibold text-gray-500 dark:text-gray-400 ml-2">राज्य:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          >
            <option value="all">सभी राज्य</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <span className="ml-auto text-gray-400 font-medium">
            {filteredArticles.length} परिणाम मिले
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  onSelectArticle(article);
                  onClose();
                }}
                className="pt-3 first:pt-0 cursor-pointer group flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 p-2 rounded-xl transition"
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-20 h-16 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                      {article.category}
                    </span>
                    {article.state && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        {article.state}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(article.publishedAt)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">कोई परिणाम नहीं मिला।</p>
              <p className="text-xs text-gray-400 mt-1">अन्य खोज शब्द या श्रेणी चुनकर प्रयास करें।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
