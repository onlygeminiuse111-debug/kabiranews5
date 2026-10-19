import React from 'react';
import { Phone, MessageCircle, Megaphone, Bell } from 'lucide-react';

export const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N';
export const CONTACT_PHONE = '9893537306';
export const CONTACT_PERSON = 'नितेश जोशी';

export const BottomContactTicker: React.FC = () => {
  const whatsappUrl = `https://wa.me/91${CONTACT_PHONE}?text=${encodeURIComponent(
    'नमस्ते नितेश जी, मुझे कबीरा न्यूज़ में समाचार / विज्ञापन देने के लिए संपर्क करना है।'
  )}`;

  return (
    <div className="fixed bottom-15 sm:bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#c41e24] via-red-800 to-amber-700 text-white border-t-2 border-amber-300 shadow-xl">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between gap-3 overflow-hidden text-xs sm:text-sm">
        {/* Left Badge */}
        <div className="shrink-0 flex items-center gap-1.5 bg-amber-500 text-black px-2.5 py-1 rounded-md font-black uppercase text-[11px] sm:text-xs tracking-wider shadow-xs">
          <Megaphone className="w-3.5 h-3.5 animate-bounce" />
          <span className="whitespace-nowrap">विज्ञापन व समाचार</span>
        </div>

        {/* Center Infinite Scrolling Marquee */}
        <div className="flex-1 overflow-hidden relative whitespace-nowrap">
          <div className="inline-block animate-marquee hover:pause cursor-default font-medium text-amber-200">
            <span className="mx-4 text-white font-bold">
              न्यूज़ देने या विज्ञापन देने के लिए संपर्क करें - {CONTACT_PERSON} {CONTACT_PHONE}
            </span>
            <span className="text-amber-400">✦</span>
            <span className="mx-4 text-emerald-300 font-semibold">
              कबीरा न्यूज़ के आधिकारिक WhatsApp चैनल को फॉलो करें
            </span>
            <span className="text-amber-400">✦</span>
            <span className="mx-4 text-white font-bold">
              समाचार प्रसारण, चुनावी कवरेज, डिजिटल विज्ञापन व प्रेस रिलीज हेतु तुरंत संपर्क करें: {CONTACT_PHONE}
            </span>
            <span className="text-amber-400">✦</span>
            <span className="mx-4 text-amber-200">
              कबीरा न्यूज़ - निष्पक्ष, निर्भीक और सच का सबसे भरोसेमंद डिजिटल मंच
            </span>
          </div>
        </div>

        {/* Right Action Quick Connect Buttons */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
          {/* Direct Call Button */}
          <a
            href={`tel:${CONTACT_PHONE}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[11px] sm:text-xs transition shadow-xs whitespace-nowrap"
            title="सीधे कॉल करें"
          >
            <Phone className="w-3 h-3 text-red-800" />
            <span className="hidden xs:inline">कॉल:</span>
            <span>{CONTACT_PHONE}</span>
          </a>

          {/* WhatsApp Chat Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs transition shadow-xs whitespace-nowrap"
            title="व्हाट्सएप पर मैसेज भेजें"
          >
            <MessageCircle className="w-3 h-3" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* WhatsApp Channel Join Button */}
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-700 hover:bg-teal-600 text-white font-bold text-[11px] sm:text-xs transition shadow-xs whitespace-nowrap"
            title="व्हाट्सएप चैनल फॉलो करें"
          >
            <Bell className="w-3 h-3 text-amber-300" />
            <span>चैनल फॉलो करें</span>
          </a>
        </div>
      </div>
    </div>
  );
};
