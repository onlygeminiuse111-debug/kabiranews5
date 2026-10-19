/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { NewsArticle, NewsCategory } from './types/news';
import { fetchArticles, subscribeToArticles } from './services/newsService';
import { HomeContactAdBanner } from './components/HomeContactAdBanner';
import { INITIAL_NEWS_ARTICLES } from './data/seedNews';
import { Header } from './components/Header';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { TrendingBar } from './components/TrendingBar';
import { CategoryNav } from './components/CategoryNav';
import { HeroSection } from './components/HeroSection';
import { StateNewsSection } from './components/StateNewsSection';
import { CategoryBlock } from './components/CategoryBlock';
import { ArticleDetail } from './components/ArticleDetail';
import { ArticleCard } from './components/ArticleCard';
import { SearchModal } from './components/SearchModal';
import { BookmarksModal } from './components/BookmarksModal';
import { EPaperModal } from './components/EPaperModal';
import { StateModal } from './components/StateModal';
import { ShareModal } from './components/ShareModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Footer } from './components/Footer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { SkeletonLoader } from './components/SkeletonLoader';
import { BottomContactTicker } from './components/BottomContactTicker';
import { ArrowLeft, RefreshCw, Zap } from 'lucide-react';

function NewsPortal() {
  const { user, isAdmin } = useAuth();
  const { language, t } = useLanguage();

  // News State
  const [articles, setArticles] = useState<NewsArticle[]>(INITIAL_NEWS_ARTICLES);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [onlyBreaking, setOnlyBreaking] = useState(false);

  // Mobile navigation active tab
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');

  // User preferences
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kabira_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [fontSizeLevel, setFontSizeLevel] = useState<number>(() => {
    return Number(localStorage.getItem('kabira_font_size')) || 1;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kabira_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return false; // Default to bright, colorful, luminous Light Mode!
    } catch {
      return false;
    }
  });

  // Modal dialog states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isEPaperOpen, setIsEPaperOpen] = useState(false);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [sharingArticle, setSharingArticle] = useState<NewsArticle | null>(null);

  // Dark mode class sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kabira_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kabira_theme', 'light');
    }
  }, [darkMode]);

  // Load articles from Firestore / Local Storage
  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await fetchArticles({ status: 'published' });
      if (data && data.length > 0) {
        setArticles(data);
      }
    } catch (err) {
      console.warn('Load articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();

    // 1. Subscribe to Firestore real-time updates: portal updates automatically when news is published!
    const unsubscribe = subscribeToArticles((freshArticles) => {
      if (freshArticles && freshArticles.length > 0) {
        setArticles(freshArticles);
      }
    }, { status: 'published' });

    // 2. Periodic background refresh every 3 minutes (safety polling for stale tabs/offline resumption)
    const refreshInterval = setInterval(() => {
      loadArticles();
    }, 180000);

    // 3. Check ?article=slug in URL
    const params = new URLSearchParams(window.location.search);
    const articleSlug = params.get('article');
    if (articleSlug) {
      const match = articles.find(
        (a) => a.slug === articleSlug || a.id === articleSlug
      );
      if (match) {
        setSelectedArticle(match);
      }
    }

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const handleSelectArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    const newUrl = `${window.location.pathname}?article=${article.slug}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedArticle(null);
    setSelectedCategory('all');
    setSelectedTag(null);
    setSelectedState(null);
    setSelectedCity(null);
    setOnlyBreaking(false);
    setMobileTab('home');
    const newUrl = window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bookmark toggle
  const toggleBookmark = (article: NewsArticle) => {
    setBookmarks((prev) => {
      let updated;
      if (prev.includes(article.id)) {
        updated = prev.filter((id) => id !== article.id);
      } else {
        updated = [...prev, article.id];
      }
      localStorage.setItem('kabira_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearBookmarks = () => {
    setBookmarks([]);
    localStorage.removeItem('kabira_bookmarks');
  };

  const cycleFontSize = () => {
    const next = fontSizeLevel === 1 ? 2 : fontSizeLevel === 2 ? 3 : 1;
    setFontSizeLevel(next);
    localStorage.setItem('kabira_font_size', String(next));
  };

  const handleOpenAdmin = () => {
    if (isAdmin) {
      setIsAdminOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleExportZip = () => {
    const link = document.createElement('a');
    link.href = '/kabira-news.zip';
    link.download = 'kabira-news.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mobile Bottom Nav Tab handler
  const handleMobileTabSelect = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === 'home') {
      handleBackToHome();
    } else if (tab === 'latest') {
      setSelectedArticle(null);
      setOnlyBreaking(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'categories') {
      setIsSearchOpen(true);
    } else if (tab === 'bookmarks') {
      setIsBookmarksOpen(true);
    } else if (tab === 'profile') {
      handleOpenAdmin();
    }
  };

  const bookmarkedArticles = articles.filter((a) => bookmarks.includes(a.id));

  // Filtered state
  const isFiltered =
    selectedCategory !== 'all' ||
    selectedTag !== null ||
    selectedState !== null ||
    onlyBreaking;

  const filteredNews = articles.filter((a) => {
    if (onlyBreaking && !a.isBreaking) return false;
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (
      selectedTag &&
      (!a.tags || !a.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()))
    )
      return false;
    if (selectedState && a.state !== selectedState) return false;
    if (selectedCity && a.city !== selectedCity) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 transition-colors selection:bg-[#c41e24] selection:text-white">
      {/* 1. PWA Install Promotional Header Banner */}
      <PWAInstallBanner />

      {/* 2. Fixed / Sticky Top Header Stack */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-slate-800">
        {/* Fixed Breaking News Marquee Ticker */}
        <BreakingNewsTicker
          articles={articles}
          onSelectArticle={handleSelectArticle}
        />

        {/* Main Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          onOpenEPaper={() => setIsEPaperOpen(true)}
          onOpenAdmin={handleOpenAdmin}
          onExportZip={handleExportZip}
          bookmarkCount={bookmarks.length}
          fontSizeLevel={fontSizeLevel}
          onCycleFontSize={cycleFontSize}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onNavigateHome={handleBackToHome}
        />

        {/* Horizontal Scrollable Category Navigation */}
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedArticle(null);
            setSelectedTag(null);
            setSelectedState(null);
            setOnlyBreaking(false);
          }}
          onOpenStateModal={() => setIsStateModalOpen(true)}
        />
      </div>

      {/* 3. Trending Topics Strip */}
      <TrendingBar
        onSelectTag={(tag) => {
          setSelectedTag(tag || null);
          if (tag) setSelectedArticle(null);
        }}
        selectedTag={selectedTag}
      />

      {/* 4. Main Body Content (With pb-28 on mobile so bottom nav never blocks content!) */}
      <main className="flex-1 pb-28 md:pb-12">
        {loading ? (
          <SkeletonLoader />
        ) : selectedArticle ? (
          /* View 1: Detailed Article View */
          <ArticleDetail
            article={selectedArticle}
            allArticles={articles}
            onBack={handleBackToHome}
            onSelectArticle={handleSelectArticle}
            isBookmarked={bookmarks.includes(selectedArticle.id)}
            onToggleBookmark={toggleBookmark}
            onShare={(art) => setSharingArticle(art)}
            fontSizeLevel={fontSizeLevel}
            onCycleFontSize={cycleFontSize}
          />
        ) : isFiltered ? (
          /* View 2: Filtered Category / State / Trending / Breaking News in 2x2 Grid */
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
            <div className="flex items-center justify-between pb-3.5 mb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToHome}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-[#c41e24] hover:text-white transition shadow-xs"
                  title="मुख्य पृष्ठ"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white">
                    {onlyBreaking
                      ? '🔴 ताज़ा ब्रेकिंग समाचार'
                      : selectedTag
                      ? `#${selectedTag}`
                      : selectedState
                      ? `${selectedState} ${selectedCity ? `• ${selectedCity}` : ''}`
                      : selectedCategory.toUpperCase()}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    कुल {filteredNews.length} समाचार उपलब्ध हैं (2x2 ग्रिड)
                  </p>
                </div>
              </div>

              <button
                onClick={handleBackToHome}
                className="text-xs font-bold text-[#c41e24] dark:text-red-400 hover:underline bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-lg"
              >
                सभी समाचार देखें
              </button>
            </div>

            {filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {filteredNews.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="grid"
                    onSelect={handleSelectArticle}
                    isBookmarked={bookmarks.includes(article.id)}
                    onToggleBookmark={toggleBookmark}
                    onShare={(art, e) => {
                      e.stopPropagation();
                      setSharingArticle(art);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <p className="text-sm font-semibold">इस फ़िल्टर के लिए कोई समाचार नहीं मिला।</p>
                <button
                  onClick={handleBackToHome}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#c41e24] text-white font-bold text-xs"
                >
                  मुख्य पृष्ठ पर वापस जाएं
                </button>
              </div>
            )}
          </div>
        ) : (
          /* View 3: Complete Homepage Layout with 2x2 Grids */
          <>
            {/* Hero Featured Story & Top 5 Speed Headlines */}
            <HeroSection
              articles={articles}
              onSelectArticle={handleSelectArticle}
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
              onShare={(art, e) => {
                e.stopPropagation();
                setSharingArticle(art);
              }}
            />

            {/* Top 2x2 Breaking & Trending Headlines Grid */}
            <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b-2 border-[#c41e24]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#c41e24] text-white shadow-sm">
                    <Zap className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif tracking-tight">
                      ताज़ा व प्रमुख सुर्खियां (2x2 Grid)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      देश और प्रदेश की शीर्ष 4 सबसे बड़ी ख़बरें
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#c41e24] bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full border border-red-200 dark:border-red-900">
                  🔴 ताज़ा बुलेटिन
                </span>
              </div>

              {/* 2x2 Grid: Exactly 2 Columns x 2 Rows = 4 Articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {articles.slice(0, 4).map((art) => (
                  <ArticleCard
                    key={`top-2x2-${art.id}`}
                    article={art}
                    variant="grid"
                    onSelect={handleSelectArticle}
                    isBookmarked={bookmarks.includes(art.id)}
                    onToggleBookmark={toggleBookmark}
                    onShare={(article, e) => {
                      e.stopPropagation();
                      setSharingArticle(article);
                    }}
                  />
                ))}
              </div>
            </section>

            {/* Regional State and City Reporting Block in 2x2 Grid */}
            <StateNewsSection
              articles={articles}
              onSelectArticle={handleSelectArticle}
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
              onShare={(art, e) => {
                e.stopPropagation();
                setSharingArticle(art);
              }}
            />

            {/* Structured Category Blocks */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-8">
              {/* National & Politics Block */}
              <CategoryBlock
                category="national"
                title="देश और राजनीति (National & Politics)"
                subtitle="भारत की प्रमुख राजनीतिक, विधिक और राष्ट्रीय हलचल"
                articles={articles.filter(
                  (a) => a.category === 'national' || a.category === 'politics'
                )}
                onSelectArticle={handleSelectArticle}
                onViewMore={(cat) => setSelectedCategory(cat)}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
                onShare={(art, e) => {
                  e.stopPropagation();
                  setSharingArticle(art);
                }}
              />

              {/* Sports / Cricket Block */}
              <CategoryBlock
                category="sports"
                title="खेल संसार (Cricket & Sports)"
                subtitle="क्रिकेट मैदान से लेकर अंतरराष्ट्रीय खेलों की हर ताज़ा रिपोर्ट"
                articles={articles.filter((a) => a.category === 'sports')}
                onSelectArticle={handleSelectArticle}
                onViewMore={(cat) => setSelectedCategory(cat)}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
                onShare={(art, e) => {
                  e.stopPropagation();
                  setSharingArticle(art);
                }}
              />

              {/* Business & Tech Block */}
              <CategoryBlock
                category="business"
                title="व्यापार और तकनीक (Business & Innovation)"
                subtitle="शेयर बाज़ार, डिजिटल इंडिया, स्टार्टअप्स और नए गैजेट्स"
                articles={articles.filter(
                  (a) => a.category === 'business' || a.category === 'tech'
                )}
                onSelectArticle={handleSelectArticle}
                onViewMore={(cat) => setSelectedCategory(cat)}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
                onShare={(art, e) => {
                  e.stopPropagation();
                  setSharingArticle(art);
                }}
              />

              {/* Cinema & Health Block */}
              <CategoryBlock
                category="entertainment"
                title="सिनेमा और सेहत (Entertainment & Health)"
                subtitle="बॉलीवुड, ऐतिहासिक फिल्में, आयुर्वेद शोध और तंदुरुस्ती"
                articles={articles.filter(
                  (a) => a.category === 'entertainment' || a.category === 'health'
                )}
                onSelectArticle={handleSelectArticle}
                onViewMore={(cat) => setSelectedCategory(cat)}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
                onShare={(art, e) => {
                  e.stopPropagation();
                  setSharingArticle(art);
                }}
              />

              {/* Dedicated Home Advertisement & News Contact Section */}
              <HomeContactAdBanner />
            </div>
          </>
        )}
      </main>

      {/* 5. Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedArticle(null);
        }}
        onOpenAdmin={handleOpenAdmin}
        onOpenEPaper={() => setIsEPaperOpen(true)}
        onExportZip={handleExportZip}
      />

      {/* 6. Sticky Scrolling Bottom Bar for News/Advertising Contact */}
      <BottomContactTicker />

      {/* 7. Mobile Fixed Bottom Navigation Bar (Visible only on mobile) */}
      <MobileBottomNav
        currentTab={mobileTab}
        onSelectTab={handleMobileTabSelect}
        bookmarkCount={bookmarks.length}
      />

      {/* 8. Dialogs & Modals */}
      {isSearchOpen && (
        <SearchModal
          articles={articles}
          onClose={() => setIsSearchOpen(false)}
          onSelectArticle={handleSelectArticle}
        />
      )}

      {isBookmarksOpen && (
        <BookmarksModal
          bookmarkedArticles={bookmarkedArticles}
          onClose={() => setIsBookmarksOpen(false)}
          onSelectArticle={handleSelectArticle}
          onRemoveBookmark={(id) => {
            setBookmarks((prev) => prev.filter((bId) => bId !== id));
          }}
          onClearAll={handleClearBookmarks}
        />
      )}

      {isEPaperOpen && (
        <EPaperModal
          articles={articles}
          onSelectArticle={handleSelectArticle}
          onClose={() => setIsEPaperOpen(false)}
        />
      )}

      {isStateModalOpen && (
        <StateModal
          onClose={() => setIsStateModalOpen(false)}
          onSelectStateCity={(st, ct) => {
            setSelectedState(st);
            setSelectedCity(ct || null);
            setSelectedCategory('state');
            setSelectedArticle(null);
          }}
          currentState={selectedState || 'मध्य प्रदेश'}
          currentCity={selectedCity || undefined}
        />
      )}

      {sharingArticle && (
        <ShareModal
          article={sharingArticle}
          onClose={() => setSharingArticle(null)}
        />
      )}

      {isLoginModalOpen && (
        <AdminLoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => {
            setIsLoginModalOpen(false);
            setIsAdminOpen(true);
          }}
        />
      )}

      {isAdminOpen && (
        <AdminDashboard
          articles={articles}
          onRefresh={loadArticles}
          onClose={() => setIsAdminOpen(false)}
          onPreviewArticle={(art) => {
            setIsAdminOpen(false);
            handleSelectArticle(art);
          }}
          onExportZip={handleExportZip}
        />
      )}

      {/* 8. Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NewsPortal />
      </LanguageProvider>
    </AuthProvider>
  );
}
