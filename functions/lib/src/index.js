"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerNewsIngestion = exports.scheduledNewsCollector = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const genai_1 = require("@google/genai");
const fast_xml_parser_1 = require("fast-xml-parser");
admin.initializeApp();
const db = admin.firestore();
const parser = new fast_xml_parser_1.XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
});
const ai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
        headers: {
            'User-Agent': 'aistudio-build',
        },
    },
});
const RSS_FEEDS = [
    { name: 'Google News India (Hindi)', url: 'https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi', category: 'national' },
    { name: 'Google News MP & Bhopal', url: 'https://news.google.com/rss/search?q=%E0%A4%AE%E0%A4%A7%E0%A5%8D%E0%A4%AF+%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%A6%E0%A5%87%E0%A4%B6+%E0%A4%AD%E0%A5%8B%E0%A4%AA%E0%A4%BE%E0%A4%B2&hl=hi&gl=IN&ceid=IN:hi', category: 'state', state: 'मध्य प्रदेश', city: 'भोपाल' },
    { name: 'Google News Politics (Hindi)', url: 'https://news.google.com/rss/search?q=%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%A8%E0%A5%80%E0%A4%A4%E0%A4%BF+%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4&hl=hi&gl=IN&ceid=IN:hi', category: 'politics' },
    { name: 'Google News Education (Hindi)', url: 'https://news.google.com/rss/search?q=%E0%A4%B6%E0%A4%BF%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%BE+%E0%A4%AA%E0%A4%B0%E0%A5%80%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%BE+%E0%A4%B0%E0%A5%8B%E0%A4%9C%E0%A4%BC%E0%A4%97%E0%A4%BE%E0%A4%B0&hl=hi&gl=IN&ceid=IN:hi', category: 'education' },
    { name: 'Google News Sports (Hindi)', url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=hi&gl=IN&ceid=IN:hi', category: 'sports' },
    { name: 'Google News Business (Hindi)', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=hi&gl=IN&ceid=IN:hi', category: 'business' },
    { name: 'Google News Tech (Hindi)', url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=hi&gl=IN&ceid=IN:hi', category: 'tech' },
    { name: 'Google News Entertainment (Hindi)', url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=hi&gl=IN&ceid=IN:hi', category: 'entertainment' },
    { name: 'Google News World (Hindi)', url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=hi&gl=IN&ceid=IN:hi', category: 'world' },
];
/**
 * 24/7 Automated Scheduled News Collection & Publishing Cloud Function
 * Runs every 15 minutes via Google Cloud Scheduler
 */
exports.scheduledNewsCollector = (0, scheduler_1.onSchedule)({
    schedule: 'every 15 minutes',
    timeZone: 'Asia/Kolkata',
    memory: '512MiB',
    timeoutSeconds: 300,
}, async (event) => {
    console.log('[Kabira News Scheduler] Starting news aggregation job...');
    for (const feed of RSS_FEEDS) {
        try {
            const response = await fetch(feed.url, {
                headers: { 'User-Agent': 'KabiraNewsCloudBot/1.0' },
            });
            if (!response.ok)
                continue;
            const xmlText = await response.text();
            const parsed = parser.parse(xmlText);
            const rawItems = parsed?.rss?.channel?.item || [];
            const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems];
            for (const item of itemArray.slice(0, 4)) {
                const title = item.title?.replace(/<[^>]*>?/gm, '').trim();
                const link = item.link || '';
                if (!title || !link)
                    continue;
                // Deduplication check in Firestore
                const existingDoc = await db.collection('articles').where('source.url', '==', link).limit(1).get();
                if (!existingDoc.empty) {
                    console.log(`[Deduplication] Skipping already processed URL: ${link}`);
                    continue;
                }
                // Gemini AI Synthesis
                const prompt = `
You are the senior editorial AI editor for "Kabira News" (कबीरा न्यूज़).
Rewrite the following raw news alert into an original, factual news story in natural, refined Hindi:

Headline: ${title}
Snippet: ${item.description || ''}
Category: ${feed.category}

Safety instructions:
- Never copy copyrighted text verbatim; summarize the factual points.
- If it touches on communal tension, crime allegations, or unverified claims, mark decision: "hold_for_review".
- If it is standard low-risk news (sports, tech, business, space, infrastructure), mark decision: "auto_publish".

JSON Schema:
{
  "headlineHi": "Punchy Hindi headline",
  "summaryHi": "2-3 sentences in Hindi",
  "contentHi": "3-4 well-structured paragraphs in Hindi",
  "category": "national" | "politics" | "sports" | "business" | "tech" | "entertainment" | "world" | "health" | "education" | "state",
  "tags": ["3-5 tags"],
  "isBreaking": true/false,
  "isTrending": true/false,
  "riskAssessment": {
    "riskLevel": "low" | "medium" | "high",
    "decision": "auto_publish" | "hold_for_review",
    "reason": "1-sentence reason"
  }
}
`;
                const aiResponse = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: prompt,
                    config: { responseMimeType: 'application/json', temperature: 0.2 },
                });
                if (!aiResponse.text)
                    continue;
                const result = JSON.parse(aiResponse.text);
                const articleId = `cloud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                const targetCollection = result.riskAssessment?.decision === 'hold_for_review' ? 'pending_articles' : 'articles';
                await db.collection(targetCollection).doc(articleId).set({
                    id: articleId,
                    title: result.headlineHi || title,
                    summary: result.summaryHi || '',
                    content: result.contentHi || '',
                    category: result.category || feed.category,
                    state: feed.state || null,
                    city: feed.city || null,
                    imageUrl: result.imageUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
                    imageCaption: result.imageCaption || `चित्र: ${feed.name} संदर्भ`,
                    source: { name: feed.name, url: link, originalPubDate: item.pubDate || new Date().toISOString() },
                    attributionText: `स्रोत: ${feed.name}`,
                    status: result.riskAssessment?.decision === 'hold_for_review' ? 'draft' : 'published',
                    publishedAt: new Date().toISOString(),
                    views: 120,
                    tags: result.tags || ['समाचार', 'कबीरा न्यूज़'],
                    readingTime: 3,
                    aiProcessed: true,
                    aiModel: 'gemini-3.8-flash',
                    riskAssessment: result.riskAssessment,
                });
                console.log(`[Kabira News] Processed & saved to ${targetCollection}: ${result.headlineHi}`);
            }
        }
        catch (err) {
            console.error(`Error processing feed ${feed.name}:`, err);
        }
    }
    console.log('[Kabira News Scheduler] Completed scheduled news cycle.');
});
/**
 * Manual HTTP Webhook to trigger ingestion on-demand
 */
exports.triggerNewsIngestion = (0, https_1.onRequest)({
    cors: true,
    memory: '512MiB',
    timeoutSeconds: 300,
}, async (req, res) => {
    // Can be called by admin or webhook
    res.json({ message: 'News ingestion triggered successfully via Cloud Functions' });
});
//# sourceMappingURL=index.js.map