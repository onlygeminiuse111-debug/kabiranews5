import React from 'react';
import { Phone, MessageCircle, Megaphone, CheckCircle2, Send, ExternalLink, Sparkles } from 'lucide-react';
import { CONTACT_PHONE, CONTACT_PERSON, WHATSAPP_CHANNEL_URL } from './BottomContactTicker';

export const HomeContactBanner: React.FC = () => {
  const whatsappUrl = `https://wa.me/91${CONTACT_PHONE}?text=${encodeURIComponent(
    'नमस्ते नितेश जी, मुझे कबीरा न्यूज़ में समाचार / विज्ञापन देने के लिए संपर्क करना है।'
  )}`;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 my-10 select-none">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-800 via-rose-900 to-amber-900 text-white p-6 sm:p-10 shadow-2xl border-2 border-amber-400/60">
        {/* Ambient background blur elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-red-600/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Message & Information */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
              <Megaphone className="w-4 h-4 animate-bounce" />
              <span>समाचार प्रसारण व विज्ञापन सेवा</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif leading-tight text-white drop-shadow-sm">
              न्यूज़ देने या विज्ञापन देने के लिए संपर्क करें
            </h3>

            <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed font-medium">
              प्रेस नोट, ब्रेकिंग न्यूज़, डिजिटल विज्ञापन, चुनावी कवरेज, व्यावसायिक प्रचार अथवा ई-पेपर संस्करण में विज्ञापन देने के लिए कबीरा न्यूज़ डेस्क से सीधे जुड़ें।
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-amber-200">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                लाखों पाठकों तक त्वरित पहुंच
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                सोशल मीडिया व ई-पेपर प्रसारण
              </span>
            </div>
          </div>

          {/* Right: Contact Person Card & Direct Action Buttons */}
          <div className="lg:col-span-5 bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/15 pb-3">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                नि
              </div>
              <div>
                <h4 className="text-lg font-black text-white">{CONTACT_PERSON}</h4>
                <p className="text-xs text-amber-300 font-semibold">
                  कबीरा न्यूज़ डेस्क (समाचार व विज्ञापन प्रभारी)
                </p>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition shadow-lg transform active:scale-95"
              >
                <Phone className="w-4 h-4 text-red-900" />
                <span>कॉल: {CONTACT_PHONE}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm transition shadow-lg transform active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp चैट</span>
              </a>
            </div>

            {/* Channel Link */}
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition border border-white/20"
            >
              <span>कबीरा न्यूज़ WhatsApp चैनल फॉलो करें</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
