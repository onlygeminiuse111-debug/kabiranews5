import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Send, Share2 } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { useLanguage } from '../contexts/LanguageContext';

interface ShareModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ article, onClose }) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  const url = typeof window !== 'undefined' ? `${window.location.origin}/?article=${article.slug}` : '';
  const text = `${article.title} - कबीरा न्यूज़ पर पढ़ें`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToWhatsApp = () => {
    const shareText = `📰 *कबीरा न्यूज़ (Kabira News) - ई-पेपर बुलेटिन*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📍 *${(article.category || 'समाचार').toUpperCase()}* ${article.state ? `• ${article.state}` : ''}\n\n` +
      `🔥 *${article.title}*\n\n` +
      `📝 *मुख्य बिंदु:*\n` +
      `${article.summary || ''}\n\n` +
      `🌐 *पूरी खबर विस्तार से पढ़ें:*\n${url}\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👉 *कबीरा न्यूज़ का आधिकारिक WhatsApp चैनल अभी फॉलो करें:*\n` +
      `https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N\n\n` +
      `📞 *समाचार या विज्ञापन देने के लिए संपर्क:* नितेश जोशी 9893537306`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const shareToTwitter = () => {
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=KabiraNews,HindiNews`;
    window.open(twUrl, '_blank');
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank');
  };

  const shareToTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(tgUrl, '_blank');
  };

  const triggerNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url,
        });
      } catch (err) {
        console.warn('Native share cancelled or failed', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {language === 'hi' ? 'ख़बर शेयर करें' : 'Share Article'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="my-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center gap-3">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-16 h-12 object-cover rounded-lg shrink-0"
          />
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">
            {article.title}
          </p>
        </div>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-4 gap-3 text-center my-5">
          {/* WhatsApp */}
          <button
            onClick={shareToWhatsApp}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/30 transition group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">WhatsApp</span>
          </button>

          {/* Telegram */}
          <button
            onClick={shareToTelegram}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/30 transition group"
          >
            <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <Send className="w-5 h-5 ml-0.5" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Telegram</span>
          </button>

          {/* Twitter / X */}
          <button
            onClick={shareToTwitter}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
          >
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-md group-hover:scale-105 transition font-black">
              𝕏
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Twitter</span>
          </button>

          {/* Facebook */}
          <button
            onClick={shareToFacebook}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition font-bold font-serif text-lg">
              f
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Facebook</span>
          </button>
        </div>

        {/* Copy Link input */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 truncate"
          />
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'कॉपी हुआ!' : 'कॉपी'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
