import React from 'react';
import { Phone, MessageCircle, Megaphone, Bell, Mail, MapPin, Award, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { CONTACT_PHONE, CONTACT_PERSON, WHATSAPP_CHANNEL_URL } from './BottomContactTicker';

export const HomeContactAdBanner: React.FC = () => {
  const whatsappUrl = `https://wa.me/91${CONTACT_PHONE}?text=${encodeURIComponent(
    'नमस्ते नितेश जी, मुझे कबीरा न्यूज़ में समाचार / विज्ञापन देने के संबंध में चर्चा करनी है।'
  )}`;

  return (
    <section 
      aria-label="विज्ञापन और समाचार संपर्क"
      className="my-8 sm:my-12 rounded-3xl overflow-hidden border-2 border-red-500/30 dark:border-red-600/40 bg-gradient-to-br from-white via-amber-50/40 to-red-50/60 dark:from-slate-900 dark:via-slate-850 dark:to-red-950/40 shadow-xl transition-all"
    >
      {/* Top Header Strip */}
      <div className="bg-gradient-to-r from-[#c41e24] via-red-700 to-amber-600 text-white px-5 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-black shadow-xs">
            <Megaphone className="w-4 h-4 animate-bounce" />
          </span>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-200">
            कबीरा न्यूज़ आधिकारिक सूचना पटल
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
          <ShieldCheck className="w-4 h-4 text-amber-300" />
          <span>विश्वसनीय • त्वरित • व्यापक कवरेज</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Services */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 mb-2">
                <Award className="w-3.5 h-3.5" />
                समाचार व डिजिटल विज्ञापन मंच
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white font-serif leading-tight">
                विज्ञापन एवं समाचार प्रकाशन हेतु{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-600 dark:from-red-400 dark:to-amber-300">
                  सीधा संपर्क
                </span>
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                कबीरा न्यूज़ के डिजिटल पोर्टल, मोबाइल ऐप, ई-पेपर और सोशल मीडिया नेटवर्क पर अपने व्यापार, राजनीतिक अभियान या जनहित के समाचार को लाखों जागरूक पाठकों तक तुरंत पहुंचाएं।
              </p>
            </div>

            {/* Service Highlights Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">व्यापारिक व ब्रांड विज्ञापन</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">डिजिटल बैनर, स्पॉन्सर्ड आर्टिकल व ब्रांड प्रमोशन</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">चुनावी व राजनीतिक कवरेज</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">प्रेस विज्ञप्ति, जनसंपर्क अभियान व विशेष इंटरव्यू</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">शिक्षा, कोचिंग व रोज़गार</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">प्रवेश सूचना, भर्ती विज्ञापन व रिजल्ट कवरेज</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">जनहित व खोजी समाचार</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">स्थानीय समस्याएं, जनहित मुद्दे व गोपनीय सूचनाएं</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key Person Direct Action Card */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-red-500/40 dark:border-red-500/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/10 dark:bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md">
                  NJ
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 dark:text-red-400">
                    ब्यूरो प्रमुख व विज्ञापन प्रभारी
                  </span>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white font-serif">
                    {CONTACT_PERSON}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    कबीरा न्यूज़ नेटवर्क मुख्यालय
                  </p>
                </div>
              </div>

              {/* Primary Contact Buttons */}
              <div className="space-y-3">
                {/* Call Button */}
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all transform active:scale-98"
                >
                  <Phone className="w-4 h-4 animate-pulse" />
                  <span>सीधे कॉल करें: +91 {CONTACT_PHONE}</span>
                </a>

                {/* WhatsApp Chat Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all transform active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>व्हाट्सएप पर चैट व विज्ञप्ति भेजें</span>
                </a>

                {/* Follow Channel Button */}
                <a
                  href={WHATSAPP_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-amber-400/30 transition-all"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>कबीरा न्यूज़ का WhatsApp चैनल फॉलो करें</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </a>
              </div>

              {/* Address & Email Info */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>प्रेस कॉम्प्लेक्स, एमपी नगर, भोपाल (म.प्र.) 462011</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>contact@kabiranews.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
