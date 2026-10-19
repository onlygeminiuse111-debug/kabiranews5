/**
 * Deduplication Engine for Kabira News
 * Compares incoming news articles against recently processed articles
 * using URL matching, slug similarity, and token-based Jaccard similarity.
 */

export interface ArticleFingerprint {
  id: string;
  title: string;
  url?: string;
  normalizedTokens: Set<string>;
  publishedAt: string;
}

// In-memory cache of recent article fingerprints (last 500 articles / ~7 days)
const recentFingerprints: ArticleFingerprint[] = [];
const processedUrls = new Set<string>();

/**
 * Tokenize and normalize text into clean Hindi / English words
 */
function tokenize(text: string): Set<string> {
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .trim();
  const tokens = clean.split(/\s+/).filter((t) => t.length > 2);
  return new Set(tokens);
}

/**
 * Calculate Jaccard similarity between two token sets (0.0 to 1.0)
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Check if an incoming article is a duplicate or near-duplicate
 */
export function isDuplicateArticle(
  title: string,
  url?: string
): { isDuplicate: boolean; matchReason?: string; matchingArticleTitle?: string } {
  // 1. Direct URL match
  if (url && processedUrls.has(url)) {
    return { isDuplicate: true, matchReason: 'Exact URL already processed' };
  }

  const incomingTokens = tokenize(title);

  // 2. Token overlap similarity against recent items
  for (const item of recentFingerprints) {
    const similarity = jaccardSimilarity(incomingTokens, item.normalizedTokens);
    if (similarity >= 0.6) {
      return {
        isDuplicate: true,
        matchReason: `Near-duplicate detected (${Math.round(similarity * 100)}% content similarity)`,
        matchingArticleTitle: item.title,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Register an article into the deduplication cache
 */
export function registerArticle(id: string, title: string, url?: string, publishedAt?: string): void {
  if (url) {
    processedUrls.add(url);
  }

  recentFingerprints.unshift({
    id,
    title,
    url,
    normalizedTokens: tokenize(title),
    publishedAt: publishedAt || new Date().toISOString(),
  });

  // Keep cache bounded to 500 items
  if (recentFingerprints.length > 500) {
    const removed = recentFingerprints.pop();
    if (removed?.url) {
      processedUrls.delete(removed.url);
    }
  }
}

/**
 * Pre-populate deduplication index with existing Firestore articles
 */
export function seedDeduplicationIndex(articles: { id: string; title: string; source?: { url?: string } }[]): void {
  for (const art of articles) {
    registerArticle(art.id, art.title, art.source?.url);
  }
}
