import React, { useState } from 'react';
import { Newspaper, X, Printer, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Share2, Phone, ExternalLink, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { NewsArticle } from '../types/news';

interface EPaperModalProps {
  onClose: () => void;
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

const EDITIONS = [
  'भोपाल - मुख्य राज्य संस्करण',
  'इंदौर - मालवा-निमाड़ संस्करण',
  'जबलपुर - महाकौशल संस्करण',
  'ग्वालियर - चंबल संस्करण',
  'नई दिल्ली - राष्ट्रीय संस्करण',
  'लखनऊ - उत्तर प्रदेश संस्करण',
];

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N';

export const EPaperModal: React.FC<EPaperModalProps> = ({ onClose, articles, onSelectArticle }) => {
  const { formatHindiDate } = useLanguage();
  const [selectedEdition, setSelectedEdition] = useState(EDITIONS[0]);
  const [page, setPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  const totalPages = 6;

  // Filter articles according to e-paper pages
  const getPageArticles = (pageNum: number) => {
    switch (pageNum) {
      case 1:
        // Front Page: Breaking or trending + top national stories
        return articles.slice(0, 5);
      case 2:
        // State & Regional (MP / Bhopal / State)
        return articles.filter((a) => a.category === 'state' || a.state === 'मध्य प्रदेश').concat(articles.slice(5, 10)).slice(0, 5);
      case 3:
        // National & Politics
        return articles.filter((a) => a.category === 'national' || a.category === 'politics').concat(articles.slice(10, 15)).slice(0, 5);
      case 4:
        // Sports & Cricket
        return articles.filter((a) => a.category === 'sports').concat(articles.slice(12, 17)).slice(0, 5);
      case 5:
        // Business & Economy
        return articles.filter((a) => a.category === 'business' || a.category === 'tech').concat(articles.slice(7, 12)).slice(0, 5);
      case 6:
        // Entertainment & Health
        return articles.filter((a) => a.category === 'entertainment' || a.category === 'health' || a.category === 'education').concat(articles.slice(15, 20)).slice(0, 5);
      default:
        return articles.slice(0, 5);
    }
  };

  const pageArticles = getPageArticles(page);
  const leadArticle = pageArticles[0] || articles[0];
  const sideArticles = pageArticles.slice(1, 4);
  const bottomArticle = pageArticles[4] || pageArticles[1];

  const getPageTitle = (p: number) => {
    switch (p) {
      case 1: return 'प्रथम पृष्ठ • मुख्य समाचार (Front Page)';
      case 2: return 'पृष्ठ 2 • मध्य प्रदेश व प्रादेशिक हलचल';
      case 3: return 'पृष्ठ 3 • देश-विदेश व राजनीतिक समीक्षा';
      case 4: return 'पृष्ठ 4 • खेल संसार व क्रिकेट विशेष';
      case 5: return 'पृष्ठ 5 • व्यापार, शेयर बाजार व तकनीक';
      case 6: return 'पृष्ठ 6 • सिनेमा, सेहत व संस्कृति';
      default: return `पृष्ठ ${p}`;
    }
  };

  const handleShareEPaperWhatsApp = () => {
    const text = `📰 *कबीरा न्यूज़ (Kabira News) - डिजिटल ई-पेपर अंक*\n` +
      `📅 *दिनांक:* ${formatHindiDate(new Date())}\n` +
      `📍 *संस्करण:* ${selectedEdition} • पृष्ठ ${page}\n\n` +
      `🔥 *प्रमुख मुख्य समाचार:*\n` +
      `"${leadArticle?.title}"\n\n` +
      `📝 *संक्षिप्त विवरण:*\n` +
      `${leadArticle?.summary?.slice(0, 160)}...\n\n` +
      `👉 *दिन भर की हर ताज़ा खबर सीधे पाने के लिए कबीरा न्यूज़ का आधिकारिक WhatsApp चैनल फॉलो करें:*\n` +
      `${WHATSAPP_CHANNEL_URL}\n\n` +
      `📞 *समाचार या विज्ञापन देने हेतु संपर्क:* नितेश जोशी 9893537306`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-5xl h-[94vh] rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c41e24] text-white flex items-center justify-center shadow-xs">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white font-serif flex items-center gap-2">
                <span>कबीरा ई-पेपर (Digital e-Paper)</span>
                <span className="text-[10px] bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-sans font-bold">
                  दैनिक संस्करण
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                {formatHindiDate(new Date())} • {selectedEdition}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edition select */}
            <select
              value={selectedEdition}
              onChange={(e) => setSelectedEdition(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              {EDITIONS.map((ed) => (
                <option key={ed} value={ed}>{ed}</option>
              ))}
            </select>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareEPaperWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
              title="ई-पेपर WhatsApp पर शेयर करें"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp शेयर</span>
            </button>

            {/* WhatsApp Channel */}
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              title="कबीरा न्यूज़ WhatsApp चैनल"
            >
              <span>चैनल फॉलो</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-0.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                className="p-1 text-gray-600 dark:text-gray-300 hover:text-black"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] px-1 font-mono text-gray-500">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(140, z + 15))}
                className="p-1 text-gray-600 dark:text-gray-300 hover:text-black"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download Full 6-Page PDF */}
            <a
              href="/epaper-today.pdf"
              download="Kabira-News-Digital-EPaper.pdf"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-xs"
              title="सम्पूर्ण 6-पेजी ई-पेपर PDF डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF डाउनलोड</span>
            </a>

            {/* Print */}
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="प्रिंट / PDF सेव करें"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Canvas Display */}
        <div className="flex-1 overflow-auto bg-stone-200 dark:bg-stone-950 p-3 sm:p-6 flex justify-center items-start">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-4xl bg-[#fefcf8] text-gray-900 shadow-2xl rounded-xs p-6 sm:p-10 border border-stone-300 transition-transform duration-200 font-serif min-h-[980px]"
          >
            {/* Newspaper Masthead */}
            <div className="text-center border-b-4 border-double border-[#c41e24] pb-3 mb-4">
              <div className="flex justify-between items-center text-xs text-gray-600 border-b border-gray-300 pb-1 mb-2 font-sans font-medium">
                <span>वर्ष 12 • अंक 245 • आर.एन.आई. पंजीकृत</span>
                <span className="font-bold text-red-800">{selectedEdition}</span>
                <span>मूल्य: ₹4.50 • 12 पृष्ठ</span>
              </div>

              <div className="py-2">
                <h1 className="text-5xl sm:text-7xl font-black text-[#c41e24] tracking-tight font-serif leading-none">
                  कबीरा न्यूज़
                </h1>
                <p className="text-xs uppercase tracking-widest font-sans font-bold text-stone-800 mt-1">
                  KABIRA NEWS • निष्पक्ष, निर्भीक, विश्वसनीय डिजिटल समाचार पत्र
                </p>
              </div>

              {/* Classified Bar in Masthead */}
              <div className="bg-amber-100 border border-amber-300 px-3 py-1 text-xs text-amber-900 font-sans font-bold flex justify-between items-center">
                <span>📢 समाचार प्रसारण व विज्ञापन हेतु संपर्क करें: नितेश जोशी 9893537306</span>
                <span>WhatsApp चैनल: bit.ly/kabiranews</span>
              </div>
            </div>

            {/* Page Header Bar */}
            <div className="flex justify-between items-center bg-[#c41e24] text-white px-3 py-1 text-xs font-bold font-sans uppercase mb-6">
              <span>{getPageTitle(page)}</span>
              <span>{formatHindiDate(new Date())}</span>
            </div>

            {/* Newspaper Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-sm">
              {/* Main Column (8 cols) */}
              <div className="md:col-span-8 border-r-0 md:border-r border-stone-300 pr-0 md:pr-5">
                {leadArticle && (
                  <div
                    onClick={() => {
                      onSelectArticle(leadArticle);
                      onClose();
                    }}
                    className="cursor-pointer group mb-6"
                  >
                    <span className="inline-block bg-red-700 text-white text-[10px] font-sans font-bold uppercase px-2 py-0.5 mb-1.5 rounded-xs">
                      {leadArticle.category || 'प्रमुख समाचार'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black leading-snug mb-2 font-serif group-hover:text-red-700 transition">
                      {leadArticle.title}
                    </h2>
                    
                    {/* Lead Image */}
                    <div className="aspect-16/9 bg-stone-200 mb-3 overflow-hidden rounded-xs border border-stone-300">
                      <img
                        src={leadArticle.imageUrl}
                        alt={leadArticle.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                    </div>
                    {leadArticle.imageCaption && (
                      <p className="text-[11px] text-gray-500 italic mb-2 font-sans">
                        {leadArticle.imageCaption}
                      </p>
                    )}
                    
                    <p className="text-justify leading-relaxed text-xs sm:text-sm columns-1 sm:columns-2 gap-4 text-stone-800">
                      {leadArticle.summary || leadArticle.content?.slice(0, 350)}
                    </p>
                    <div className="mt-2 text-xs font-sans text-red-700 font-bold flex items-center gap-1">
                      <span>विस्तृत रिपोर्ट पढ़ें ➔</span>
                    </div>
                  </div>
                )}

                {/* Secondary Bottom Story in Main Column */}
                {bottomArticle && bottomArticle.id !== leadArticle?.id && (
                  <div
                    onClick={() => {
                      onSelectArticle(bottomArticle);
                      onClose();
                    }}
                    className="cursor-pointer pt-4 border-t-2 border-stone-300 group"
                  >
                    <h3 className="font-extrabold text-lg sm:text-xl leading-snug group-hover:text-red-700 font-serif mb-1">
                      {bottomArticle.title}
                    </h3>
                    <p className="text-xs text-stone-700 line-clamp-3 leading-relaxed">
                      {bottomArticle.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Side Column (4 cols) */}
              <div className="md:col-span-4 space-y-4">
                {/* Advertisement / Notice Block */}
                <div className="bg-linear-to-br from-amber-50 to-orange-50 p-3.5 border-2 border-dashed border-amber-400 rounded-xs font-sans">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded-xs">
                      विशेष विज्ञापन
                    </span>
                    <span className="text-[10px] text-stone-500">सत्यापित</span>
                  </div>
                  <h4 className="font-black text-xs text-stone-900 leading-tight">
                    कबीरा न्यूज़ डिजिटल बुलेटिन पर विज्ञापन व प्रेस विज्ञप्ति दें
                  </h4>
                  <p className="text-[11px] text-stone-700 mt-1 leading-snug">
                    लाखों पाठकों तक अपने व्यापार व प्रचार को पहुंचाएं।
                  </p>
                  <div className="mt-2 pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">नितेश जोशी</span>
                    <a
                      href="tel:9893537306"
                      className="font-extrabold text-red-700 flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>9893537306</span>
                    </a>
                  </div>
                </div>

                {/* Side Articles */}
                {sideArticles.map((art, idx) => (
                  <div
                    key={art.id || idx}
                    onClick={() => {
                      onSelectArticle(art);
                      onClose();
                    }}
                    className="p-3 border border-stone-300 rounded-xs bg-white hover:bg-stone-50 cursor-pointer transition shadow-2xs group"
                  >
                    <span className="text-[10px] font-black uppercase text-red-700 font-sans">
                      {art.category || 'संक्षिप्त'} {art.state ? `• ${art.state}` : ''}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm leading-snug mt-1 group-hover:text-red-700 font-serif">
                      {art.title}
                    </h4>
                    {art.imageUrl && (
                      <div className="aspect-16/9 my-2 rounded-xs overflow-hidden bg-stone-100">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                      </div>
                    )}
                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Paper Footer */}
            <div className="mt-8 pt-3 border-t-2 border-stone-800 flex flex-wrap justify-between items-center text-[11px] text-stone-600 font-sans">
              <span>मुद्रक व प्रकाशक: कबीरा डिजिटल मीडिया नेटवर्क प्राइवेट लिमिटेड</span>
              <span>WhatsApp चैनल: https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N</span>
              <span>संपर्क: 9893537306</span>
            </div>
          </div>
        </div>

        {/* Page Switcher Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>पिछला पृष्ठ</span>
            </button>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 px-2">
              पृष्ठ {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span>अगला पृष्ठ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 hidden sm:inline">कबीरा डिजिटल ई-पेपर संस्करण</span>
            <button
              onClick={handleShareEPaperWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>पूरा पेज WhatsApp पर भेजें</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
