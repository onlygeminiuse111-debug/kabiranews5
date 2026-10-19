import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Radio,
  ExternalLink,
  Eye,
  Check,
  X,
  FileText,
  ListFilter,
  Zap,
  Plus,
  Trash2,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AutomationRoomProps {
  onArticlePublished?: () => void;
}

export const AutomationRoom: React.FC<AutomationRoomProps> = ({ onArticlePublished }) => {
  const { language, formatTimeAgo } = useLanguage();
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningNow, setRunningNow] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'sources' | 'config' | 'logs'>('pending');

  // New source form state
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('national');
  const [newSourceState, setNewSourceState] = useState('');
  const [newSourceCity, setNewSourceCity] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/automation/status');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStatusData(json.data);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch automation status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll status every 10s
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (active: boolean) => {
    try {
      const res = await fetch('/api/automation/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active, intervalMinutes: statusData?.intervalMinutes || 15 }),
      });
      if (res.ok) {
        const json = await res.json();
        setStatusData(json.data);
        setActionMessage(active ? '24/7 ऑटोमेशन सक्रिय किया गया!' : 'आपातकालीन ठहराव लागू किया गया!');
      }
    } catch (err: any) {
      setActionMessage('स्थिति बदलने में त्रुटि: ' + err.message);
    }
  };

  const handleUpdateFrequency = async (minutes: number) => {
    try {
      const res = await fetch('/api/automation/frequency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes }),
      });
      if (res.ok) {
        setActionMessage(`प्रकाशन आवृत्ति सफलतापूर्वक प्रत्येक ${minutes} मिनट पर सेट की गई!`);
        fetchStatus();
      }
    } catch (err: any) {
      setActionMessage('आवृत्ति बदलने में त्रुटि: ' + err.message);
    }
  };

  const handleRunNow = async () => {
    setRunningNow(true);
    setActionMessage('ताज़ा समाचार संग्रहण व AI प्रोसेसिंग शुरू की जा रही है...');
    try {
      const res = await fetch('/api/automation/run-now', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setActionMessage(
          `सफलतापूर्वक संपन्न: ${data.fetched} समाचार खोजे गए, ${data.published} सीधे प्रकाशित हुए, ${data.held} समीक्षा हेतु रखे गए, ${data.duplicates} डुप्लीकेट छोड़े गए।`
        );
        fetchStatus();
        if (onArticlePublished) onArticlePublished();
      }
    } catch (err: any) {
      setActionMessage('साइकिल चलाने में त्रुटि: ' + err.message);
    } finally {
      setRunningNow(false);
    }
  };

  const handleToggleSource = async (sourceId: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/automation/sources/${sourceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (e) {
      console.warn('Source toggle error:', e);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;

    try {
      const res = await fetch('/api/automation/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSourceName.trim(),
          url: newSourceUrl.trim(),
          category: newSourceCategory,
          state: newSourceState.trim() || undefined,
          city: newSourceCity.trim() || undefined,
        }),
      });
      if (res.ok) {
        setActionMessage(`नया स्रोत "${newSourceName}" सफलतापूर्वक जोड़ा गया!`);
        setShowAddSource(false);
        setNewSourceName('');
        setNewSourceUrl('');
        setNewSourceState('');
        setNewSourceCity('');
        fetchStatus();
      }
    } catch (err: any) {
      setActionMessage('स्रोत जोड़ने में त्रुटि: ' + err.message);
    }
  };

  const handleDeleteSource = async (sourceId: string, sourceName: string) => {
    if (!confirm(`क्या आप स्रोत "${sourceName}" को हटाना चाहते हैं?`)) return;
    try {
      const res = await fetch(`/api/automation/sources/${sourceId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActionMessage(`स्रोत "${sourceName}" हटाया गया।`);
        fetchStatus();
      }
    } catch (err: any) {
      setActionMessage('स्रोत हटाने में त्रुटि: ' + err.message);
    }
  };

  const handleReviewAction = async (pendingId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/automation/review/${pendingId}/${action}`, {
        method: 'POST',
      });
      if (res.ok) {
        setActionMessage(
          action === 'approve'
            ? 'समाचार स्वीकृत कर पोर्टल पर लाइव कर दिया गया!'
            : 'समाचार अस्वीकृत कर हटा दिया गया।'
        );
        fetchStatus();
        if (action === 'approve' && onArticlePublished) {
          onArticlePublished();
        }
      }
    } catch (err: any) {
      setActionMessage('समीक्षा कार्रवाई में त्रुटि: ' + err.message);
    }
  };

  const isActive = statusData?.isActive ?? true;
  const intervalMinutes = statusData?.intervalMinutes || 15;
  const pendingQueue = statusData?.pendingQueue || [];
  const sources = statusData?.sources || [];
  const logs = statusData?.logs || [];

  return (
    <div className="space-y-6">
      {/* 1. Master Automation Status Ribbon */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isActive
            ? 'bg-gradient-to-r from-emerald-950/40 via-gray-900 to-gray-900 border-emerald-600/40'
            : 'bg-gradient-to-r from-rose-950/40 via-gray-900 to-gray-900 border-rose-600/40'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                isActive ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              <Cpu className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white font-serif">
                  कबीरा 24/7 AI ऑटोमेशन न्यूज़ इंजन
                </h3>
                <span
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                    }`}
                  ></span>
                  <span>{isActive ? '24/7 सक्रिय (Running)' : 'आपातकालीन रोक (Paused)'}</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                विश्वसनीय RSS स्रोतों से ऑटो-कलेक्शन • जेमिनी 3.8 फ़्लैश द्वारा देवनागरी अनुवाद • कॉपीराइट व संवेदनशीलता सुरक्षा
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunNow}
              disabled={runningNow}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningNow ? 'animate-spin' : ''}`} />
              <span>{runningNow ? 'प्रोसेसिंग जारी...' : '⚡ Run Ingestion Now'}</span>
            </button>

            <button
              onClick={() => handleToggle(!isActive)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
                isActive
                  ? 'bg-gray-800 hover:bg-rose-950 text-rose-300 border-rose-800/80'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
              }`}
            >
              {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isActive ? 'आपातकालीन रोक (Pause)' : 'पुनः चालू करें (Resume)'}</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-4 p-3 rounded-xl bg-gray-800/90 text-yellow-300 border border-yellow-500/30 text-xs font-medium flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="p-1 text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 2. Automated Engine KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#16191f] border border-gray-200/90 dark:border-gray-800/90">
          <span className="text-[11px] font-bold text-gray-500 uppercase">कुल एकत्रित (Fetched)</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {statusData?.totalFetched || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#16191f] border border-gray-200/90 dark:border-gray-800/90">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">स्वतः प्रकाशित (Live)</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {statusData?.totalAutoPublished || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#16191f] border border-gray-200/90 dark:border-gray-800/90">
          <span className="text-[11px] font-bold text-amber-600 uppercase">समीक्षा लंबित (Held)</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {pendingQueue.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#16191f] border border-gray-200/90 dark:border-gray-800/90">
          <span className="text-[11px] font-bold text-blue-600 uppercase">डुप्लीकेट रोके गए</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {statusData?.totalDuplicatesSkipped || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#16191f] border border-gray-200/90 dark:border-gray-800/90 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase">आवृत्ति (Frequency)</span>
          <div className="mt-1 flex items-center gap-1">
            <select
              value={intervalMinutes}
              onChange={(e) => handleUpdateFrequency(Number(e.target.value))}
              className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-2 py-1 border border-gray-300 dark:border-gray-700"
            >
              <option value={15}>प्रत्येक 15 मिनट</option>
              <option value={30}>प्रत्येक 30 मिनट (सक्रिय मानक)</option>
              <option value={60}>प्रत्येक 60 मिनट</option>
            </select>
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">
            {statusData?.lastRunAt ? `अंतिम: ${formatTimeAgo(statusData.lastRunAt)}` : 'शेड्यूलर तैयार'}
          </span>
        </div>
      </div>

      {/* 3. Sub-tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeSubTab === 'pending'
              ? 'bg-[#c41e24] text-white shadow-xs'
              : 'bg-white dark:bg-[#16191f] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>संवेदनशील समीक्षा कतार ({pendingQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sources')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeSubTab === 'sources'
              ? 'bg-[#c41e24] text-white shadow-xs'
              : 'bg-white dark:bg-[#16191f] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>सक्रिय RSS स्रोत ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeSubTab === 'config'
              ? 'bg-[#c41e24] text-white shadow-xs'
              : 'bg-white dark:bg-[#16191f] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>AI मॉडल व सुरक्षा विन्यास</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeSubTab === 'logs'
              ? 'bg-[#c41e24] text-white shadow-xs'
              : 'bg-white dark:bg-[#16191f] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>लाइव सिस्टम लॉग्स</span>
        </button>
      </div>

      {/* Sub-tab 1: Pending Review Queue */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">संपादकीय सुरक्षा जांच (Editorial Safety Gate)</p>
              <p className="mt-0.5 leading-relaxed">
                अपराध आरोप, सांप्रदायिक तनाव, चुनावी दावे अथवा अपुष्ट ब्रेकिंग न्यूज़ जैसे संवेदनशील विषयों की ख़बरों को जेमिनी एआई स्वतः लाइव नहीं करता। वरिष्ठ संपादक द्वारा समीक्षा के बाद ही इन्हें स्वीकृत किया जा सकता है।
              </p>
            </div>
          </div>

          {pendingQueue.length > 0 ? (
            <div className="space-y-3">
              {pendingQueue.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#16191f] border border-gray-200/90 dark:border-gray-800/90 shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                        {item.processed.category}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        मूल स्रोत: {item.rawItem.sourceName}
                      </span>
                    </div>
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900">
                      रोक का कारण: {item.processed.riskAssessment?.reason || 'संवेदनशील विषय'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-serif">
                      {item.processed.headlineHi}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {item.processed.summaryHi}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <a
                      href={item.rawItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>मूल लिंक देखें</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReviewAction(item.id, 'reject')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 text-gray-700 dark:text-gray-300"
                      >
                        <X className="w-3.5 h-3.5 text-rose-500" />
                        <span>अस्वीकार करें</span>
                      </button>

                      <button
                        onClick={() => handleReviewAction(item.id, 'approve')}
                        className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>स्वीकार व लाइव करें</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 bg-white dark:bg-[#16191f] rounded-2xl border border-dashed border-gray-300 dark:border-gray-800">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                समीक्षा कतार बिल्कुल खाली है!
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                सभी कम जोखिम वाले समाचार स्वतः लाइव हो रहे हैं।
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Feed Sources Management */}
      {activeSubTab === 'sources' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#16191f] rounded-2xl border border-gray-200/90 dark:border-gray-800/90 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  अधिकृत एवं कानूनी RSS समाचार स्रोत ({sources.length})
                </h4>
                <span className="text-xs text-gray-500">प्रत्येक {intervalMinutes} मिनट पर स्वचालित पोलिंग</span>
              </div>

              <button
                onClick={() => setShowAddSource(!showAddSource)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c41e24] text-white text-xs font-bold hover:bg-red-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddSource ? 'रद्द करें' : 'नया स्रोत जोड़ें'}</span>
              </button>
            </div>

            {/* Add Source Form */}
            {showAddSource && (
              <form onSubmit={handleAddSource} className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 space-y-3">
                <h5 className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                  नया कानूनी RSS समाचार फ़ीड विन्यास
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">फ़ीड नाम</label>
                    <input
                      type="text"
                      placeholder="e.g. दैनिक जागरण भोपाल या पीटीआई न्यूज़"
                      value={newSourceName}
                      onChange={(e) => setNewSourceName(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">RSS/Atom URL</label>
                    <input
                      type="url"
                      placeholder="https://example.com/rss/news.xml"
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">श्रेणी (Category)</label>
                    <select
                      value={newSourceCategory}
                      onChange={(e) => setNewSourceCategory(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="national">देश (National)</option>
                      <option value="state">राज्य-शहर (State/City)</option>
                      <option value="politics">राजनीति (Politics)</option>
                      <option value="education">शिक्षा (Education)</option>
                      <option value="sports">खेल (Sports)</option>
                      <option value="business">व्यापार (Business)</option>
                      <option value="tech">तकनीक (Tech)</option>
                      <option value="entertainment">मनोरंजन (Entertainment)</option>
                      <option value="world">विदेश (World)</option>
                      <option value="health">सेहत (Health)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">राज्य (ऐच्छिक)</label>
                      <input
                        type="text"
                        placeholder="e.g. मध्य प्रदेश"
                        value={newSourceState}
                        onChange={(e) => setNewSourceState(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">शहर (ऐच्छिक)</label>
                      <input
                        type="text"
                        placeholder="e.g. भोपाल"
                        value={newSourceCity}
                        onChange={(e) => setNewSourceCity(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSource(false)}
                    className="px-3 py-1.5 text-xs rounded-lg text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    सहेजें व फ़ीड चालू करें
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {sources.map((src: any) => (
                <div key={src.id} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {src.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                        {src.category} {src.state ? `• ${src.state}` : ''} {src.city ? `(${src.city})` : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono truncate max-w-lg mt-0.5">
                      {src.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-gray-500">{src.enabled ? 'सक्रिय' : 'बंद'}</span>
                      <input
                        type="checkbox"
                        checked={src.enabled}
                        onChange={(e) => handleToggleSource(src.id, e.target.checked)}
                        className="w-5 h-5 text-emerald-600 rounded"
                      />
                    </label>

                    {src.id.startsWith('src-') && (
                      <button
                        onClick={() => handleDeleteSource(src.id, src.name)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                        title="स्रोत हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: AI Model & Security Configuration */}
      {activeSubTab === 'config' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#16191f] border border-gray-200/90 dark:border-gray-800/90 space-y-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <h4 className="font-bold text-base text-gray-900 dark:text-white">
                  AI मॉडल आर्किटेक्चर एवं सुरक्षा मानक (Security & Ethics Safeguards)
                </h4>
                <p className="text-xs text-gray-500">
                  कबीरा न्यूज़ पूर्णतः सुरक्षित, सर्वर-साइड जेमिनी 3.8 फ़्लैश द्वारा संचालित है।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <span className="text-[11px] font-bold text-gray-500 uppercase">एआई मॉडल (AI Model)</span>
                <p className="text-base font-black text-gray-900 dark:text-white mt-1">
                  Gemini 3.8 Flash
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  नवीनतम @google/genai SDK द्वारा सर्वर-साइड सुरक्षित कॉल। तापमान 0.2 पर नियंत्रित (उच्चतम तथ्यात्मक सत्यता)।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <span className="text-[11px] font-bold text-emerald-600 uppercase">एपीआई की सुरक्षा (API Key)</span>
                <p className="text-base font-black text-emerald-600 mt-1">
                  Server Protected Secrets
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  GEMINI_API_KEY कभी भी ब्राउज़र में नहीं भेजी जाती। बैकएंड प्रॉक्सी व क्लाउड रन परिवेश में सुरक्षित रखी गई है।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <span className="text-[11px] font-bold text-purple-600 uppercase">कॉपीराइट व निष्पक्ष उपयोग</span>
                <p className="text-base font-black text-purple-600 mt-1">
                  Zero Verbatim Copying
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  मूल तथ्यों को समझकर 100% मौलिक शुद्ध हिंदी (देवनागरी) में पुनर्लेखन। स्रोत का स्पष्ट श्रेय (Attribution) अनिवार्य।
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-xs text-gray-700 dark:text-gray-300 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>संवेदनशील विषय अवरोध नीति (Strict Risk Gating Policy)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>सांप्रदायिक व धार्मिक तनाव से जुड़ी ख़बरें कभी स्वतः लाइव नहीं की जातीं।</li>
                <li>जीवित व्यक्तियों पर अपराध के असत्यापित आरोप समीक्षा कतार में रोके जाते हैं।</li>
                <li>चुनावी धोखाधड़ी के दावे व स्वास्थ्य आपदा अफवाहों पर सख्त संपादकीय नियंत्रण है।</li>
                <li>कम जोखिम वाले समाचार (खेल, व्यापार, अंतरिक्ष, विज्ञान, मेट्रो, सरकारी आदेश) 24/7 स्वतः लाइव होते हैं।</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Realtime Audit Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-gray-950 rounded-2xl border border-gray-800 p-4 font-mono text-xs text-gray-300 max-h-96 overflow-y-auto space-y-2">
          {logs.length > 0 ? (
            logs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-2.5 pb-2 border-b border-gray-900 last:border-none">
                <span className="text-gray-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold uppercase text-[10px] shrink-0 ${
                    log.type === 'success'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : log.type === 'warning'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : log.type === 'error'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}
                >
                  {log.type}
                </span>
                <span className="flex-1 text-gray-200">
                  {log.message}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 py-6 text-center">कोई लॉग्स उपलब्ध नहीं हैं।</p>
          )}
        </div>
      )}
    </div>
  );
};
