import React, { useState } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Save,
  Clock,
  Sparkles,
  Zap,
  Flame,
  Check,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { NewsArticle, NewsCategory } from '../../types/news';
import { CATEGORIES, INDIAN_STATES, POPULAR_CITIES } from '../../data/categories';
import { saveArticle, uploadImageToStorage } from '../../services/newsService';
import { useAuth } from '../../contexts/AuthContext';

interface ArticleEditorModalProps {
  article?: NewsArticle | null;
  onClose: () => void;
  onSaved: (articleId: string) => void;
}

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  article,
  onClose,
  onSaved,
}) => {
  const { profile } = useAuth();
  const isEditing = Boolean(article);

  const [title, setTitle] = useState(article?.title || '');
  const [titleEn, setTitleEn] = useState(article?.titleEn || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [summary, setSummary] = useState(article?.summary || '');
  const [content, setContent] = useState(article?.content || '');
  const [category, setCategory] = useState<NewsCategory>(article?.category || 'national');
  const [state, setState] = useState(article?.state || '');
  const [city, setCity] = useState(article?.city || '');
  const [imageUrl, setImageUrl] = useState(
    article?.imageUrl ||
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80'
  );
  const [imageCaption, setImageCaption] = useState(article?.imageCaption || '');
  const [authorName, setAuthorName] = useState(
    article?.author?.name || profile?.displayName || 'कबीरा विशेष संवाददाता'
  );
  const [authorRole, setAuthorRole] = useState(article?.author?.role || 'संपादकीय विभाग');
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled'>(
    article?.status || 'published'
  );
  const [scheduledAt, setScheduledAt] = useState(article?.scheduledAt || '');
  const [isBreaking, setIsBreaking] = useState(article?.isBreaking || false);
  const [isTrending, setIsTrending] = useState(article?.isTrending || false);
  const [isHeroHighlight, setIsHeroHighlight] = useState(article?.isHeroHighlight || false);
  const [tagsInput, setTagsInput] = useState(article?.tags ? article.tags.join(', ') : 'ताज़ा ख़बर, कबीरा न्यूज़');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug when typing title if not editing
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .slice(0, 50);
      setSlug(generated || `kabira-news-${Date.now()}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const downloadUrl = await uploadImageToStorage(file);
      setImageUrl(downloadUrl);
    } catch (err: any) {
      console.warn('Image upload error:', err);
      setError('तस्वीर अपलोड में समस्या आई। आप सीधा इमेज URL भी पेस्ट कर सकते हैं।');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) {
      setError('कृपया शीर्षक, संक्षिप्त विवरण (Summary) और मुख्य सामग्री दर्ज करें।');
      return;
    }

    setSaving(true);
    setError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    try {
      const savedId = await saveArticle({
        id: article?.id,
        title: title.trim(),
        titleEn: titleEn.trim() || undefined,
        slug: slug.trim() || `news-${Date.now()}`,
        summary: summary.trim(),
        content: content.trim(),
        category,
        state: category === 'state' ? state || 'मध्य प्रदेश' : state || undefined,
        city: city || undefined,
        imageUrl: imageUrl.trim(),
        imageCaption: imageCaption.trim() || undefined,
        author: {
          name: authorName.trim(),
          role: authorRole.trim(),
        },
        status,
        scheduledAt: status === 'scheduled' ? scheduledAt : undefined,
        isBreaking,
        isTrending,
        isHeroHighlight,
        tags,
      });

      onSaved(savedId);
    } catch (err: any) {
      console.error('Save article error:', err);
      setError('लेख सुरक्षित करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setSaving(false);
    }
  };

  const availableCities = state ? POPULAR_CITIES[state] || [] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-4xl max-h-[94vh] rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-950">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white font-serif">
              {isEditing ? 'समाचार संपादित करें (Edit Article)' : 'नया समाचार प्रकाशित करें (Create Article)'}
            </h3>
            <p className="text-xs text-gray-500">
              फ़ायरबेस फायरस्टोर और स्टोरेज से सीधे जुड़ा हुआ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* 1. Title (Hindi) */}
          <div>
            <label className="block font-bold text-gray-900 dark:text-white mb-1">
              मुख्य शीर्षक (Hindi Headline) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="उदा: इसरो के चंद्रयान-4 मिशन को कैबिनेट की मंजूरी, नमूने लाएगा धरती पर..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
            />
          </div>

          {/* English title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                अंग्रेजी शीर्षक (English Headline - Optional)
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. ISRO Chandrayaan 4 Mission Approved..."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                यूआरएल स्लग (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="isro-chandrayaan-4-mission-approved"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* 2. Category, State & City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                श्रेणी (Category) <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NewsCategory)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none font-semibold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameHi} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                राज्य (State - राज्य समाचार हेतु)
              </label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCity('');
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="">कोई राज्य नहीं (राष्ट्रीय)</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                शहर / जिला (City)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="उदा: भोपाल, लखनऊ, वाराणसी"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Flags: Breaking, Trending, Hero Highlight */}
          <div className="flex flex-wrap items-center gap-4 py-2 border-y border-gray-200 dark:border-gray-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <span className="flex items-center gap-1 font-bold text-red-600 dark:text-red-400">
                <Zap className="w-3.5 h-3.5 fill-red-600" /> ब्रेकिंग न्यूज़ (Ticker Alert)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-600" /> ट्रेंडिंग न्यूज़
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isHeroHighlight}
                onChange={(e) => setIsHeroHighlight(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-3.5 h-3.5 fill-purple-600" /> मुख्य पृष्ठ की सबसे बड़ी स्टोरी (Hero)
              </span>
            </label>
          </div>

          {/* 4. Cover Image URL & Firebase Storage Upload */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-900 dark:text-white">
              कवर तस्वीर (Cover Image) <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-8">
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100 transition font-semibold text-xs text-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'अपलोड हो रहा है...' : 'फाइल अपलोड (Storage)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>

            {/* Live Image Preview */}
            {imageUrl && (
              <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-20 h-14 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="तस्वीर का विवरण / कैप्शन (उदा: प्रतीकात्मक चित्र / फ़ोटो साभार: इसरो)"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Summary / Excerpt */}
          <div>
            <label className="block font-bold text-gray-900 dark:text-white mb-1">
              संक्षिप्त विवरण (Summary / Lead Paragraph) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="2-3 वाक्यों में समाचार का मुख्य सार लिखें जो कार्ड और सोशल मीडिया पर दिखेगा..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            ></textarea>
          </div>

          {/* 6. Full Article Content */}
          <div>
            <label className="block font-bold text-gray-900 dark:text-white mb-1">
              विस्तृत समाचार सामग्री (Full Article Content) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1.5">
              सुझाव: हेडिंग के लिए <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">### उप-शीर्षक</code> और बुलेट पॉइंट्स के लिए <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">- बिंदु</code> का उपयोग कर सकते हैं।
            </p>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="यहाँ पूरा समाचार लिखें..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-sans leading-relaxed"
            ></textarea>
          </div>

          {/* 7. Author and Publication Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-gray-800">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                संवाददाता का नाम (Author)
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="समीर चतुर्वेदी"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                स्थिति (Publish Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none font-semibold"
              >
                <option value="published">प्रकाशित (Published Live)</option>
                <option value="draft">ड्राफ्ट (Draft - अप्रकाशित)</option>
                <option value="scheduled">शेड्यूल (Scheduled)</option>
              </select>
            </div>

            {status === 'scheduled' && (
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  शेड्यूल समय (Schedule Date)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* 8. Tags */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              कीवर्ड्स व टैग्स (Tags - अल्पविराम / Comma से अलग करें)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ISRO, Chandrayaan4, Science, Space"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 font-semibold transition"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'सुरक्षित हो रहा है...' : isEditing ? 'अपडेट सुरक्षित करें' : 'समाचार लाइव करें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
