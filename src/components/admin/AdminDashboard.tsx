import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Flame,
  Search,
  RefreshCw,
  LogOut,
  FolderDown,
  Shield,
  FileText,
  Settings,
  Database,
  ExternalLink,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArticleEditorModal } from './ArticleEditorModal';
import { FirebaseRulesView } from './FirebaseRulesView';
import { AutomationRoom } from './AutomationRoom';
import { deleteArticle, saveArticle, seedInitialArticlesToFirestore } from '../../services/newsService';

interface AdminDashboardProps {
  articles: NewsArticle[];
  onRefresh: () => void;
  onClose: () => void;
  onPreviewArticle: (article: NewsArticle) => void;
  onExportZip: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  articles,
  onRefresh,
  onClose,
  onPreviewArticle,
  onExportZip,
}) => {
  const { profile, logout } = useAuth();
  const { formatHindiDate, formatTimeAgo } = useLanguage();

  const [activeTab, setActiveTab] = useState<'articles' | 'automation' | 'whatsapp' | 'rules' | 'settings'>('articles');
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Settings state
  const [siteName, setSiteName] = useState('कबीरा न्यूज़');
  const [tagline, setTagline] = useState('निष्पक्ष • निर्भीक • विश्वसनीय');
  const [breakingTickerActive, setBreakingTickerActive] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Stats calculation
  const totalArticles = articles.length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const breakingCount = articles.filter((a) => a.isBreaking).length;

  // Filtered articles list
  const filteredArticles = articles.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.state && a.state.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDelete = async (articleId: string, title: string) => {
    if (window.confirm(`क्या आप वाकई इस समाचार को हटाना चाहते हैं?\n"${title}"`)) {
      await deleteArticle(articleId);
      onRefresh();
    }
  };

  const handleToggleStatus = async (article: NewsArticle) => {
    const nextStatus = article.status === 'published' ? 'draft' : 'published';
    await saveArticle({ ...article, status: nextStatus });
    onRefresh();
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await seedInitialArticlesToFirestore();
      setSeedMessage(res.message);
      onRefresh();
    } catch (e: any) {
      setSeedMessage('सीडिंग प्रक्रिया में त्रुटि आई: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-950 flex flex-col overflow-hidden">
      {/* 1. Admin Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
            <img src="/icon.svg" alt="Kabira" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white font-serif">
                कबीरा न्यूज़ प्रबंधन डैशबोर्ड
              </h1>
              <span className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {profile?.role || 'Admin'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              लॉग-इन: {profile?.displayName || profile?.email || 'कबीरा मुख्य संपादक'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onExportZip}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
            title="Download full project zip for Vercel"
          >
            <FolderDown className="w-4 h-4" />
            <span>Vercel Code ZIP</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>मुख्य पोर्टल देखें</span>
          </button>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 text-xs font-bold text-gray-700 dark:text-gray-300 transition"
            title="लॉगआउट"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">लॉगआउट</span>
          </button>
        </div>
      </header>

      {/* 2. Main Dashboard Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Seed message notification */}
        {seedMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span>{seedMessage}</span>
            <button onClick={() => setSeedMessage(null)} className="p-1 hover:text-emerald-950">
              ✕
            </button>
          </div>
        )}

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">कुल समाचार (Total)</span>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              {totalArticles}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">लाइव प्रकाशित</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {publishedCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">ड्राफ्ट / अप्रकाशित</span>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
              {draftCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">कुल पाठक व्यूज (Views)</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
              {totalViews.toLocaleString('hi-IN')}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'articles'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>समाचार प्रबंधन ({articles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('automation')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'automation'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>30-मिनट ऑटोमेशन इंजन</span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp चैनल बुलेटिन</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'rules'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>फ़ायरबेस रूल्स</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'settings'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>पोर्टल सेटिंग्स</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition"
              title="फायरस्टोर में 10+ प्रामाणिक हिंदी समाचार लोड करें"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{seeding ? 'लोड हो रहा है...' : 'Seed Data to Firestore'}</span>
            </button>

            <button
              onClick={() => {
                setEditingArticle(null);
                setIsEditorOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>नया समाचार जोड़ें</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Articles Management */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">स्थिति:</span>
                {(['all', 'published', 'draft', 'scheduled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      statusFilter === st
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'all' ? 'सभी' : st === 'published' ? 'लाइव' : st === 'draft' ? 'ड्राफ्ट' : 'शेड्यूल'}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="समाचार खोजें..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Articles Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 uppercase font-bold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="p-3 sm:p-4">तस्वीर व शीर्षक</th>
                      <th className="p-3 sm:p-4">श्रेणी / राज्य</th>
                      <th className="p-3 sm:p-4">संवाददाता</th>
                      <th className="p-3 sm:p-4">व्यूज</th>
                      <th className="p-3 sm:p-4">स्थिति</th>
                      <th className="p-3 sm:p-4 text-right">कार्य (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredArticles.length > 0 ? (
                      filteredArticles.map((article) => (
                        <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                          <td className="p-3 sm:p-4 max-w-sm">
                            <div className="flex items-start gap-3">
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-16 h-12 rounded-lg object-cover shrink-0 border"
                              />
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                                  {article.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {article.isBreaking && (
                                    <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded">
                                      ब्रेकिंग
                                    </span>
                                  )}
                                  {article.isTrending && (
                                    <span className="text-[9px] bg-amber-600 text-white font-extrabold px-1.5 py-0.5 rounded">
                                      ट्रेंडिंग
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-400">
                                    {formatTimeAgo(article.publishedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 sm:p-4 whitespace-nowrap">
                            <span className="font-semibold text-gray-900 dark:text-white block uppercase">
                              {article.category}
                            </span>
                            {article.state && (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400">
                                {article.state} {article.city ? `(${article.city})` : ''}
                              </span>
                            )}
                          </td>

                          <td className="p-3 sm:p-4 whitespace-nowrap">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {article.author?.name || 'संवाददाता'}
                            </span>
                          </td>

                          <td className="p-3 sm:p-4 whitespace-nowrap font-mono font-bold">
                            {article.views.toLocaleString('hi-IN')}
                          </td>

                          <td className="p-3 sm:p-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStatus(article)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 ${
                                article.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : article.status === 'draft'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              }`}
                              title="स्थिति बदलने के लिए क्लिक करें"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              <span>
                                {article.status === 'published'
                                  ? 'प्रकाशित (Live)'
                                  : article.status === 'draft'
                                  ? 'ड्राफ्ट'
                                  : 'शेड्यूल'}
                              </span>
                            </button>
                          </td>

                          <td className="p-3 sm:p-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onPreviewArticle(article)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="देखें (Preview)"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingArticle(article);
                                  setIsEditorOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                title="संपादित करें"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(article.id, article.title)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="हटाएं"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          कोई समाचार नहीं मिला। "नया समाचार जोड़ें" या "Seed Data to Firestore" पर क्लिक करें।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Firebase Rules */}
        {activeTab === 'rules' && <FirebaseRulesView />}

        {/* Tab 3: Portal Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-2xl">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white font-serif mb-4">
              वेबसाइट सेटिंग्स (Firestore Settings)
            </h3>

            {settingsSaved && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 text-xs font-bold">
                ✓ सेटिंग्स सफलतापूर्वक सहेजी गईं!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                  पोर्टल का नाम (Portal Name)
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                  टैगलाइन (Slogan)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={breakingTickerActive}
                    onChange={(e) => setBreakingTickerActive(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600"
                  />
                  <span>ब्रेकिंग न्यूज़ टिकर पट्टी सक्रिय रखें</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs"
                >
                  सेटिंग्स अपडेट करें
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: 30-Minute Automation Room */}
        {activeTab === 'automation' && (
          <AutomationRoom onArticlePublished={onRefresh} />
        )}

        {/* Tab 5: WhatsApp Channel Broadcast Manager */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-linear-to-r from-emerald-800 to-teal-900 text-white shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest font-black bg-white/20 px-2.5 py-1 rounded-md">
                    आधिकारिक WhatsApp चैनल
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-2 font-serif">
                    Kabira News WhatsApp Broadcast Hub
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
                    चैनल फॉलोअर्स तक ई-पेपर बुलेटिन के रूप में ताज़ा समाचार भेजें। नीचे दिए गए बटन से तैयार बुलेटिन को सीधे WhatsApp चैनल पर पोस्ट करें।
                  </p>
                </div>
                <a
                  href="https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm transition shadow-md flex items-center gap-2 whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
                  <span>चैनल खोलें (Open Channel)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Digest Generator Preview */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white font-serif">
                    दैनिक ई-पेपर बुलेटिन (Top 5 Stories Digest)
                  </h4>
                  <p className="text-xs text-gray-500">
                    यह टेक्स्ट स्वतः आज की प्रमुख 5 खबरों और आपके संपर्क विवरण (नितेश जोशी 9893537306) के साथ तैयार है।
                  </p>
                </div>
                <button
                  onClick={() => {
                    const top5 = articles.slice(0, 5);
                    const digest = `📰 *कबीरा न्यूज़ (Kabira News) - ई-पेपर दैनिक बुलेटिन*\n` +
                      `📅 *दिनांक:* ${formatHindiDate(new Date())}\n` +
                      `━━━━━━━━━━━━━━━━━━━\n\n` +
                      top5.map((a, i) => `${i + 1}️⃣ *${a.title}*\n📝 ${a.summary?.slice(0, 110)}...\n🌐 https://kabira-news.vercel.app/?article=${a.id}\n`).join('\n') +
                      `━━━━━━━━━━━━━━━━━━━\n` +
                      `👉 *हर ब्रेकिंग न्यूज़ तुरंत पाने के लिए कबीरा न्यूज़ का आधिकारिक WhatsApp चैनल अभी फॉलो करें:*\n` +
                      `https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N\n\n` +
                      `📞 *समाचार या विज्ञापन देने हेतु संपर्क:* नितेश जोशी - 9893537306`;

                    navigator.clipboard.writeText(digest);
                    alert('ई-पेपर बुलेटिन क्लिपबोर्ड में कॉपी हो गया! अब इसे WhatsApp चैनल में पेस्ट कर दें।');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <span>बुलेटिन कॉपी करें</span>
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-h-72 overflow-y-auto">
{`📰 *कबीरा न्यूज़ (Kabira News) - ई-पेपर दैनिक बुलेटिन*
📅 *दिनांक:* ${formatHindiDate(new Date())}
━━━━━━━━━━━━━━━━━━━

${articles.slice(0, 5).map((a, i) => `${i + 1}️⃣ *${a.title}*\n📝 ${a.summary?.slice(0, 110)}...\n🌐 https://kabira-news.vercel.app/?article=${a.id}`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━
👉 *हर ब्रेकिंग न्यूज़ तुरंत पाने के लिए कबीरा न्यूज़ का आधिकारिक WhatsApp चैनल अभी फॉलो करें:*
https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N

📞 *समाचार या विज्ञापन देने हेतु संपर्क:* नितेश जोशी - 9893537306`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <ArticleEditorModal
          article={editingArticle}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingArticle(null);
          }}
          onSaved={(id) => {
            setIsEditorOpen(false);
            setEditingArticle(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
