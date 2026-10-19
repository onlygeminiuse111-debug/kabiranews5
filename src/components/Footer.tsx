import React from 'react';
import { Mail, Phone, MapPin, Shield, CheckCircle, ChevronUp, Newspaper, Download } from 'lucide-react';
import { CATEGORIES, INDIAN_STATES } from '../data/categories';
import { NewsCategory } from '../types/news';
import { useLanguage } from '../contexts/LanguageContext';
import { PWAInstallHeaderButton } from './PWAInstallBanner';

interface FooterProps {
  onSelectCategory: (cat: NewsCategory | 'all') => void;
  onOpenAdmin: () => void;
  onOpenEPaper: () => void;
  onExportZip: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenAdmin,
  onOpenEPaper,
  onExportZip,
}) => {
  const { language } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-950 text-gray-300 border-t-4 border-red-700 pt-12 pb-32 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Branding & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 p-1.5 flex items-center justify-center">
                <img src="/icon.svg" alt="Kabira News" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-black text-white font-serif">कबीरा</span>{' '}
                <span className="text-xl font-black text-red-500 uppercase">न्यूज़</span>
                <p className="text-[10px] text-gray-400 font-semibold tracking-wider">
                  निष्पक्ष • निर्भीक • विश्वसनीय
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              कबीरा न्यूज़ भारत का एक स्वतंत्र, निष्पक्ष और आधुनिक डिजिटल हिंदी समाचार पोर्टल है। हमारा संकल्प है सच को बिना लाग-लपेट जनता तक पहुंचाना।
            </p>

            <div className="flex items-center gap-3 text-xs text-emerald-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>सत्यापित व निष्पक्ष पत्रकारिता (Fact-Checked)</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              प्रमुख श्रेणियां
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-red-400 transition"
                  >
                    {language === 'hi' ? cat.nameHi : cat.nameEn} समाचार
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Regional States */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              राज्य और अंचल
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {INDIAN_STATES.slice(0, 8).map((st) => (
                <button
                  key={st}
                  onClick={() => onSelectCategory('state')}
                  className="text-left hover:text-amber-400 transition"
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Editorial & Contact Info */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2">
              संपादकीय व संपर्क
            </h4>
            <p className="text-gray-400 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>कबीरा मीडिया भवन, प्रेस कॉम्प्लेक्स, एमपी नगर, भोपाल, म.प्र. 462011</span>
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-500 shrink-0" />
              <span>contact@kabiranews.com</span>
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                समाचार व विज्ञापन: <strong className="text-white font-bold">नितेश जोशी 9893537306</strong>
              </span>
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href="https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-xs"
              >
                <span>WhatsApp चैनल फॉलो करें</span>
              </a>
              <button
                onClick={onOpenEPaper}
                className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Newspaper className="w-3.5 h-3.5 text-red-500" />
                <span>ई-पेपर पढ़ें</span>
              </button>
              <button
                onClick={onExportZip}
                className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-xs font-bold text-emerald-300 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Code ZIP</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Legal Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            <p>© {new Date().getFullYear()} कबीरा न्यूज़ (Kabira News). सर्वाधिकार सुरक्षित।</p>
            <p className="text-[11px] text-gray-600 mt-1">
              सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश और डिजिटल मीडिया आचार संहिता) नियम 2021 के अनुरूप पंजीकृत।
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenAdmin} className="hover:text-gray-300">
              संपादक लॉगिन
            </button>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer">गोपनीयता नीति</span>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer">नियम व शर्तें</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-gray-800 hover:bg-red-600 text-white transition ml-2"
              title="ऊपर जाएं"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
