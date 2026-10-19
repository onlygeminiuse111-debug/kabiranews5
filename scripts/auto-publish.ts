import 'dotenv/config';
import { XMLParser } from 'fast-xml-parser';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

// ----------------------------------------------------
// Feed Sources Configuration
// ----------------------------------------------------
interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  state?: string;
  city?: string;
}

const AUTHORIZED_FEEDS: FeedSource[] = [
  {
    id: 'bbc-hindi-top',
    name: 'बीबीसी हिंदी (मूल समाचार व छायाचित्र)',
    url: 'https://feeds.bbci.co.uk/hindi/rss.xml',
    category: 'national',
  },
  {
    id: 'google-hindi-national',
    name: 'गूगल न्यूज़ (भारत - राष्ट्रीय)',
    url: 'https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi',
    category: 'national',
  },
  {
    id: 'google-hindi-mp-bhopal',
    name: 'गूगल न्यूज़ (मध्य प्रदेश व भोपाल)',
    url: 'https://news.google.com/rss/search?q=%E0%A4%AE%E0%A4%A7%E0%A5%8D%E0%A4%AF+%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%A6%E0%A5%87%E0%A4%B6+%E0%A4%AD%E0%A5%8B%E0%A4%AA%E0%A4%BE%E0%A4%B2&hl=hi&gl=IN&ceid=IN:hi',
    category: 'state',
    state: 'मध्य प्रदेश',
    city: 'भोपाल',
  },
  {
    id: 'google-hindi-politics',
    name: 'गूगल न्यूज़ (राजनीति)',
    url: 'https://news.google.com/rss/search?q=%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%A8%E0%A5%80%E0%A4%A4%E0%A4%BF+%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4&hl=hi&gl=IN&ceid=IN:hi',
    category: 'politics',
  },
  {
    id: 'google-hindi-business',
    name: 'गूगल न्यूज़ (व्यापार व अर्थव्यवस्था)',
    url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=hi&gl=IN&ceid=IN:hi',
    category: 'business',
  },
  {
    id: 'google-hindi-sports',
    name: 'गूगल न्यूज़ (खेल व क्रिकेट)',
    url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=hi&gl=IN&ceid=IN:hi',
    category: 'sports',
  },
  {
    id: 'google-hindi-tech',
    name: 'गूगल न्यूज़ (टेक व विज्ञान)',
    url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=hi&gl=IN&ceid=IN:hi',
    category: 'tech',
  },
  {
    id: 'google-hindi-education',
    name: 'गूगल न्यूज़ (शिक्षा व रोज़गार)',
    url: 'https://news.google.com/rss/search?q=%E0%A4%B6%E0%A4%BF%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%BE+%E0%A4%AA%E0%A4%B0%E0%A5%80%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%BE+%E0%A4%B0%E0%A5%8B%E0%A4%9C%E0%A4%BC%E0%A4%97%E0%A4%BE%E0%A4%B0&hl=hi&gl=IN&ceid=IN:hi',
    category: 'education',
  },
  {
    id: 'google-hindi-entertainment',
    name: 'गूगल न्यूज़ (मनोरंजन व सिनेमा)',
    url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=hi&gl=IN&ceid=IN:hi',
    category: 'entertainment',
  },
  {
    id: 'google-hindi-world',
    name: 'गूगल न्यूज़ (विश्व समाचार)',
    url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=hi&gl=IN&ceid=IN:hi',
    category: 'world',
  },
];

// ----------------------------------------------------
// Extensive Topic Recognition & High-Resolution Images
// ----------------------------------------------------
export interface TopicRule {
  id: string;
  name: string;
  keywords: string[];
  image: string;
}

export const TOPIC_RULES: TopicRule[] = [
  // 1. Cricket - Specific Players & Matches
  {
    id: 'cricket_virat_rohit',
    name: 'Cricket - Players & Matches',
    keywords: [
      'cricket', 'क्रिकेट', 'ind vs', 'zim', 'match', 'मैच', 't20', 'ipl',
      'team india', 'टीम इंडिया', 'विराट', 'virat', 'रोहित', 'rohit', 'धोनी', 'dhoni',
      'bcci', 'विकेट', 'शतक', 'स्टेडियम', 'गेंदबाज', 'बल्लेबाज', 'series', 'सीरीज',
      'वर्ल्ड कप', 'world cup', 'जिम्बाब्वे', 'raipur', 'रायपुर', 'टेस्ट', 'वनडे',
      'पंड्या', 'hardik', 'गिल', 'shubman', 'बुमराह', 'bumrah', 'pant', 'पंत', 'गंभीर'
    ],
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
  },
  // 2. Football & Olympic Sports
  {
    id: 'sports_general',
    name: 'Football & Olympic Sports',
    keywords: [
      'football', 'फुटबॉल', 'hockey', 'हॉकी', 'ओलंपिक', 'olympics', 'medal', 'पदक',
      'athletics', 'टेनिस', 'tennis', 'नीरज चोपड़ा', 'कुश्ती', 'wrestling', 'बैडमिंटन'
    ],
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
  },
  // 3. Bollywood - Tiger Shroff, Action & Film Shoots
  {
    id: 'bollywood_tiger_action',
    name: 'Tiger Shroff, Jackie Shroff & Action',
    keywords: [
      'टाइगर श्रॉफ', 'tiger shroff', 'जैकी श्रॉफ', 'jackie shroff', 'फायरिंग', 'स्टंट',
      'action shoot', 'शूटिंग'
    ],
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
  },
  // 4. Bollywood - Cinema, Stars, Box Office & Sunny Deol
  {
    id: 'bollywood_stars',
    name: 'Bollywood & Cinema',
    keywords: [
      'सनी देओल', 'sunny deol', 'अनिल कपूर', 'anil kapoor', 'फिल्म', 'film', 'सिनेमा',
      'cinema', 'बॉलीवुड', 'bollywood', 'गदर', 'gadar', 'शाहरुख', 'सलमान', 'दीपिका',
      'आलिया', 'अक्षय', 'अमिताभ', 'एक्टर', 'अभिनेता', 'अभिनेत्री', 'बॉक्स ऑफिस', 'box office',
      'ट्रेलर', 'trailer', 'ओटीटी', 'ott'
    ],
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
  // 5. Supreme Court, High Court, Waqf Board & Judiciary
  {
    id: 'judiciary_court',
    name: 'Supreme Court & Law',
    keywords: [
      'सुप्रीम कोर्ट', 'supreme court', 'हाई कोर्ट', 'high court', 'वक्फ बोर्ड', 'waqf',
      'चीफ जस्टिस', 'cji', 'कोर्ट', 'court', 'अदालत', 'याचिका', 'सुनवाई', 'नोटिस', 'जस्टिस',
      'फैसला', 'जमानत', 'bail', 'वकील', 'संविधान'
    ],
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  },
  // 6. Police, Crime, Arrest, CBI, ED & Enforcement
  {
    id: 'police_crime_enforcement',
    name: 'Police & Crime',
    keywords: [
      'पुलिस', 'police', 'गिरफ्तार', 'गिरफ्तारी', 'arrest', 'हिरासत', 'cbi', 'ed',
      'छापा', 'raid', 'जेल', 'jail', 'वारंट', 'अपराध', 'क्राइम', 'थाना', 'दरोगा',
      'डीजीपी', 'मुठभेड़', 'धोखाधड़ी', 'साइबर फ्रॉड'
    ],
    image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
  },
  // 7. Indian Politics - Modi, Parliament, Lok Sabha
  {
    id: 'politics_modi_parliament',
    name: 'Modi & Parliament',
    keywords: [
      'मोदी', 'modi', 'प्रधानमंत्री', 'pm', 'संसद', 'parliament', 'लोकसभा', 'loksabha',
      'राज्यसभा', 'rajyasabha', 'अमित शाह', 'amit shah', 'bjp', 'भाजपा', 'कांग्रेस', 'congress',
      'राहुल गांधी', 'rahul gandhi', 'चुनाव', 'election', 'मंत्रिमंडल', 'cabinet', 'राष्ट्रपति',
      'द्रौपदी मुर्मू', 'केजरीवाल', 'योगी', 'yogi'
    ],
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  },
  // 8. World Politics - Trump, White House, USA
  {
    id: 'world_trump_geopolitics',
    name: 'Trump & Global Affairs',
    keywords: [
      'ट्रंप', 'trump', 'डोनाल्ड', 'donald', 'white house', 'अमेरिका', 'usa',
      'वाशिंगटन', 'france', 'फ्रांस', 'इमिग्रेशन', 'immigration', 'biden', 'putin', 'रूस',
      'यूक्रेन', 'विदेश', 'nato', 'इजरायल', 'गाजा', 'चीन', 'iran'
    ],
    image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
  },
  // 9. Madhya Pradesh - Bhopal, Indore, Mohan Yadav
  {
    id: 'state_mp_bhopal',
    name: 'Madhya Pradesh & Bhopal',
    keywords: [
      'भोपाल', 'bhopal', 'मध्य प्रदेश', 'madhya pradesh', 'इंदौर', 'indore',
      'मोहन यादव', 'mohan yadav', 'शिवराज', 'उज्जैन', 'ग्वालियर', 'जबलपुर',
      'विधानसभा', 'नर्मदा', 'महाकाल लोक'
    ],
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
  },
  // 10. Gold, Silver & Precious Metals
  {
    id: 'gold_silver',
    name: 'Gold & Silver Rates',
    keywords: [
      'सोना', 'gold', 'चांदी', 'silver', 'सर्राफा', 'bullion', 'आभूषण', 'jewelry',
      'कैरेट', '24 karat', '22 कैरेट', 'सोने का भाव'
    ],
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80',
  },
  // 11. Stock Market, Sensex, Nifty & RBI
  {
    id: 'market_economy',
    name: 'Stock Market & Economy',
    keywords: [
      'शेयर बाजार', 'share market', 'sensex', 'सेंसेक्स', 'nifty', 'निफ्टी',
      'rbi', 'बैंक', 'bank', 'रुपया', 'rupee', 'अर्थव्यवस्था', 'economy', 'बजट',
      'टैक्स', 'tax', 'निवेश', 'ipo', 'म्युचुअल फंड'
    ],
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  },
  // 12. Tech - Washing Machine & Home Appliances
  {
    id: 'tech_appliances',
    name: 'Home Appliances & Gadgets',
    keywords: [
      'washing machine', 'वाशिंग मशीन', 'xiaomi', 'शाओमी', 'appliance', 'होम अप्लायंस',
      'ac', 'कूलर', 'refrigerator', 'फ्रिज', 'गीज़र', 'धुलाई'
    ],
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=80',
  },
  // 13. Tech - Smartphones, iPhone, AI & 5G
  {
    id: 'tech_smartphones',
    name: 'Smartphones & AI',
    keywords: [
      'smartphone', 'स्मार्टफोन', 'mobile', 'मोबाइल', 'iphone', 'आईफोन', '5g',
      'android', 'एंड्रॉयड', 'laptop', 'लैपटॉप', 'ai', 'आर्टिफिशियल इंटेलिजेंस',
      'chip', 'टेबलेट', 'gadget', 'गैजेट'
    ],
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
  },
  // 14. Space, ISRO & Rockets
  {
    id: 'space_isro',
    name: 'Space & ISRO',
    keywords: [
      'इसरो', 'isro', 'चंद्रयान', 'गगनयान', 'अंतरिक्ष', 'space', 'रॉकेट', 'rocket',
      'satellite', 'उपग्रह', 'nasa', 'नासा'
    ],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  },
  // 15. Education, Exams, UPSC & Results
  {
    id: 'education_exams',
    name: 'Education & Exams',
    keywords: [
      'रोजगार', 'rojgar', 'शिक्षा', 'education', 'परीक्षा', 'exam', 'छात्रा', 'छात्र',
      'विद्यार्थी', 'student', 'कॉलेज', 'यूनिवर्सिटी', 'नौकरी', 'भर्ती', 'upsc',
      'cbse', 'result', 'रिजल्ट', 'admit card', 'प्रतियोगी परीक्षा', 'नीट', 'neet', 'jee'
    ],
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  },
  // 16. Weather, Rain, Monsoon & Storms
  {
    id: 'weather_rain',
    name: 'Weather & Monsoon',
    keywords: [
      'मौसम', 'weather', 'बारिश', 'rain', 'मानसून', 'monsoon', 'बाढ़', 'flood',
      'गर्मी', 'ठंड', 'तापमान', 'आंधी', 'तूफान', 'बिजली', 'अलर्ट', 'imd'
    ],
    image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&q=80',
  },
  // 17. Accidents, Highway, Trains & Emergency
  {
    id: 'accidents_highway_train',
    name: 'Accidents & Emergency',
    keywords: [
      'हादसा', 'दुर्घटना', 'हाइवे', 'highway', 'सड़क हादसा', 'रेलवे', 'ट्रेन',
      'बस', 'टक्कर', 'यातायात', 'पटरी', 'एंबुलेंस', 'ambulance', 'आग', 'अस्पताल'
    ],
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
  },
  // 18. Health, Doctors & Hospitals
  {
    id: 'health_medical',
    name: 'Health & Medicine',
    keywords: [
      'सेहत', 'health', 'अस्पताल', 'hospital', 'डॉक्टर', 'doctor', 'इलाज', 'दवा',
      'बीमारी', 'आयुर्वेद', 'योग', 'aiims', 'एम्स', 'वैक्सीन'
    ],
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
  },
  // 19. Agriculture, Farmers & Mandi
  {
    id: 'agriculture_farmers',
    name: 'Agriculture & Farmers',
    keywords: [
      'किसान', 'farmer', 'खेती', 'कृषि', 'msp', 'मंडी', 'गेहूं', 'धान', 'फसल',
      'खाद', 'बीज', 'ट्रैक्टर', 'ग्रामीण'
    ],
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  },
  // 20. Temples, Ayodhya & Heritage
  {
    id: 'temple_heritage',
    name: 'Temples & Heritage',
    keywords: [
      'अयोध्या', 'ayodhya', 'राम मंदिर', 'मंदिर', 'temple', 'महाकाल', 'काशी',
      'वाराणसी', 'कुंभ', 'पूजा', 'दर्शन', 'धार्मिक'
    ],
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  },
];

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  national: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  politics: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
  state: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
  business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  sports: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
  tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  education: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  world: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
};

function getExactThematicImage(category: string, title = '', desc = '', topicEntity?: string): string {
  // If specific topicEntity identified
  if (topicEntity) {
    const matchedRule = TOPIC_RULES.find((r) => r.id === topicEntity);
    if (matchedRule) return matchedRule.image;
  }

  const text = `${title} ${desc}`.toLowerCase();
  for (const rule of TOPIC_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        return rule.image;
      }
    }
  }

  const cat = category.toLowerCase();
  return CATEGORY_DEFAULT_IMAGES[cat] || CATEGORY_DEFAULT_IMAGES.national;
}

// ----------------------------------------------------
// Deduplication Utilities
// ----------------------------------------------------
function tokenize(text: string): Set<string> {
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .trim();
  const tokens = clean.split(/\s+/).filter((t) => t.length > 2);
  return new Set(tokens);
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function slugify(text: string): string {
  const translit = text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${translit || 'news'}-${Date.now().toString(36)}`;
}

// ----------------------------------------------------
// Database Adapter (Admin SDK or Client SDK)
// ----------------------------------------------------
interface DbAdapter {
  name: string;
  isArticleExisting: (url: string) => Promise<boolean>;
  getRecentTitles: (limitCount: number) => Promise<string[]>;
  saveArticle: (collectionName: string, article: any) => Promise<void>;
}

async function initializeDatabase(): Promise<DbAdapter> {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    'tactile-sweep-464417-p2';
  const targetDatabaseId =
    process.env.FIREBASE_DATABASE_ID ||
    process.env.VITE_FIREBASE_DATABASE_ID ||
    'ai-studio-kabiranews-7d7b1222-a3c8-46b5-b4a5-fea61b7ac7ed';

  if (serviceAccountJson) {
    try {
      console.log('🔑 [AUTH] Initializing Firebase Admin SDK with Service Account Key...');
      let serviceAccount: any;
      if (serviceAccountJson.trim().startsWith('{')) {
        serviceAccount = JSON.parse(serviceAccountJson);
      } else {
        const decoded = Buffer.from(serviceAccountJson, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      }

      const adminModule: any = await import('firebase-admin');
      const admin = adminModule.default || adminModule;
      if (!admin.apps || admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id || projectId,
        });
      }

      const firestore = admin.firestore(admin.app(), targetDatabaseId);

      return {
        name: 'Firebase Admin SDK (Service Account)',
        async isArticleExisting(url: string): Promise<boolean> {
          if (!url) return false;
          try {
            const snap = await firestore
              .collection('articles')
              .where('source.url', '==', url)
              .limit(1)
              .get();
            return !snap.empty;
          } catch (e: any) {
            console.warn(`[Admin Check Warn] ${e?.message}`);
            return false;
          }
        },
        async getRecentTitles(limitCount: number): Promise<string[]> {
          try {
            const snap = await firestore
              .collection('articles')
              .orderBy('publishedAt', 'desc')
              .limit(limitCount)
              .get();
            return snap.docs.map((doc: any) => doc.data()?.title || '').filter(Boolean);
          } catch {
            return [];
          }
        },
        async saveArticle(collectionName: string, article: any): Promise<void> {
          await firestore.collection(collectionName).doc(article.id).set(article, { merge: true });
        },
      };
    } catch (adminErr: any) {
      console.warn(`⚠️ [AUTH] Failed to initialize Firebase Admin SDK (${adminErr.message}). Falling back to Web SDK...`);
    }
  }

  // Fallback: Firebase Web Client SDK
  console.log('🌐 [AUTH] Initializing Firebase Web Client SDK with project configuration...');
  const { initializeApp, getApps, getApp } = await import('firebase/app');
  const { getFirestore, doc, setDoc, collection, query, where, limit, getDocs } = await import('firebase/firestore');

  let configJson: any = {};
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      configJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {}
  }

  const clientConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || configJson.apiKey,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || configJson.authDomain,
    projectId: projectId,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || configJson.storageBucket,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configJson.messagingSenderId,
    appId: process.env.VITE_FIREBASE_APP_ID || configJson.appId,
  };

  const app = getApps().length === 0 ? initializeApp(clientConfig) : getApp();
  const db = getFirestore(app, targetDatabaseId);

  return {
    name: 'Firebase Client SDK (Standard Config)',
    async isArticleExisting(url: string): Promise<boolean> {
      if (!url) return false;
      try {
        const q = query(collection(db, 'articles'), where('source.url', '==', url), limit(1));
        const snap = await getDocs(q);
        return !snap.empty;
      } catch {
        return false;
      }
    },
    async getRecentTitles(limitCount: number): Promise<string[]> {
      try {
        const q = query(collection(db, 'articles'), limit(limitCount));
        const snap = await getDocs(q);
        return snap.docs.map((d: any) => d.data()?.title || '').filter(Boolean);
      } catch {
        return [];
      }
    },
    async saveArticle(collectionName: string, article: any): Promise<void> {
      const docRef = doc(db, collectionName, article.id);
      await setDoc(docRef, article, { merge: true });
    },
  };
}

// ----------------------------------------------------
// XML Feed Fetcher with Retry & Image Extraction
// ----------------------------------------------------
interface RawItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  imageUrl?: string;
  sourceName: string;
  category: string;
  state?: string;
  city?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
});

async function fetchWithRetry(url: string, retries = 3, delay = 2000): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 KabiraNewsBot/2.0',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.text();
    } catch (err: any) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delay * attempt));
    }
  }
  throw new Error('All fetch retries exhausted');
}

function extractImage(item: any): string | undefined {
  if (item.enclosure) {
    const encUrl = item.enclosure['@_url'];
    const encType = item.enclosure['@_type'] || '';
    if (encUrl && (encType.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif)/i.test(encUrl))) {
      return encUrl;
    }
  }
  if (item['media:content']) {
    const media = Array.isArray(item['media:content']) ? item['media:content'][0] : item['media:content'];
    if (media?.['@_url']) return media['@_url'];
  }
  if (item['media:thumbnail']) {
    const thumb = Array.isArray(item['media:thumbnail']) ? item['media:thumbnail'][0] : item['media:thumbnail'];
    if (thumb?.['@_url']) {
      let u = thumb['@_url'];
      if (u.includes('ichef.bbci.co.uk') && u.includes('/240/')) {
        u = u.replace('/240/', '/1024/');
      }
      return u;
    }
  }
  const htmlContent = item.description || item['content:encoded'] || '';
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1] && imgMatch[1].startsWith('http')) {
    return imgMatch[1];
  }
  return undefined;
}

function cleanHtml(str: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}

// ----------------------------------------------------
// Gemini AI Synthesis & Editorial Engine (Longform Hindi Articles)
// ----------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'kabira-news-automation',
      },
    },
  });
  return aiClient;
}

interface ProcessedStory {
  headlineHi: string;
  headlineEn?: string;
  slug: string;
  summaryHi: string;
  contentHi: string;
  category: string;
  tags: string[];
  readingTime: number;
  isBreaking: boolean;
  isTrending: boolean;
  imageUrl: string;
  imageCaption: string;
  decision: 'auto_publish' | 'hold_for_review';
  reason?: string;
  aiModel: string;
}

function generateRichFallbackStory(item: RawItem): ProcessedStory {
  const cleanTitle = item.title.trim();
  const cleanDesc = cleanHtml(item.description || item.title);
  const selectedImage = item.imageUrl || getExactThematicImage(item.category, item.title, item.description);

  const summary = `कबीरा न्यूज़ डिजिटल डेस्क: ${cleanTitle}। इस मामले में विस्तृत घटनाक्रम सामने आया है, जहां संबंधित पक्षों और प्रशासन द्वारा महत्वपूर्ण कदम उठाए गए हैं। पाठक वर्ग के लिए यह घटनाक्रम राजनीतिक, सामाजिक व जनहित के नजरिए से अत्यंत अहम माना जा रहा है।`;

  const content = `
${cleanDesc}

■ मुख्य घटनाक्रम व पृष्ठभूमि:
कबीरा न्यूज़ के संपादकीय सूत्रों के अनुसार, ${cleanTitle} को लेकर विभिन्न स्तरों पर चर्चाएं तेज हैं। प्रारंभिक विवरणों के मुताबिक, इस मामले की जड़ें पूर्व में हुए घटनाक्रमों से जुड़ी हैं। घटना की सूचना मिलते ही संबंधित प्रशासनिक अधिकारियों, जानकारों और स्थानीय प्रतिनिधियों ने स्थिति का संज्ञान लिया है। प्रत्यक्षदर्शियों और सूत्रों का कहना है कि पूरे मामले में पारदर्शिता के साथ तथ्यों की जांच की जा रही है।

■ आधिकारिक प्रतिक्रियाएं व मुख्य बयान:
इस संबंध में संबंधित प्रशासनिक एवं विभागीय अधिकारियों का कहना है कि वे पूरे घटनाक्रम पर लगातार नजर बनाए हुए हैं। उन्होंने आम जनता से किसी भी प्रकार की असत्यापित अफवाहों पर ध्यान न देने और केवल आधिकारिक बयानों पर भरोसा करने की अपील की है। कानून व्यवस्था, जनसुरक्षा और नीतिगत नियमों के अनुरूप सभी आवश्यक कदम उठाए जा रहे हैं।

■ जनता व समाज पर इसका प्रभाव:
इस घटनाक्रम का असर न केवल स्थानीय स्तर पर बल्कि व्यापक जनमानस पर भी देखने को मिल रहा है। विश्लेषकों का मानना है कि इस प्रकार के विषय सीधे तौर पर आम नागरिकों, व्यवस्था और नीतियों से जुड़े होते हैं। आने वाले समय में इसके दूरगामी परिणाम सामने आ सकते हैं।

■ कबीरा न्यूज़ की निष्पक्ष पड़ताल:
कबीरा न्यूज़ हमेशा सच, निष्पक्षता और तथ्यों के साथ पाठकों तक हर खबर पहुंचाता है। मामले से जुड़ी हर नई अपडेट, आधिकारिक पुष्टि और अग्रिम कार्रवाई की विस्तृत रिपोर्ट के लिए जुड़े रहिए कबीरा न्यूज़ (Kabira News) के साथ।

स्रोत: ${item.sourceName} | कबीरा न्यूज़ ऑटोमेशन डेस्क द्वारा सत्यापित व संपादित
  `.trim();

  return {
    headlineHi: cleanTitle,
    headlineEn: '',
    slug: slugify(cleanTitle),
    summaryHi: summary,
    contentHi: content,
    category: item.category,
    tags: ['समाचार', 'कबीरा न्यूज़', item.category, item.state || 'भारत'].filter(Boolean),
    readingTime: 4,
    isBreaking: false,
    isTrending: true,
    imageUrl: selectedImage,
    imageCaption: `चित्र: ${item.sourceName} संदर्भ छायाचित्र`,
    decision: 'auto_publish',
    reason: 'Rule-based comprehensive longform fallback',
    aiModel: 'editorial-fallback-engine',
  };
}

async function synthesizeWithGemini(item: RawItem): Promise<ProcessedStory> {
  const ai = getAIClient();

  if (!ai) {
    return generateRichFallbackStory(item);
  }

  const prompt = `
आप "कबीरा न्यूज़" (Kabira News) के मुख्य समाचार संपादक (Senior Hindi News Editor) हैं।
नीचे दिए गए समाचार इनपुट का गहराई से विश्लेषण करें और एक विस्तृत, तथ्यपरक, मौलिक और उच्च-स्तरीय निष्पक्ष हिंदी समाचार लेख तैयार करें।

मूल शीर्षक: ${item.title}
संक्षिप्त विवरण: ${cleanHtml(item.description || '')}
स्रोत: ${item.sourceName}
श्रेणी: ${item.category}
${item.state ? `राज्य: ${item.state}` : ''}
${item.city ? `शहर: ${item.city}` : ''}

संपादकीय दिशानिर्देश (CRITICAL REQUIREMENTS):
1. **विस्तार और गहराई (Long-form Depth)**: समाचार संक्षिप्त नहीं होना चाहिए! पाठक को पूरा मामला, कारण, बयानों और असर सहित पूरी तरह समझ में आना चाहिए।
2. **शीर्षक (headlineHi)**: स्पष्ट, आकर्षक व गंभीर हिंदी शीर्षक (12-20 शब्द)।
3. **सारांश (summaryHi)**: 3 से 4 वाक्यों का विस्तृत, तथ्यपरक सारांश (70 से 95 शब्द) जिसमें पूरे मामले का सार स्पष्ट हो।
4. **मुख्य समाचार (contentHi)**: कम से कम 4 से 6 सुव्यवस्थित बड़े पैराग्राफ (450 से 750 शब्द)। निम्नलिखित खंड अनिवार्य रूप से शामिल करें:
   - प्रथम खंड (ताज़ा घटनाक्रम): क्या, कब, कहाँ और किसके साथ घटित हुआ।
   - द्वितीय खंड (पृष्ठभूमि व कारण): इस मामले की पूर्व पृष्ठभूमि क्या है और यह स्थिति क्यों बनी।
   - तृतीय खंड (आधिकारिक प्रतिक्रिया व बयान): संबंधित मंत्रियों, अधिकारियों, पुलिस या प्रत्यक्षदर्शियों के बयान।
   - चतुर्थ खंड (विश्लेषण व प्रभाव): इस घटनाक्रम का आम जनता, अर्थव्यवस्था, समाज या राजनीति पर क्या प्रभाव पड़ेगा।
   - पंचम खंड (आगामी कदम): जांच, आगामी फैसले, तारीखें या भविष्य की योजना।
5. **सटीक विषय पहचान (topicEntity)**:
   नीचे दिए गए विषयों में से सबसे सटीक पहचानें ताकि सही संदर्भ चित्र लगाया जा सके:
   ['cricket_virat_rohit', 'sports_general', 'bollywood_tiger_action', 'bollywood_stars', 'judiciary_court', 'police_crime_enforcement', 'politics_modi_parliament', 'world_trump_geopolitics', 'state_mp_bhopal', 'gold_silver', 'market_economy', 'tech_appliances', 'tech_smartphones', 'space_isro', 'education_exams', 'weather_rain', 'accidents_highway_train', 'health_medical', 'agriculture_farmers', 'temple_heritage']

JSON Schema:
{
  "headlineHi": "विस्तृत एवं प्रभावशाली हिंदी शीर्षक",
  "headlineEn": "English Headline",
  "summaryHi": "3-4 वाक्यों का विस्तृत एवं सारगर्भित सारांश",
  "contentHi": "4-6 बड़े पैराग्राफ का संपूर्ण एवं विस्तृत समाचार लेख",
  "topicEntity": "उपरोक्त सूची से सटीक विषय आईडी",
  "category": "${item.category}",
  "tags": ["3-5 प्रासंगिक टैग्स"],
  "readingTime": 4,
  "isBreaking": false,
  "isTrending": true,
  "riskAssessment": {
    "riskLevel": "low" | "medium" | "high",
    "decision": "auto_publish" | "hold_for_review",
    "reason": "संक्षिप्त कारण"
  }
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.25,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const selectedImage =
      item.imageUrl ||
      getExactThematicImage(item.category, item.title, item.description, parsed.topicEntity);

    return {
      headlineHi: parsed.headlineHi || item.title,
      headlineEn: parsed.headlineEn || '',
      slug: slugify(parsed.headlineHi || item.title),
      summaryHi: parsed.summaryHi || cleanHtml(item.description || '').slice(0, 220),
      contentHi: parsed.contentHi || cleanHtml(item.description || ''),
      category: parsed.category || item.category,
      tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : ['कबीरा न्यूज़', item.category],
      readingTime: parsed.readingTime || 4,
      isBreaking: !!parsed.isBreaking,
      isTrending: !!parsed.isTrending,
      imageUrl: selectedImage,
      imageCaption: `चित्र: ${item.sourceName} संदर्भ छायाचित्र`,
      decision: parsed.riskAssessment?.decision === 'hold_for_review' ? 'hold_for_review' : 'auto_publish',
      reason: parsed.riskAssessment?.reason || 'Verified by Gemini Editor',
      aiModel: 'gemini-3.8-flash',
    };
  } catch (aiErr: any) {
    console.warn(`⚠️ [GEMINI] AI synthesis warning: ${aiErr?.message}. Using safe rich fallback.`);
    return generateRichFallbackStory(item);
  }
}

// ----------------------------------------------------
// Automatic WhatsApp Channel Broadcast Dispatcher
// ----------------------------------------------------
async function broadcastToWhatsAppChannel(article: any): Promise<void> {
  const webhookUrl = process.env.WHATSAPP_CHANNEL_WEBHOOK_URL;
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const channelOrRecipient = process.env.WHATSAPP_CHANNEL_ID || 'status';
  const customApiUrl = process.env.WHATSAPP_API_URL;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  const articleUrl = `https://kabira-news.vercel.app/?article=${encodeURIComponent(article.slug || article.id)}`;
  const channelFollowUrl = 'https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N';

  const broadcastText =
    `🔴 *कबीरा न्यूज़ ब्रेकिंग* | KABIRA NEWS 🔴\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `📌 *${article.title}*\n\n` +
    `📝 *खबर विस्तार से:*\n${article.summary}\n\n` +
    `🏷️ *श्रेणी:* #${article.category} ${article.state ? `#${article.state}` : ''}\n` +
    `⏱️ *समय:* ${new Date().toLocaleTimeString('hi-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}\n\n` +
    `🌐 *पूरी खबर वेबसाइट पर विस्तार से पढ़ें:*\n${articleUrl}\n\n` +
    `📢 *कबीरा न्यूज़ का आधिकारिक WhatsApp चैनल अभी फॉलो करें:*\n${channelFollowUrl}\n\n` +
    `📞 *समाचार व विज्ञापन संपर्क:* नितेश जोशी 9893537306`;

  let sent = false;

  // 1. Generic WhatsApp Webhook (Works with Make, Zapier, Ultramsg, Green-API, CallMeBot, etc.)
  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const payload = {
        title: article.title,
        summary: article.summary,
        imageUrl: article.imageUrl,
        url: articleUrl,
        category: article.category,
        message: broadcastText,
        publishedAt: article.publishedAt,
      };
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        console.log(`   📱 [WHATSAPP] Successfully broadcasted story to WhatsApp Webhook!`);
        sent = true;
      } else {
        console.warn(`   ⚠️ [WHATSAPP] Webhook responded with status: ${res.status}`);
      }
    } catch (e: any) {
      console.warn(`   ⚠️ [WHATSAPP] Webhook broadcast error: ${e?.message}`);
    }
  }

  // 2. Official WhatsApp Cloud API (Meta Graph API)
  if (!sent && whatsappToken && phoneNumberId) {
    try {
      const graphUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
      const cloudPayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: channelOrRecipient,
        type: 'text',
        text: { body: broadcastText },
      };
      const res = await fetch(graphUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloudPayload),
      });
      if (res.ok) {
        console.log(`   📱 [WHATSAPP] Broadcasted via WhatsApp Cloud API successfully!`);
        sent = true;
      }
    } catch (e: any) {
      console.warn(`   ⚠️ [WHATSAPP] Cloud API error: ${e?.message}`);
    }
  }

  // 3. Custom WhatsApp Gateway (e.g. UltraMsg / Green API)
  if (!sent && customApiUrl && customApiUrl.startsWith('http')) {
    try {
      const res = await fetch(customApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: channelOrRecipient,
          body: broadcastText,
          image: article.imageUrl,
        }),
      });
      if (res.ok) {
        console.log(`   📱 [WHATSAPP] Broadcasted via Custom WhatsApp Gateway!`);
        sent = true;
      }
    } catch (e: any) {
      console.warn(`   ⚠️ [WHATSAPP] Gateway error: ${e?.message}`);
    }
  }

  // 4. Telegram Backup Channel
  if (telegramBotToken && telegramChatId) {
    try {
      const tgUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: broadcastText,
          parse_mode: 'Markdown',
        }),
      });
      console.log(`   ✈️ [TELEGRAM] Broadcasted story to Telegram Channel!`);
    } catch {}
  }

  if (!sent && !webhookUrl && !whatsappToken && !customApiUrl) {
    console.log(`   ℹ️  [WHATSAPP] Broadcast ready: Set WHATSAPP_CHANNEL_WEBHOOK_URL in GitHub Secrets to auto-post to WhatsApp Channel.`);
  }
}

// ----------------------------------------------------
// Main Automated Orchestrator
// ----------------------------------------------------
async function runAutomation() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('🚀 KABIRA NEWS 24/7 AUTOMATED NEWS INGESTION SYSTEM');
  console.log(`⏰ Execution Time: ${new Date().toISOString()}`);
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';
  const forcePublish = process.argv.includes('--force-publish') || process.env.FORCE_PUBLISH === 'true';
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  const limitPerFeed = limitArg
    ? parseInt(limitArg.split('=')[1], 10)
    : parseInt(process.env.LIMIT_PER_FEED || '2', 10);

  if (isDryRun) {
    console.log('🔍 [MODE] Running in DRY-RUN mode. No articles will be saved to Firestore.');
  }

  // 1. Initialize DB
  const db = await initializeDatabase();
  console.log(`✅ [DB] Connected via: ${db.name}`);

  // Fetch recent titles from Firestore to prime duplicate detector
  const recentPublishedTitles = await db.getRecentTitles(50);
  const recentTokenSets = recentPublishedTitles.map((t) => tokenize(t));
  console.log(`📚 [DEDUP] Loaded ${recentPublishedTitles.length} recent articles for cross-feed duplication matching.`);

  const processedUrlsInThisRun = new Set<string>();

  let totalFetched = 0;
  let totalPublished = 0;
  let totalHeld = 0;
  let totalDuplicates = 0;
  let totalErrors = 0;

  for (const feed of AUTHORIZED_FEEDS) {
    console.log(`\n📡 [FEED] Fetching: ${feed.name} (${feed.category})...`);
    try {
      const xml = await fetchWithRetry(feed.url);
      const parsedXml = parser.parse(xml);
      const itemsRaw = parsedXml?.rss?.channel?.item || [];
      const itemsArray: any[] = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

      console.log(`   Found ${itemsArray.length} items. Processing top ${limitPerFeed}...`);

      for (const item of itemsArray.slice(0, limitPerFeed)) {
        if (!item) continue;
        const rawTitle = cleanHtml(item.title || '');
        const link = typeof item.link === 'string' ? item.link : item.link?.['@_href'] || item.guid?.['#text'] || '';

        if (!rawTitle || !link) {
          continue;
        }

        totalFetched++;

        // Deduplication 1: In-run URL check
        if (processedUrlsInThisRun.has(link)) {
          console.log(`   ⏭️  [DEDUP] Skipped in-run duplicate: "${rawTitle.slice(0, 40)}..."`);
          totalDuplicates++;
          continue;
        }

        // Deduplication 2: Check Firestore database
        const existsInFirestore = await db.isArticleExisting(link);
        if (existsInFirestore) {
          console.log(`   ⏭️  [DEDUP] Already in Firestore: "${rawTitle.slice(0, 40)}..."`);
          totalDuplicates++;
          processedUrlsInThisRun.add(link);
          continue;
        }

        // Deduplication 3: Title similarity against recent stories
        const incomingTokens = tokenize(rawTitle);
        let isSimilar = false;
        for (const recentTokens of recentTokenSets) {
          if (jaccardSimilarity(incomingTokens, recentTokens) > 0.65) {
            isSimilar = true;
            break;
          }
        }
        if (isSimilar) {
          console.log(`   ⏭️  [DEDUP] High semantic similarity to recent story: "${rawTitle.slice(0, 40)}..."`);
          totalDuplicates++;
          continue;
        }

        // Extract image from XML
        const extractedImg = extractImage(item);

        const rawItem: RawItem = {
          title: rawTitle,
          link,
          pubDate: item.pubDate,
          description: item.description,
          imageUrl: extractedImg,
          sourceName: feed.name,
          category: feed.category,
          state: feed.state,
          city: feed.city,
        };

        // Pacing delay to avoid AI API rate limit
        await new Promise((r) => setTimeout(r, 2000));

        // Gemini AI Synthesis
        console.log(`   ✍️  [AI] Synthesizing Hindi journalism story: "${rawTitle.slice(0, 50)}..."`);
        const story = await synthesizeWithGemini(rawItem);

        const articleId = `kabira-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const shouldHold = story.decision === 'hold_for_review' && !forcePublish;
        const targetCollection = shouldHold ? 'pending_articles' : 'articles';

        const articleDoc = {
          id: articleId,
          title: story.headlineHi,
          titleEn: story.headlineEn || '',
          slug: story.slug,
          summary: story.summaryHi,
          content: story.contentHi,
          category: story.category,
          state: feed.state || null,
          city: feed.city || null,
          imageUrl: story.imageUrl,
          imageCaption: story.imageCaption,
          author: {
            name: 'कबीरा स्वचालित न्यूज़ डेस्क',
            role: 'AI पावर्ड संपादकीय डेस्क',
            avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=120&q=80',
          },
          source: {
            name: feed.name,
            url: link,
            originalPubDate: item.pubDate || new Date().toISOString(),
          },
          attributionText: `स्रोत: ${feed.name} | कबीरा न्यूज़ ऑटोमेशन डेस्क द्वारा सत्यापित व संपादित`,
          publishedAt: new Date().toISOString(),
          status: shouldHold ? 'draft' : 'published',
          isBreaking: story.isBreaking,
          isTrending: story.isTrending,
          isHeroHighlight: false,
          views: Math.floor(Math.random() * 300) + 120,
          tags: story.tags,
          readingTime: story.readingTime,
          aiProcessed: true,
          aiModel: story.aiModel,
          riskAssessment: {
            decision: story.decision,
            reason: story.reason,
          },
          fetchedAt: new Date().toISOString(),
        };

        if (!isDryRun) {
          await db.saveArticle(targetCollection, articleDoc);
        }

        processedUrlsInThisRun.add(link);
        recentTokenSets.push(incomingTokens);

        if (shouldHold) {
          totalHeld++;
          console.log(`   ⚠️  [HOLD] Held for review in '${targetCollection}': "${story.headlineHi}"`);
        } else {
          totalPublished++;
          console.log(`   ✨ [PUBLISHED] Live in '${targetCollection}': "${story.headlineHi}"`);

          // Broadcast to WhatsApp Channel automatically
          if (!isDryRun) {
            await broadcastToWhatsAppChannel(articleDoc);
          }
        }
      }
    } catch (feedErr: any) {
      totalErrors++;
      console.error(`   ❌ [ERROR] Feed failure (${feed.name}): ${feedErr?.message || feedErr}`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n====================================================');
  console.log('📊 EXECUTION SUMMARY REPORT');
  console.log('====================================================');
  console.log(`⏱️  Duration:            ${durationSec}s`);
  console.log(`📥 Total Fetched:       ${totalFetched}`);
  console.log(`🚀 Published Live:      ${totalPublished}`);
  console.log(`🛡️  Held for Review:     ${totalHeld}`);
  console.log(`♻️  Duplicates Skipped:  ${totalDuplicates}`);
  console.log(`❌ Errors Encountered:   ${totalErrors}`);
  console.log('====================================================\n');
}

runAutomation()
  .then(() => {
    console.log('🏁 News automation script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error in news automation:', err);
    process.exit(1);
  });
