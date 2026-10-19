import React from 'react';
import { Home, Zap, LayoutGrid, Bookmark, User, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export type MobileTab = 'home' | 'latest' | 'categories' | 'bookmarks' | 'profile';

interface MobileBottomNavProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  bookmarkCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  bookmarkCount,
}) => {
  const { language } = useLanguage();
  const { user, isAdmin } = useAuth();

  const navItems: { id: MobileTab; labelHi: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      labelHi: 'होम',
      labelEn: 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'latest',
      labelHi: 'ताज़ा ख़बरें',
      labelEn: 'Latest',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: 'categories',
      labelHi: 'श्रेणियां',
      labelEn: 'Explore',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: 'bookmarks',
      labelHi: 'सहेजे गए',
      labelEn: 'Saved',
      icon: (
        <div className="relative">
          <Bookmark className="w-5 h-5" />
          {bookmarkCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              {bookmarkCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'profile',
      labelHi: isAdmin ? 'एडमिन' : 'मेन्यू',
      labelEn: isAdmin ? 'Admin' : 'Menu',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg bottom-nav-safe"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 h-15 items-center px-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all select-none ${
                isActive
                  ? 'text-red-600 dark:text-red-500 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-1 leading-none">
                {language === 'hi' ? item.labelHi : item.labelEn}
              </span>
              {isActive && (
                <span className="w-1.5 h-1 rounded-full bg-red-600 dark:bg-red-500 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
