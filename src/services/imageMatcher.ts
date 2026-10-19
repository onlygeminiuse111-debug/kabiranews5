/**
 * High-Precision Forceful Thematic Image Matcher for Kabira News
 * Ensures every single news article FORCIBLY displays an accurate, contextually relevant
 * high-resolution image based on entities, topics, and keywords detected in the article headline and content.
 */

interface TopicRule {
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

  // 2. Football & Other Sports
  {
    id: 'sports_general',
    name: 'Football & Olympic Sports',
    keywords: [
      'football', 'फुटबॉल', 'hockey', 'हॉकी', 'ओलंपिक', 'olympics', 'medal', 'पदक',
      'athletics', 'टेनिस', 'tennis', 'नीरज चोपड़ा', 'कुश्ती', 'wrestling', 'बैडमिंटन', 'badminton'
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
      'cinema', 'बॉलीवुड', 'bollywood', 'गदर', 'gadar', 'शाहरुख', 'शाहरुख खान', 'सलमान',
      'सलमान खान', 'दीपिका', 'आलिया', 'अक्षय', 'अमिताभ', 'एक्टर', 'अभिनेता', 'अभिनेत्री',
      'बॉक्स ऑफिस', 'box office', 'ट्रेलर', 'trailer', 'ओटीटी', 'ott', 'शूटिंग'
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
      'फैसला', 'जमानत', 'bail', 'वकील', 'lawyer', 'संविधान'
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
      'डीजीपी', 'मुठभेड़', 'हादसा', 'धोखाधड़ी', 'साइबर फ्रॉड', 'रिश्वत'
    ],
    image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
  },

  // 7. Indian Politics - Modi, Parliament, Lok Sabha, Central Govt
  {
    id: 'politics_modi_parliament',
    name: 'Modi & Parliament',
    keywords: [
      'मोदी', 'modi', 'प्रधानमंत्री', 'pm', 'संसद', 'parliament', 'लोकसभा', 'loksabha',
      'राज्यसभा', 'rajyasabha', 'अमित शाह', 'amit shah', 'bjp', 'भाजपा', 'कांग्रेस', 'congress',
      'राहुल गांधी', 'rahul gandhi', 'चुनाव', 'election', 'मंत्रिमंडल', 'cabinet', 'राजभवन',
      'राष्ट्रपति', 'द्रौपदी मुर्मू', 'केजरीवाल', 'योगी', 'yogi'
    ],
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  },

  // 8. World Politics - Trump, White House, USA, Russia, Europe
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
      'टैक्स', 'tax', 'निवेश', 'ipo', 'म्युचुअल फंड', 'वित्त मंत्री'
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

  // 15. Education, Exams, UPSC, Results & Jobs
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

  // 17. Accidents, Highway, Trains & Disasters
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

// Fallback images strictly per category
export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
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

/**
 * Resolves the most accurate and high-relevance image for an article.
 * 1. Checks if the article already has an authentic publisher CDN image. If so, uses that authentic photo.
 * 2. If image is missing, empty, or a stock placeholder, scans headline and summary against TOPIC_RULES.
 * 3. Falls back to verified category image if no specific entity matches.
 */
export function getSmartArticleImage(article: {
  imageUrl?: string;
  title?: string;
  summary?: string;
  category?: string;
}): string {
  const existingUrl = article.imageUrl?.trim();

  // 1. If article has an authentic publisher CDN image (from Aaj Tak, NDTV, Bhaskar, BBC, etc.)
  // We keep it because that is the genuine news photograph!
  if (
    existingUrl &&
    existingUrl.startsWith('http') &&
    !existingUrl.includes('placeholder') &&
    !existingUrl.includes('default') &&
    !existingUrl.includes('images.unsplash.com')
  ) {
    return existingUrl;
  }

  const searchText = `${article.title || ''} ${article.summary || ''}`.toLowerCase();

  // 2. FORCIBLY check specific topic rules for exact match!
  for (const rule of TOPIC_RULES) {
    for (const kw of rule.keywords) {
      if (searchText.includes(kw.toLowerCase())) {
        return rule.image;
      }
    }
  }

  // 3. If article had a valid Unsplash image already assigned, keep it
  if (existingUrl && existingUrl.startsWith('https://images.unsplash.com/')) {
    return existingUrl;
  }

  // 4. Category Fallback
  const cat = (article.category || 'national').toLowerCase();
  return CATEGORY_DEFAULT_IMAGES[cat] || CATEGORY_DEFAULT_IMAGES.national;
}
