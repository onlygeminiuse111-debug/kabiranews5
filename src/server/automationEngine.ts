import { DEFAULT_FEED_SOURCES, fetchFeedItems, NewsFeedSource, RawNewsItem } from './feedIngestion';
import { isDuplicateArticle, registerArticle } from './deduplication';
import { processNewsItemWithGemini, ProcessedNewsResult } from './geminiNewsProcessor';

export interface AutomationLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  sourceName?: string;
  articleTitle?: string;
}

export interface PendingArticleItem {
  id: string;
  rawItem: RawNewsItem;
  processed: ProcessedNewsResult;
  heldAt: string;
}

export interface AutomationState {
  isActive: boolean;
  intervalMinutes: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  totalFetched: number;
  totalAutoPublished: number;
  totalHeldForReview: number;
  totalDuplicatesSkipped: number;
  totalErrors: number;
  sources: NewsFeedSource[];
  logs: AutomationLogEntry[];
  pendingQueue: PendingArticleItem[];
}

// In-memory automation state
const state: AutomationState = {
  isActive: true,
  intervalMinutes: 30, // Every 30 minutes as requested
  lastRunAt: null,
  nextRunAt: null,
  totalFetched: 0,
  totalAutoPublished: 0,
  totalHeldForReview: 0,
  totalDuplicatesSkipped: 0,
  totalErrors: 0,
  sources: [...DEFAULT_FEED_SOURCES],
  logs: [],
  pendingQueue: [],
};

let schedulerTimer: NodeJS.Timeout | null = null;
let isCycleRunning = false;

// Callback to write published articles to database
let onPublishArticleCallback: ((article: any) => Promise<void>) | null = null;

export function setOnPublishArticleCallback(cb: (article: any) => Promise<void>) {
  onPublishArticleCallback = cb;
}

function addLog(type: 'info' | 'success' | 'warning' | 'error', message: string, meta?: { sourceName?: string; articleTitle?: string }) {
  const entry: AutomationLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    type,
    message,
    ...meta,
  };
  state.logs.unshift(entry);
  if (state.logs.length > 200) {
    state.logs.pop();
  }
}

/**
 * Execute a complete news ingestion and publishing cycle
 */
export async function runIngestionCycle(): Promise<{
  fetched: number;
  published: number;
  held: number;
  duplicates: number;
  errors: number;
}> {
  if (isCycleRunning) {
    addLog('warning', 'Ingestion cycle is already running. Skipping concurrent run.');
    return { fetched: 0, published: 0, held: 0, duplicates: 0, errors: 0 };
  }

  isCycleRunning = true;
  state.lastRunAt = new Date().toISOString();
  addLog('info', 'Starting automated news ingestion cycle...');

  let cycleFetched = 0;
  let cyclePublished = 0;
  let cycleHeld = 0;
  let cycleDuplicates = 0;
  let cycleErrors = 0;

  const enabledSources = state.sources.filter((s) => s.enabled);

  for (const source of enabledSources) {
    try {
      addLog('info', `Fetching RSS source: ${source.name}...`, { sourceName: source.name });
      const rawItems = await fetchFeedItems(source, 3);
      cycleFetched += rawItems.length;
      state.totalFetched += rawItems.length;

      for (const item of rawItems) {
        // 1. Deduplication check
        const dupCheck = isDuplicateArticle(item.title, item.link);
        if (dupCheck.isDuplicate) {
          cycleDuplicates++;
          state.totalDuplicatesSkipped++;
          addLog('info', `Duplicate skipped: "${item.title}" (${dupCheck.matchReason})`, {
            sourceName: source.name,
            articleTitle: item.title,
          });
          continue;
        }

        // Pacing delay between Gemini calls to stay strictly within rate limits
        await new Promise((r) => setTimeout(r, 3500));

        // 2. Gemini AI Processing (Hindi rewrite, localization & risk verification)
        addLog('info', `AI Processing with Gemini: "${item.title.slice(0, 50)}..."`, {
          sourceName: source.name,
        });
        const processed = await processNewsItemWithGemini(item);

        if (!processed) {
          cycleErrors++;
          state.totalErrors++;
          addLog('error', `AI processing failed for article: "${item.title}"`, {
            sourceName: source.name,
          });
          continue;
        }

        const articleId = `auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        // 3. Risk & Sensitivity Verification Gate
        if (processed.riskAssessment.decision === 'hold_for_review') {
          cycleHeld++;
          state.totalHeldForReview++;
          const pendingItem: PendingArticleItem = {
            id: articleId,
            rawItem: item,
            processed,
            heldAt: new Date().toISOString(),
          };
          state.pendingQueue.unshift(pendingItem);
          registerArticle(articleId, processed.headlineHi, item.link);

          addLog(
            'warning',
            `HELD FOR REVIEW: "${processed.headlineHi}" (Reason: ${processed.riskAssessment.reason})`,
            { sourceName: source.name, articleTitle: processed.headlineHi }
          );
        } else {
          // 4. Auto-publish verified, low-risk story
          const newsPayload = {
            id: articleId,
            title: processed.headlineHi,
            titleEn: processed.headlineEn,
            slug: processed.slug,
            summary: processed.summaryHi,
            content: processed.contentHi,
            category: processed.category,
            state: processed.state,
            city: processed.city,
            imageUrl: processed.imageUrl,
            imageCaption: processed.imageCaption,
            author: {
              name: 'कबीरा स्वचालित न्यूज़ डेस्क',
              role: 'AI पावर्ड ऑटोमेशन',
              avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=120&q=80',
            },
            source: {
              name: item.sourceName,
              url: item.link,
              originalPubDate: item.pubDate,
            },
            attributionText: `स्रोत: ${item.sourceName} (कबीरा न्यूज़ डेस्क द्वारा सत्यापित व संप्रेषित)`,
            publishedAt: new Date().toISOString(),
            status: 'published',
            isBreaking: processed.isBreaking,
            isTrending: processed.isTrending,
            isHeroHighlight: false,
            views: Math.floor(Math.random() * 400) + 120, // initial views
            tags: processed.tags,
            readingTime: processed.readingTime,
            aiProcessed: processed.processedBy === 'gemini-3.8-flash',
            aiModel: processed.processedBy,
            riskAssessment: processed.riskAssessment,
            fetchedAt: new Date().toISOString(),
          };

          if (onPublishArticleCallback) {
            await onPublishArticleCallback(newsPayload);
          }

          registerArticle(articleId, processed.headlineHi, item.link);
          cyclePublished++;
          state.totalAutoPublished++;

          addLog(
            'success',
            `PUBLISHED LIVE: "${processed.headlineHi}" (${processed.category})`,
            { sourceName: source.name, articleTitle: processed.headlineHi }
          );
        }
      }
    } catch (sourceErr: any) {
      cycleErrors++;
      state.totalErrors++;
      addLog('error', `Error in feed source ${source.name}: ${sourceErr?.message || sourceErr}`);
    }
  }

  isCycleRunning = false;
  state.nextRunAt = new Date(Date.now() + state.intervalMinutes * 60 * 1000).toISOString();

  addLog(
    'success',
    `Cycle finished: ${cycleFetched} fetched, ${cyclePublished} published, ${cycleHeld} held, ${cycleDuplicates} duplicates skipped.`
  );

  return {
    fetched: cycleFetched,
    published: cyclePublished,
    held: cycleHeld,
    duplicates: cycleDuplicates,
    errors: cycleErrors,
  };
}

/**
 * Start 24/7 background scheduler loop
 */
export function startAutomationScheduler(intervalMinutes = 15) {
  state.isActive = true;
  state.intervalMinutes = intervalMinutes;

  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  // Run initial cycle after 5 seconds to populate fresh news
  setTimeout(() => {
    if (state.isActive) {
      runIngestionCycle();
    }
  }, 5000);

  // Run on interval
  schedulerTimer = setInterval(() => {
    if (state.isActive) {
      runIngestionCycle();
    }
  }, intervalMinutes * 60 * 1000);

  state.nextRunAt = new Date(Date.now() + 5000).toISOString();
  addLog('info', `24/7 Background news scheduler activated (Interval: ${intervalMinutes}m).`);
}

/**
 * Emergency Pause / Kill switch
 */
export function stopAutomationScheduler() {
  state.isActive = false;
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  state.nextRunAt = null;
  addLog('warning', 'EMERGENCY PAUSE: Automated news ingestion stopped by administrator.');
}

/**
 * Approve and publish a held story
 */
export async function approveHeldStory(pendingId: string): Promise<boolean> {
  const index = state.pendingQueue.findIndex((p) => p.id === pendingId);
  if (index === -1) return false;

  const item = state.pendingQueue[index];
  state.pendingQueue.splice(index, 1);

  const newsPayload = {
    id: item.id,
    title: item.processed.headlineHi,
    titleEn: item.processed.headlineEn,
    slug: item.processed.slug,
    summary: item.processed.summaryHi,
    content: item.processed.contentHi,
    category: item.processed.category,
    state: item.processed.state,
    city: item.processed.city,
    imageUrl: item.processed.imageUrl,
    imageCaption: item.processed.imageCaption,
    author: {
      name: 'कबीरा संपादक (समीक्षा उपरांत)',
      role: 'वरिष्ठ संपादक द्वारा स्वीकृत',
    },
    source: {
      name: item.rawItem.sourceName,
      url: item.rawItem.link,
      originalPubDate: item.rawItem.pubDate,
    },
    attributionText: `स्रोत: ${item.rawItem.sourceName} (कबीरा न्यूज़ डेस्क द्वारा समीक्षित)`,
    publishedAt: new Date().toISOString(),
    status: 'published',
    isBreaking: item.processed.isBreaking,
    isTrending: item.processed.isTrending,
    isHeroHighlight: false,
    views: 150,
    tags: item.processed.tags,
    readingTime: item.processed.readingTime,
    aiProcessed: true,
    aiModel: 'gemini-3.8-flash',
    reviewedBy: 'Admin',
    reviewedAt: new Date().toISOString(),
  };

  if (onPublishArticleCallback) {
    await onPublishArticleCallback(newsPayload);
  }

  state.totalAutoPublished++;
  addLog('success', `MANUALLY APPROVED & PUBLISHED: "${item.processed.headlineHi}"`);
  return true;
}

/**
 * Reject a held story
 */
export function rejectHeldStory(pendingId: string): boolean {
  const index = state.pendingQueue.findIndex((p) => p.id === pendingId);
  if (index === -1) return false;
  const removed = state.pendingQueue.splice(index, 1)[0];
  addLog('info', `REJECTED & DISCARDED: "${removed.processed.headlineHi}"`);
  return true;
}

export function getAutomationState(): AutomationState {
  return { ...state };
}

export function updateSourceStatus(sourceId: string, enabled: boolean): boolean {
  const src = state.sources.find((s) => s.id === sourceId);
  if (!src) return false;
  src.enabled = enabled;
  addLog('info', `Source "${src.name}" ${enabled ? 'enabled' : 'disabled'}.`);
  return true;
}

export function addCustomSource(newSource: {
  name: string;
  category: string;
  url: string;
  state?: string;
  city?: string;
  language?: 'hi' | 'en';
}): NewsFeedSource {
  const source: NewsFeedSource = {
    id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: newSource.name,
    category: newSource.category,
    url: newSource.url,
    enabled: true,
    language: newSource.language || 'hi',
    priority: 2,
    state: newSource.state,
    city: newSource.city,
  };
  state.sources.push(source);
  addLog('info', `New RSS Source added: "${source.name}" (${source.category})`);
  return source;
}

export function deleteSource(sourceId: string): boolean {
  const idx = state.sources.findIndex((s) => s.id === sourceId);
  if (idx === -1) return false;
  const removed = state.sources.splice(idx, 1)[0];
  addLog('info', `RSS Source deleted: "${removed.name}"`);
  return true;
}

export function updatePublishFrequency(minutes: number): boolean {
  if (minutes < 1 || minutes > 1440) return false;
  state.intervalMinutes = minutes;
  if (state.isActive) {
    startAutomationScheduler(minutes);
  }
  addLog('info', `Publishing frequency updated to every ${minutes} minutes.`);
  return true;
}
