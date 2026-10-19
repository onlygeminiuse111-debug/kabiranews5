import React, { useState, useEffect } from 'react';
import {
  Search,
  Bookmark,
  Sun,
  Moon,
  Newspaper,
  Radio,
  User,
  Menu,
  X,
  CloudSun,
  Globe,
  Sliders,
  LogOut,
  FolderDown,
  CheckCircle,
  Download,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { PWAInstallHeaderButton } from './PWAInstallBanner';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenEPaper: () => void;
  onOpenAdmin: () => void;
  onExportZip: () => void;
  bookmarkCount: number;
  fontSizeLevel: number;
  onCycleFontSize: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
}

const CITIES_WEATHER = [
  { city: 'भोपाल', temp: '28°C', desc: 'धूप' },
  { city: 'नई दिल्ली', temp: '26°C', desc: 'साफ' },
  { city: 'लखनऊ', temp: '27°C', desc: 'बादल' },
  { city: 'जयपुर', temp: '29°C', desc: 'सुहावना' },
  { city: 'पटना', temp: '27°C', desc: 'धूप' },
  { city: 'मुंबई', temp: '31°C', desc: 'उमस' },
];

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenBookmarks,
  onOpenEPaper,
  onOpenAdmin,
  onExportZip,
  bookmarkCount,
  fontSizeLevel,
  onCycleFontSize,
  darkMode,
  onToggleDarkMode,
  onNavigateHome,
}) => {
  const { language, setLanguage, t, formatHindiDate } = useLanguage();
  const { user, profile, isAdmin, logout } = useAuth();
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Weather ticker rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCityIndex((prev) => (prev + 1) % CITIES_WEATHER.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentWeather = CITIES_WEATHER[currentCityIndex];

  return (
    <header className="bg-white/95 dark:bg-[#121417]/95 backdrop-blur-md border-b border-gray-200/90 dark:border-gray-800/90 transition-colors select-none">
      {/* 1. Top Utility Strip (Desktop) */}
      <div className="hidden lg:block border-b border-gray-100 dark:border-gray-800/70 py-1.5 px-4 text-xs bg-gray-50/70 dark:bg-black/20 text-gray-600 dark:text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Date, Time, Weather */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {formatHindiDate(currentTime)}
            </span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="font-mono text-gray-500">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <CloudSun className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentWeather.city}: <strong className="font-bold">{currentWeather.temp}</strong> ({currentWeather.desc})</span>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-3">
            {/* Font Size Adjuster */}
            <button
              onClick={onCycleFontSize}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition text-[11px]"
              title="अक्षर का आकार बदलें"
            >
              <span className="font-bold">अ/A</span>
              <span className="text-gray-400">{fontSizeLevel === 1 ? 'सामान्य' : fontSizeLevel === 2 ? 'बड़ा' : 'अधिक बड़ा'}</span>
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200/80 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 font-bold transition text-[11px] text-gray-800 dark:text-gray-200"
            >
              <Globe className="w-3 h-3 text-red-600" />
              <span>{language === 'hi' ? 'English' : 'हिन्दी'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition shadow-2xs ${
                darkMode
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-500/50 hover:bg-amber-400/30'
                  : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
              }`}
              title={darkMode ? 'लाइट मोड चालू करें' : 'डार्क मोड चालू करें'}
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>लाइट मोड</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700 fill-slate-700" />
                  <span>डार्क मोड</span>
                </>
              )}
            </button>

            {/* Bookmarks */}
            <button
              onClick={onOpenBookmarks}
              className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
              title="सहेजी गई ख़बरें"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>बुकमार्क</span>
              {bookmarkCount > 0 && (
                <span className="bg-red-600 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                  {bookmarkCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Brand & Nav Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="lg:hidden p-2 -ml-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              aria-label="Open navigation menu"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo */}
            <div
              onClick={onNavigateHome}
              className="cursor-pointer flex items-center gap-2.5 sm:gap-3"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#c41e24] via-red-600 to-rose-600 p-1.5 shadow-md shadow-red-600/20 flex items-center justify-center shrink-0 border border-amber-300/60">
                <img src="/icon.svg" alt="Kabira News" className="w-full h-full object-contain" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-[#c41e24] tracking-tight font-serif leading-none">
                    कबीरा
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase leading-none">
                    न्यूज़
                  </span>
                  <CheckCircle className="w-4 h-4 fill-blue-500 text-white shrink-0 hidden sm:inline" />
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider hidden xs:block mt-0.5">
                  निष्पक्ष • निर्भीक • विश्वसनीय
                </p>
              </div>
            </div>
          </div>

          {/* Center Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/80 text-gray-500 dark:text-gray-400 text-xs transition"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-red-600" />
                <span>समाचार, शहर या विषय खोजें...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-gray-700 text-gray-500 rounded border border-gray-300 dark:border-gray-600">
                /
              </kbd>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="खोजें"
            >
              <Search className="w-5 h-5 text-red-600" />
            </button>

            {/* e-Paper Button */}
            <button
              onClick={onOpenEPaper}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 transition"
              title="डिजिटल ई-पेपर"
            >
              <Newspaper className="w-3.5 h-3.5 text-red-600" />
              <span>{t('ePaper')}</span>
            </button>

            {/* Official WhatsApp Channel Join Link */}
            <a
              href="https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs whitespace-nowrap"
              title="कबीरा न्यूज़ WhatsApp चैनल फॉलो करें"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp चैनल</span>
            </a>

            {/* PWA Install Button */}
            <PWAInstallHeaderButton />

            {/* Vercel ZIP Export Button */}
            <button
              onClick={onExportZip}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
              title="Vercel Code ZIP डाउनलोड करें"
            >
              <FolderDown className="w-3.5 h-3.5" />
              <span>Code ZIP</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                darkMode
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-500/50 hover:bg-amber-400/30'
                  : 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200'
              }`}
              title={darkMode ? 'लाइट मोड चालू करें' : 'डार्क मोड चालू करें'}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="hidden sm:inline">लाइट</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700 fill-slate-700" />
                  <span className="hidden sm:inline">डार्क</span>
                </>
              )}
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-bold transition shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {user || profile ? (profile?.displayName ? profile.displayName.slice(0, 8) : 'एडमिन') : 'संपादक'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121417] p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 font-bold uppercase">
            <span>त्वरित मेनू</span>
            <button onClick={() => setMobileDrawerOpen(false)} className="p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                onOpenEPaper();
                setMobileDrawerOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-left"
            >
              <Newspaper className="w-4 h-4 text-red-600" />
              <span>डिजिटल ई-पेपर</span>
            </button>

            <button
              onClick={() => {
                onOpenBookmarks();
                setMobileDrawerOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-left"
            >
              <Bookmark className="w-4 h-4 text-amber-600" />
              <span>सहेजी गई ख़बरें ({bookmarkCount})</span>
            </button>

            <button
              onClick={() => {
                onCycleFontSize();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-left"
            >
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>फ़ॉन्ट साइज ({fontSizeLevel === 1 ? '1x' : fontSizeLevel === 2 ? '1.2x' : '1.4x'})</span>
            </button>

            <button
              onClick={() => {
                setLanguage(language === 'hi' ? 'en' : 'hi');
                setMobileDrawerOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-left"
            >
              <Globe className="w-4 h-4 text-purple-600" />
              <span>{language === 'hi' ? 'English में पढ़ें' : 'हिंदी में पढ़ें'}</span>
            </button>

            <a
              href="https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileDrawerOpen(false)}
              className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-xs hover:bg-emerald-500 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>कबीरा न्यूज़ WhatsApp चैनल फॉलो करें</span>
            </a>

            <button
              onClick={() => {
                onExportZip();
                setMobileDrawerOpen(false);
              }}
              className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 font-bold"
            >
              <FolderDown className="w-4 h-4" />
              <span>Vercel Deployable ZIP डाउनलोड करें</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
