import { XMLParser } from 'fast-xml-parser';

export interface NewsFeedSource {
  id: string;
  name: string;
  category: string;
  state?: string;
  city?: string;
  url: string;
  enabled: boolean;
  language: 'hi' | 'en';
  priority: number;
}

export interface RawNewsItem {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content?: string;
  category: string;
  state?: string;
  city?: string;
  imageUrl?: string;
}

// Curated list of legitimate, open RSS news feeds for Indian & MP regional news
export const DEFAULT_FEED_SOURCES: NewsFeedSource[] = [
  {
    id: 'gnews-top-hi',
    name: 'Google News India (हिंदी मुख्य समाचार व ब्रेकिंग)',
    category: 'national',
    url: 'https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi',
    enabled: true,
    language: 'hi',
    priority: 1,
  },
  {
    id: 'gnews-mp-bhopal-hi',
    name: 'मध्य प्रदेश व भोपाल समाचार (MP Regional)',
    category: 'state',
    state: 'मध्य प्रदेश',
    city: 'भोपाल',
    url: 'https://news.google.com/rss/search?q=%E0%A4%AE%E0%A4%A7%E0%A5%8D%E0%A4%AF+%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%A6%E0%A5%87%E0%A4%B6+%E0%A4%AD%E0%A5%8B%E0%A4%AA%E0%A4%BE%E0%A4%B2&hl=hi&gl=IN&ceid=IN:hi',
    enabled: true,
    language: 'hi',
    priority: 1,
  },
  {
    id: 'gnews-politics-hi',
    name: 'राजनीति व संसद समाचार (Politics)',
    category: 'politics',
    url: 'https://news.google.com/rss/search?q=%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%A8%E0%A5%80%E0%A4%A4%E0%A4%BF+%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4&hl=hi&gl=IN&ceid=IN:hi',
    enabled: true,
    language: 'hi',
    priority: 1,
  },
  {
    id: 'gnews-education-hi',
    name: 'शिक्षा, परीक्षा व करियर समाचार (Education)',
    category: 'education',
    url: 'https://news.google.com/rss/search?q=%E0%A4%B6%E0%A4%BF%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%BE+%E0%A4%AA%E0%A4%B0%E0%A5%80%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%BE+%E0%A4%B0%E0%A5%8B%E0%A4%9C%E0%A4%BC%E0%A4%97%E0%A4%BE%E0%A4%B0&hl=hi&gl=IN&ceid=IN:hi',
    enabled: true,
    language: 'hi',
    priority: 2,
  },
  {
    id: 'gnews-sports-hi',
    name: 'खेल व क्रिकेट समाचार (Sports)',
    category: 'sports',
    url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=hi&gl=IN&ceid=IN:hi',
    enabled: true,
    language: 'hi',
    priority: 2,
  },
  {
    id: 'gnews-business-hi',
    name: 'व्यापार व अर्थव्यवस्था (Business & Economy)',
    category: 'business',
    url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=hi&gl=IN&ceid=IN:hi',
    enabled: true,
    language: 'hi',
    priority: 2,
  },
  {
    id: 'gnews-tech-hi',
    name: 'तकनीक व नवाचार (Tech & AI)',
    category: 'tech',
    url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=hi&gl=IN&ceid=IN:hi',
    enabled: true,
    language: 'hi',
    priority: 2,
  },
  {
    id: 'gnews-ent-hi',
    name: 'सिनेमा व मनोरंजन (Entertainment)',
    category: 'entertainment',
    url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=hi&gl=IN&ceid=IN:hi',
    enabled: true,
    language: 'hi',
    priority: 3,
  },
  {
    id: 'gnews-world-hi',
    name: 'अंतरराष्ट्रीय व विश्व समाचार (World / Global)',
    category: 'world',
    url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=hi&gl=IN&ceid=IN:hi',
    enabled: true,
    language: 'hi',
    priority: 3,
  },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
});

/**
 * Fetch and parse a single RSS/Atom feed source
 */
export async function fetchFeedItems(source: NewsFeedSource, limitCount = 10): Promise<RawNewsItem[]> {
  const items: RawNewsItem[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'KabiraNewsBot/1.0 (+https://kabira-news.vercel.app/bot)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Feed fetch failed for ${source.name} status: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    const parsed = parser.parse(xmlText);

    // Support standard RSS 2.0 channel.item or Atom feed.entry
    const rawItems = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
    const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems];

    for (const item of itemArray.slice(0, limitCount)) {
      if (!item) continue;

      const rawTitle = item.title || '';
      const title = cleanHtmlTags(rawTitle);
      const link = typeof item.link === 'string' ? item.link : item.link?.['@_href'] || item.guid?.['#text'] || '';
      const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString();
      const rawDesc = item.description || item.summary || '';
      const rawContent = item['content:encoded'] || item.content || rawDesc;
      const description = cleanHtmlTags(rawDesc);
      const content = cleanHtmlTags(rawContent);

      // Extract image URL from RSS media tags, enclosures, or embedded HTML img
      let extractedImageUrl: string | undefined;

      // 1. Check enclosure tag
      if (item.enclosure && item.enclosure['@_url']) {
        extractedImageUrl = item.enclosure['@_url'];
      }
      // 2. Check media:content or media:thumbnail
      else if (item['media:content'] && item['media:content']['@_url']) {
        extractedImageUrl = item['media:content']['@_url'];
      } else if (item['media:thumbnail'] && item['media:thumbnail']['@_url']) {
        extractedImageUrl = item['media:thumbnail']['@_url'];
      }
      // 3. Fallback: Parse <img> src from raw HTML description or content
      if (!extractedImageUrl) {
        const fullRawHtml = `${rawDesc} ${rawContent}`;
        const imgMatch = fullRawHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1] && imgMatch[1].startsWith('http')) {
          extractedImageUrl = imgMatch[1];
        }
      }

      if (title && link) {
        items.push({
          id: `raw-${Math.abs(hashString(link))}`,
          sourceId: source.id,
          sourceName: source.name,
          title,
          link,
          pubDate,
          description,
          content,
          category: source.category,
          state: source.state,
          city: source.city,
          imageUrl: extractedImageUrl,
        });
      }
    }
  } catch (error: any) {
    console.warn(`Error fetching feed ${source.name}:`, error?.message || error);
  }

  return items;
}

function cleanHtmlTags(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
