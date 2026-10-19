import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../contexts/LanguageContext';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useLanguage();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed this session
  if (isInstalled || dismissed) {
    return null;
  }

  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      {/* Mobile Sticky Install Prompt Card */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-2.5 shadow-md border-b border-red-800 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center p-1.5 shrink-0 border border-white/30">
              <img src="/icon.svg" alt="Kabira News App" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold tracking-tight">
                {language === 'hi' ? 'कबीरा न्यूज़ ऐप अपने मोबाइल में इंस्टॉल करें' : 'Install Kabira News Mobile App'}
              </p>
              <p className="text-[11px] text-red-100 hidden sm:block">
                {language === 'hi' ? 'तेज़ लोडिंग, ब्रेकिंग न्यूज़ अलर्ट्स और ऑफ़लाइन समाचार पढ़ने की सुविधा' : 'Faster reading, breaking alerts & offline access'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isInstallable && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-700 hover:bg-red-50 text-xs sm:text-sm font-bold rounded-full shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                {language === 'hi' ? 'इंस्टॉल' : 'Install'}
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-700 hover:bg-red-50 text-xs sm:text-sm font-bold rounded-full shadow-sm transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                {language === 'hi' ? 'iPhone में जोड़ें' : 'Add to iPhone'}
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-600 p-1 flex items-center justify-center">
                  <img src="/icon.svg" alt="Kabira" className="w-full h-full" />
                </div>
                <h3 className="text-base font-bold">
                  {language === 'hi' ? 'iPhone / iPad पर इंस्टॉल करें' : 'Install on iPhone / iPad'}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  सफारी (Safari) ब्राउज़र के नीचे स्थित <strong>शेयर (Share <Share2 className="w-3.5 h-3.5 inline mx-0.5" />)</strong> बटन पर टैप करें।
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  नीचे स्क्रॉल करें और <strong>"होम स्क्रीन में जोड़ें" (Add to Home Screen)</strong> विकल्प को चुनें।
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  ऊपर दायें कोने में <strong>"Add"</strong> पर टैप करें। कबीरा न्यूज़ ऐप आपके होम स्क्रीन पर आ जाएगा!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full rounded-xl bg-red-600 hover:bg-red-700 py-2.5 text-sm font-semibold text-white transition shadow-sm"
            >
              समझ गया / Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PWAInstallHeaderButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useLanguage();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs transition"
        title="कबीरा न्यूज़ ऐप इंस्टॉल करें"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="flex items-center gap-1.5 border border-red-600 text-red-600 dark:text-red-400 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold px-2.5 py-1.5 rounded-full transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">iOS App</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-900 p-5 shadow-xl text-gray-900 dark:text-white">
              <h3 className="font-bold text-base">iPhone Safari में कैसे जोड़ें?</h3>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                1. सफारी के निचले बार में Share बटन दबाएं。<br />
                2. 'Add to Home Screen' चुनें।
              </p>
              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-4 w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200 py-1.5 rounded-lg text-xs font-semibold"
              >
                बंद करें
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
