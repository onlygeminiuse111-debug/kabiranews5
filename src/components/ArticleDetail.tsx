import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Eye,
  Bookmark,
  Share2,
  Printer,
  Copy,
  Check,
  Send,
  MessageSquare,
  Tag,
  ExternalLink,
  MessageCircle,
  Phone,
  Sparkles,
  CheckCircle2,
  Calendar,
  Volume2,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { NewsArticle, CommentItem } from '../types/news';
import { AudioNewsReader } from './AudioNewsReader';
import { ArticleCard } from './ArticleCard';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchComments, addComment, incrementArticleViews } from '../services/newsService';
import { getSmartArticleImage } from '../services/imageMatcher';

interface ArticleDetailProps {
  article: NewsArticle;
  allArticles: NewsArticle[];
  onBack: () => void;
  onSelectArticle: (article: NewsArticle) => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: NewsArticle) => void;
  onShare: (article: NewsArticle, e: React.MouseEvent) => void;
  fontSizeLevel: number;
  onCycleFontSize: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  allArticles,
  onBack,
  onSelectArticle,
  isBookmarked,
  onToggleBookmark,
  onShare,
  fontSizeLevel,
  onCycleFontSize,
}) => {
  const { formatHindiDate, formatTimeAgo, language, t } = useLanguage();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const smartImage = getSmartArticleImage(article);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    incrementArticleViews(article.id);
    fetchComments(article.id).then(setComments);
  }, [article.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newC = await addComment(article.id, commentName || 'पाठक', commentText);
      setComments((prev) => [newC, ...prev]);
      setCommentText('');
      setCommentName('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const copyArticleLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareToWhatsAppAsEPaper = () => {
    const url = window.location.href;
    const text =
      `📰 *कबीरा न्यूज़ (Kabira News) - ई-पेपर बुलेटिन*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📍 *${(article.category || 'समाचार').toUpperCase()}* ${article.state ? `• ${article.state}` : ''} | 🗓️ *${formatHindiDate(article.publishedAt)}*\n\n` +
      `🔥 *${article.title}*\n\n` +
      `📝 *मुख्य बिंदु:*\n` +
      `${article.summary || (article.content ? article.content.slice(0, 160) : '')}...\n\n` +
      `🌐 *पूरी खबर विस्तार से पढ़ें:*\n${url}\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👉 *दिन भर की हर बड़ी खबर सीधे पाने के लिए कबीरा न्यूज़ का आधिकारिक WhatsApp चैनल अभी फॉलो करें:*\n` +
      `https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N\n\n` +
      `📞 *समाचार या विज्ञापन देने के लिए संपर्क:* नितेश जोशी 9893537306`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const fontSizeClass =
    fontSizeLevel === 1
      ? 'text-base sm:text-lg leading-relaxed'
      : fontSizeLevel === 2
      ? 'text-lg sm:text-xl leading-loose'
      : 'text-xl sm:text-2xl leading-loose';

  // 4 Related articles for an attractive 2x2 grid below
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && (a.category === article.category || (a.state && a.state === article.state)))
    .slice(0, 4);

  const getCategoryLabel = () => {
    if (article.category === 'state' && article.state) {
      return `${article.state} ${article.city ? '· ' + article.city : ''}`;
    }
    const map: Record<string, string> = {
      national: 'देश और राजनीति',
      politics: 'राजनीति',
      sports: 'खेल संसार',
      business: 'व्यापार व अर्थव्यवस्था',
      tech: 'तकनीक व विज्ञान',
      entertainment: 'सिनेमा व बॉलीवुड',
      world: 'अंतरराष्ट्रीय',
      health: 'सेहत व जीवनशैली',
      state: 'राज्य समाचार',
      education: 'शिक्षा व करियर',
    };
    return map[article.category] || article.category;
  };

  const renderFormattedContent = (content?: string) => {
    const raw = (content && content.trim()) || (article.summary && article.summary.trim()) || '';
    if (!raw) {
      return (
        <p className={`my-4 text-slate-700 dark:text-slate-300 ${fontSizeClass}`}>
          इस खबर का विस्तृत विवरण शीघ्र उपलब्ध कराया जाएगा।
        </p>
      );
    }
    const paragraphs = raw.split('\n\n');
    return paragraphs.map((para, idx) => {
      if (para.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-8 mb-3 font-serif border-l-4 border-red-600 pl-3"
          >
            {para.replace('### ', '')}
          </h3>
        );
      }
      if (para.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-8 mb-4 font-serif"
          >
            {para.replace('## ', '')}
          </h2>
        );
      }
      if (para.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="my-6 p-4 rounded-xl bg-amber-50/80 dark:bg-slate-800/80 border-l-4 border-amber-500 text-slate-800 dark:text-slate-200 italic font-serif text-base sm:text-lg"
          >
            {para.replace('> ', '')}
          </blockquote>
        );
      }

      // First paragraph with elegant drop cap styling
      if (idx === 0) {
        return (
          <p
            key={idx}
            className={`my-4 text-slate-800 dark:text-slate-200 ${fontSizeClass} first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-black first-letter:text-[#c41e24] first-letter:float-left first-letter:mr-2.5 first-letter:leading-none`}
          >
            {para}
          </p>
        );
      }

      return (
        <p key={idx} className={`my-4 text-slate-800 dark:text-slate-200 ${fontSizeClass}`}>
          {para}
        </p>
      );
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* 1. Top Breadcrumb & Back Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-[#c41e24] hover:text-white hover:border-red-600 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ पर वापस</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#c41e24] dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-200 dark:border-red-900">
            {getCategoryLabel()}
          </span>
          {article.state && (
            <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3 text-red-600" />
              {article.state} {article.city ? `(${article.city})` : ''}
            </span>
          )}
        </div>
      </div>

      {/* 2. Article Header & Monumental Devanagari Title */}
      <div className="space-y-4">
        {article.isBreaking && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>🔴 ताज़ा ब्रेकिंग समाचार</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-slate-900 dark:text-white leading-[1.25] font-serif tracking-tight">
          {article.title}
        </h1>

        {/* Lead Kicker Card */}
        {article.summary && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-slate-900 dark:to-slate-900/60 p-4 sm:p-5 rounded-2xl border-l-4 border-[#c41e24] shadow-xs">
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 font-medium leading-relaxed font-serif">
              {article.summary}
            </p>
          </div>
        )}
      </div>

      {/* 3. Author Byline, Verified Desk & Multi-Action Bar */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {article.author?.avatar ? (
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              क
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                {article.author?.name || 'कबीरा न्यूज़ डेस्क'}
              </p>
              <span title="सत्यापित संपादकीय डेस्क">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{article.author?.role || 'संपादकीय विभाग'}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatHindiDate(article.publishedAt)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Eye className="w-3 h-3 text-red-600" />
                {article.views || 120} व्यूज
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp E-Paper Button */}
          <button
            onClick={shareToWhatsAppAsEPaper}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition transform active:scale-95"
            title="ई-पेपर बुलेटिन के रूप में WhatsApp पर शेयर करें"
          >
            <MessageCircle className="w-4 h-4" />
            <span>ई-पेपर WhatsApp</span>
          </button>

          {/* Follow Channel */}
          <a
            href="https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
          >
            <span>चैनल फॉलो करें</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(article)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-bold transition shadow-xs ${
              isBookmarked
                ? 'bg-[#c41e24] text-white border-red-600'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
            <span>{isBookmarked ? 'सहेजा' : 'सहेजें'}</span>
          </button>

          {/* Native Share */}
          <button
            onClick={(e) => onShare(article, e)}
            className="p-2 rounded-xl bg-[#c41e24] hover:bg-red-700 text-white text-xs font-bold shadow-xs transition"
            title="शेयर करें"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Copy Link */}
          <button
            onClick={copyArticleLink}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
            title="लिंक कॉपी करें"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Font Size Cycle */}
          <button
            onClick={onCycleFontSize}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            title="फ़ॉन्ट आकार बदलें"
          >
            <span className="font-serif">अ</span>
            <span className="text-[10px] text-slate-400">
              {fontSizeLevel === 1 ? '1x' : fontSizeLevel === 2 ? '1.2x' : '1.4x'}
            </span>
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hidden sm:block"
            title="प्रिंट करें"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Audio Reader with Voice Player */}
      <AudioNewsReader
        title={article.title}
        summary={article.summary}
        content={article.content}
      />

      {/* 5. Featured High-Resolution Thematic Image */}
      <figure className="my-6">
        <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-lg border border-slate-200/90 dark:border-slate-800">
          <img
            src={smartImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getSmartArticleImage({
                ...article,
                imageUrl: undefined,
              });
            }}
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent p-4 sm:p-5 flex items-end justify-between">
            <span className="text-white text-xs sm:text-sm font-semibold drop-shadow-md">
              {article.imageCaption || `चित्र: ${getCategoryLabel()} विशेष कवरेज`}
            </span>
            <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
              कबीरा न्यूज़ संदर्भ छायाचित्र
            </span>
          </div>
        </div>
      </figure>

      {/* 6. Formatted Article Body */}
      <div className="mt-8 prose prose-slate dark:prose-invert max-w-none">
        {renderFormattedContent(article.content)}
      </div>

      {/* 7. Source & Verification Attribution Box */}
      {article.source && (
        <div className="my-8 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {article.attributionText || `मूल स्रोत: ${article.source.name}`}
            </span>
          </div>
          {article.source.url && (
            <a
              href={article.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#c41e24] dark:text-red-400 font-bold hover:underline"
            >
              <span>मूल स्रोत देखें</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* 8. Article Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            संबंधित विषय:
          </span>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg font-medium border border-slate-200 dark:border-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 9. Contact & Advertising Callout Banner */}
      <div className="my-8 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-900 border border-amber-300 dark:border-amber-800/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-white">
            <span>📢 समाचार या विज्ञापन देने के लिए संपर्क करें</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            नितेश जोशी - कबीरा न्यूज़ हेड (कॉल अथवा व्हाट्सएप पर तुरंत संपर्क करें)
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:9893537306"
            className="px-4 py-2 rounded-xl bg-[#c41e24] hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition"
          >
            <Phone className="w-4 h-4" />
            <span>9893537306</span>
          </a>
          <a
            href="https://wa.me/919893537306?text=नमस्ते%20नितेश%20जी,%20मुझे%20कबीरा%20न्यूज़%20पर%20समाचार/विज्ञापन%20देना%20है।"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>व्हाट्सएप करें</span>
          </a>
        </div>
      </div>

      {/* 10. WhatsApp Channel Viral Box */}
      <div className="my-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-0.5 rounded-full text-xs font-bold mb-2">
            <span>⭐ आधिकारिक व्हाट्सएप चैनल</span>
          </div>
          <h3 className="font-black text-lg sm:text-xl font-serif">
            कबीरा न्यूज़ के व्हाट्सएप चैनल से तुरंत जुड़ें
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-lg leading-relaxed">
            दिन भर की हर बड़ी ब्रेकिंग ख़बर और दैनिक ई-पेपर बुलेटिन सीधे अपने व्हाट्सएप पर सबसे पहले पाने के लिए आज ही फॉलो करें।
          </p>
        </div>
        <a
          href="https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-sm transition shadow-lg whitespace-nowrap flex items-center gap-2 transform active:scale-95 shrink-0"
        >
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <span>चैनल फॉलो करें</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* 11. Comments Section */}
      <section className="my-10 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-[#c41e24]" />
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
            पाठकों की प्रतिक्रियाएं ({comments.length})
          </h3>
        </div>

        <form
          onSubmit={handleAddComment}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-3.5"
        >
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            अपनी टिप्पणी लिखें (निष्पक्ष विचार व्यक्त करें)
          </h4>
          <input
            type="text"
            value={commentName}
            onChange={(e) => setCommentName(e.target.value)}
            placeholder="आपका नाम और शहर (उदा: राहुल शर्मा, भोपाल)"
            className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
            rows={3}
            placeholder="इस समाचार पर अपने विचार लिखें..."
            className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          ></textarea>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#c41e24] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>{submittingComment ? 'भेजा जा रहा है...' : 'टिप्पणी प्रकाशित करें'}</span>
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {comments.map((comm) => (
            <div
              key={comm.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm shadow-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900 dark:text-white">
                  {comm.userName}
                </span>
                <span className="text-xs text-slate-400">
                  {formatTimeAgo(comm.createdAt)}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                {comm.commentText}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 12. Related News in 2x2 Grid (4 articles) */}
      {relatedArticles.length > 0 && (
        <section className="my-12 pt-8 border-t-2 border-[#c41e24]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-6 bg-[#c41e24] rounded-full"></span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
                संबंधित प्रमुख ख़बरें (2x2 Grid)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">शीर्ष 4 ख़बरें</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {relatedArticles.map((relArt) => (
              <ArticleCard
                key={relArt.id}
                article={relArt}
                variant="grid"
                onSelect={onSelectArticle}
                isBookmarked={isBookmarked}
                onToggleBookmark={onToggleBookmark}
                onShare={onShare}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
