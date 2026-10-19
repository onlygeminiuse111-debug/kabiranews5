import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useLanguage } from '../contexts/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useLanguage();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 text-white px-4 py-2.5 shadow-2xl border border-amber-500 animate-bounce">
      <WifiOff className="w-5 h-5 shrink-0" />
      <div className="text-xs sm:text-sm">
        <p className="font-bold">
          {language === 'hi' ? 'आप ऑफ़लाइन हैं' : 'Offline Mode'}
        </p>
        <p className="text-[11px] text-amber-100">
          {language === 'hi'
            ? 'चिंता न करें, कबीरा न्यूज़ के कैश्ड समाचार पढ़े जा सकते हैं।'
            : 'Viewing cached articles. Reconnect for latest updates.'}
        </p>
      </div>
    </div>
  );
};
