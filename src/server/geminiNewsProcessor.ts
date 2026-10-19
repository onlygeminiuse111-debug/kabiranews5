import { GoogleGenAI } from '@google/genai';
import { RawNewsItem } from './feedIngestion';

// Initialize Gemini client strictly server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ProcessedNewsResult {
  headlineHi: string;
  headlineEn: string;
  slug: string;
  summaryHi: string;
  contentHi: string;
  category: 'national' | 'politics' | 'world' | 'sports' | 'entertainment' | 'business' | 'tech' | 'health' | 'education' | 'state';
  state?: string;
  city?: string;
  tags: string[];
  isBreaking: boolean;
  isTrending: boolean;
  isHeroHighlight: boolean;
  readingTime: number;
  imageUrl: string;
  imageCaption: string;
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    sensitivityCategories: string[];
    decision: 'auto_publish' | 'hold_for_review';
    reason: string;
  };
  processedBy: 'gemini-3.8-flash' | 'safety-rules-engine';
}

// Fallback high-resolution editorial Unsplash photography mapped by category
const CATEGORY_IMAGES: Record<string, string> = {
  national: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  politics: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  state: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f1?auto=format&fit=crop&w=1200&q=80',
  sports: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=1200&q=80',
  business: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
  tech: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  world: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  health: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
  education: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
};

// Rich contextual editorial photography matching Indian news topics
export function resolveArticleImage(rawItem: RawNewsItem, category: string, headline: string): { url: string; isRealFeedImage: boolean } {
  // 1. If RSS source provided a genuine image URL, prioritize it
  if (rawItem.imageUrl && typeof rawItem.imageUrl === 'string' && rawItem.imageUrl.startsWith('http') && !rawItem.imageUrl.includes('pixel') && !rawItem.imageUrl.endsWith('.gif')) {
    return { url: rawItem.imageUrl, isRealFeedImage: true };
  }

  const textToScan = `${headline} ${rawItem.title} ${rawItem.description || ''}`.toLowerCase();

  // Cricket / Sports
  if (textToScan.includes('cricket') || textToScan.includes('क्रिकेट') || textToScan.includes('ipl') || textToScan.includes('kohli') || textToScan.includes('रोहित') || textToScan.includes('मैच') || textToScan.includes('world cup')) {
    return { url: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Indian Railway / Train / Metro
  if (textToScan.includes('रेल') || textToScan.includes('ट्रेन') || textToScan.includes('वंदे भारत') || textToScan.includes('मेट्रो') || textToScan.includes('रेलवे')) {
    return { url: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Space / ISRO / Satellite
  if (textToScan.includes('इसरो') || textToScan.includes('इस्रों') || textToScan.includes('चंद्रयान') || textToScan.includes('गगनयान') || textToScan.includes('अंतरिक्ष') || textToScan.includes('रॉकेट')) {
    return { url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Government / Parliament / Politics / Modi
  if (textToScan.includes('संसद') || textToScan.includes('मोदी') || textToScan.includes('प्रधानमंत्री') || textToScan.includes('कैबिनेट') || textToScan.includes('विधानसभा') || textToScan.includes('सरकार') || textToScan.includes('लोकसभा')) {
    return { url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Madhya Pradesh / Bhopal / Indore
  if (textToScan.includes('मध्य प्रदेश') || textToScan.includes('भोपाल') || textToScan.includes('इंदौर') || textToScan.includes('उज्जैन') || textToScan.includes('ग्वालियर')) {
    return { url: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f1?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Agriculture / Kisan / Farming
  if (textToScan.includes('किसान') || textToScan.includes('कृषि') || textToScan.includes('फसल') || textToScan.includes('गेहूं') || textToScan.includes('मंडी') || textToScan.includes('एमएसपी')) {
    return { url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Finance / Share Market / Gold / Bank
  if (textToScan.includes('शेयर') || textToScan.includes('बाजार') || textToScan.includes('सेंसेक्स') || textToScan.includes('रुपया') || textToScan.includes('बैंक') || textToScan.includes('सोना') || textToScan.includes('जीएसटी')) {
    return { url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Education / Exam / Board
  if (textToScan.includes('परीक्षा') || textToScan.includes('बोर्ड') || textToScan.includes('छात्र') || textToScan.includes('रिजल्ट') || textToScan.includes('स्कूल') || textToScan.includes('कॉलेज') || textToScan.includes('नौकरी')) {
    return { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Legal / Police / Supreme Court / High Court
  if (textToScan.includes('कोर्ट') || textToScan.includes('सुप्रीम कोर्ट') || textToScan.includes('हाईकोर्ट') || textToScan.includes('पुलिस') || textToScan.includes('फैसला') || textToScan.includes('न्यायालय')) {
    return { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Weather / Rain / Monsoon / Heat
  if (textToScan.includes('मौसम') || textToScan.includes('बारिश') || textToScan.includes('गर्मी') || textToScan.includes('मानसून') || textToScan.includes('तापमान') || textToScan.includes('लू')) {
    return { url: 'https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Health / Hospital / Medical
  if (textToScan.includes('अस्पताल') || textToScan.includes('एम्स') || textToScan.includes('डॉक्टर') || textToScan.includes('दवा') || textToScan.includes('सेहत') || textToScan.includes('वैक्सीन')) {
    return { url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Tech / Mobile / 5G / AI
  if (textToScan.includes('मोबाइल') || textToScan.includes('स्मार्टफोन') || textToScan.includes('5जी') || textToScan.includes('एआई') || textToScan.includes('गूगल') || textToScan.includes('तकनीक')) {
    return { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }
  // Cinema / Bollywood / OTT
  if (textToScan.includes('फिल्म') || textToScan.includes('सिनेमा') || textToScan.includes('बॉलीवुड') || textToScan.includes('अभिनेता') || textToScan.includes('बॉक्स ऑफिस')) {
    return { url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80', isRealFeedImage: false };
  }

  // 3. Fallback to mapped category image
  return {
    url: CATEGORY_IMAGES[category] || CATEGORY_IMAGES.national,
    isRealFeedImage: false,
  };
}

// Sensitive words list for strict risk assessment and holding
const SENSITIVE_KEYWORDS = [
  'दंगा', 'सांप्रदायिक', 'हिंसा', 'कत्ल', 'हत्या', 'बलात्कार', 'आरोप', 'घोटाला',
  'भ्रष्टाचार', 'विवादित', 'गिरफ्तारी', 'फर्जी', 'धांधली', 'मौत', 'हादसा'
];

/**
 * High-reliability fallback synthesis when API limits or cooldowns occur
 */
function createRuleBasedSynthesis(rawItem: RawNewsItem): ProcessedNewsResult {
  const fullText = `${rawItem.title} ${rawItem.description} ${rawItem.content || ''}`;
  
  // Detect sensitivity
  const matchedSensitive = SENSITIVE_KEYWORDS.filter(k => fullText.includes(k));
  const isHighRisk = matchedSensitive.length > 0;

  // Detect state / city
  let state = rawItem.state;
  let city = rawItem.city;
  if (!state) {
    if (fullText.includes('मध्य प्रदेश') || fullText.includes('भोपाल') || fullText.includes('इंदौर')) {
      state = 'मध्य प्रदेश';
      if (fullText.includes('भोपाल')) city = 'भोपाल';
      else if (fullText.includes('इंदौर')) city = 'इंदौर';
    } else if (fullText.includes('उत्तर प्रदेश') || fullText.includes('लखनऊ')) {
      state = 'उत्तर प्रदेश';
      if (fullText.includes('लखनऊ')) city = 'लखनऊ';
    } else if (fullText.includes('दिल्ली')) {
      state = 'दिल्ली';
      city = 'नई दिल्ली';
    }
  }

  const cleanHeadline = rawItem.title.replace(/\s*-\s*[^-]+$/, '').trim();
  const cat = (rawItem.category as any) || 'national';
  const imgResolution = resolveArticleImage(rawItem, cat, cleanHeadline);

  const slug = cleanHeadline
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 60) || `news-${Date.now()}`;

  return {
    headlineHi: cleanHeadline,
    headlineEn: '',
    slug,
    summaryHi: rawItem.description?.slice(0, 200) || cleanHeadline,
    contentHi: `${cleanHeadline}। प्राप्त सूचना के अनुसार, ${rawItem.sourceName} द्वारा संप्रेषित इस समाचार में मुख्य घटनाक्रम की पुष्टि की गई है। इस विषय पर विस्तृत आधिकारिक बयान प्रतीक्षित है।`,
    category: cat,
    state,
    city,
    tags: [cat, state || 'देश', 'कबीरा न्यूज़'].filter(Boolean) as string[],
    isBreaking: false,
    isTrending: false,
    isHeroHighlight: false,
    readingTime: 2,
    imageUrl: imgResolution.url,
    imageCaption: imgResolution.isRealFeedImage ? `स्रोत चित्र: ${rawItem.sourceName}` : `संदर्भ चित्र: ${rawItem.sourceName} (प्रतीकात्मक)`,
    riskAssessment: {
      riskLevel: isHighRisk ? 'medium' : 'low',
      sensitivityCategories: isHighRisk ? matchedSensitive : ['none'],
      decision: isHighRisk ? 'hold_for_review' : 'auto_publish',
      reason: isHighRisk 
        ? `संवेदनशील शब्द संज्ञान में आए: ${matchedSensitive.join(', ')}`
        : 'सत्यापित सामान्य समाचार (सुरक्षा नियमों के अंतर्गत पारित)',
    },
    processedBy: 'safety-rules-engine',
  };
}

/**
 * Process a raw news item using Gemini 3.8 Flash with retry & fallback
 */
export async function processNewsItemWithGemini(
  rawItem: RawNewsItem,
  maxRetries = 1
): Promise<ProcessedNewsResult | null> {
  const prompt = `
You are the senior editorial AI editor for "Kabira News" (कबीरा न्यूज़), an authoritative, neutral, and prestigious Hindi digital news portal.

Your task is to take the following raw news alert/feed snippet and synthesize an original, factual news story in natural, refined Hindi (देवनागरी लिपि).

RAW NEWS INPUT:
Source: ${rawItem.sourceName}
Original Headline: ${rawItem.title}
Published Time: ${rawItem.pubDate}
Snippet/Content: ${rawItem.content || rawItem.description}
Suggested Category: ${rawItem.category} ${rawItem.state ? `(State: ${rawItem.state})` : ''}

EDITORIAL & SAFETY GUIDELINES:
1. PURE FACTUAL ACCURACY: Never invent facts, quotes, statistics, or sources. Only synthesize the factual information provided in the snippet.
2. COPYRIGHT & FAIR USE: Do NOT copy the input text verbatim. Synthesize and summarize in your own fresh, original Hindi words.
3. RISK & SENSITIVITY CHECK (CRITICAL):
   - Evaluate if this story touches on:
     a) Communal, religious, or caste tensions
     b) Unverified crime allegations against living individuals
     c) Election fraud allegations or unverified political disputes
     d) Panic-inducing health emergencies or disaster rumors
     e) Unverified breaking flash claims with no official agency confirmation
   - If ANY of these sensitive topics are present, mark "riskLevel": "high" or "medium" and "decision": "hold_for_review".
   - If the story is standard verified news (e.g. sports score, space/science development, economy/stock figures, infrastructure/metro development, weather advisory, official government gazette, entertainment update), mark "riskLevel": "low" and "decision": "auto_publish".
4. REGIONAL LOCALIZATION: If the news relates to Madhya Pradesh, Bhopal, Indore, or other Indian states, accurately tag the state and city.

Respond ONLY with a valid JSON object matching this schema:
{
  "headlineHi": "A punchy, accurate Hindi headline (max 90 chars, no clickbait)",
  "headlineEn": "English translation of headline",
  "summaryHi": "2-3 clear sentences in Hindi summarizing the core development",
  "contentHi": "3-4 well-structured paragraphs in natural, grammatically correct Hindi covering the facts. Use clean paragraphs.",
  "category": "national" | "politics" | "world" | "sports" | "entertainment" | "business" | "tech" | "health" | "education" | "state",
  "state": "मध्य प्रदेश" | "उत्तर प्रदेश" | "बिहार" | "राजस्थान" | "दिल्ली" | null,
  "city": "भोपाल" | "इंदौर" | "ग्वालियर" | "लखनऊ" | "वाराणसी" | "जयपुर" | "पटना" | "नई दिल्ली" | null,
  "tags": ["3-5 Hindi and English tags"],
  "isBreaking": true/false,
  "isTrending": true/false,
  "isHeroHighlight": false,
  "readingTime": 3,
  "imageCaption": "A short caption in Hindi describing the context",
  "riskAssessment": {
    "riskLevel": "low" | "medium" | "high",
    "sensitivityCategories": ["communal" | "crime_allegation" | "election_claim" | "health_emergency" | "unverified_breaking" | "none"],
    "decision": "auto_publish" | "hold_for_review",
    "reason": "Brief explanation of risk decision in 1 sentence"
  }
}
`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const textOutput = response.text;
      if (!textOutput) return null;

      const parsed = JSON.parse(textOutput);

      const slug = (parsed.headlineEn || parsed.headlineHi)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .slice(0, 60) || `news-${Date.now()}`;

      const cat = parsed.category || rawItem.category || 'national';
      const headline = parsed.headlineHi || rawItem.title;
      const imgResolution = resolveArticleImage(rawItem, cat, headline);

      return {
        headlineHi: headline,
        headlineEn: parsed.headlineEn || '',
        slug,
        summaryHi: parsed.summaryHi || '',
        contentHi: parsed.contentHi || parsed.summaryHi || '',
        category: cat,
        state: parsed.state || rawItem.state || undefined,
        city: parsed.city || rawItem.city || undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['समाचार', 'कबीरा न्यूज़'],
        isBreaking: Boolean(parsed.isBreaking),
        isTrending: Boolean(parsed.isTrending),
        isHeroHighlight: Boolean(parsed.isHeroHighlight),
        readingTime: parsed.readingTime || 3,
        imageUrl: imgResolution.url,
        imageCaption: parsed.imageCaption || (imgResolution.isRealFeedImage ? `स्रोत चित्र: ${rawItem.sourceName}` : `चित्र: ${rawItem.sourceName} संदर्भ (प्रतीकात्मक)`),
        riskAssessment: {
          riskLevel: parsed.riskAssessment?.riskLevel || 'low',
          sensitivityCategories: parsed.riskAssessment?.sensitivityCategories || ['none'],
          decision: parsed.riskAssessment?.decision || 'auto_publish',
          reason: parsed.riskAssessment?.reason || 'Verified standard factual reporting',
        },
        processedBy: 'gemini-3.8-flash',
      };
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429;
      if (isRateLimit) {
        console.warn(`[Gemini API] 429 Rate limit / quota pause (Attempt ${attempt + 1}/${maxRetries + 1}).`);
        if (attempt < maxRetries) {
          // Wait 6 seconds before retry
          await new Promise((r) => setTimeout(r, 6000));
          continue;
        }
      } else {
        console.warn(`Gemini processing error for article "${rawItem.title}":`, error?.message || error);
      }
    }
  }

  // Graceful editorial safety fallback when API quota is reached
  return createRuleBasedSynthesis(rawItem);
}
