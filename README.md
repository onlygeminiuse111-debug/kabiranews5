# कबीरा न्यूज़ (Kabira News) - 24/7 AI स्वचालित हिंदी समाचार पोर्टल

एक आधुनिक, निष्पक्ष और विश्वसनीय हिंदी डिजिटल समाचार पोर्टल, जिसे **React 19**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, **Gemini 3.8 Flash** और **Firebase** (Firestore, Auth, Storage, Cloud Functions) के साथ 24/7 निरंतर स्वचालित न्यूज़ एकत्रीकरण एवं प्रकाशन प्रणाली के साथ तैयार किया गया है।

---

## 🌟 प्रमुख विशेषताएं (Key Features)

### 1. 🤖 24/7 स्वचालित समाचार एकत्रीकरण एवं प्रकाशन इंजन (Automated Aggregation Engine)
- **स्वचालित RSS एवं न्यूज़ API इनजेशन**:
  - राष्ट्रीय समाचार (देश), अंतरराष्ट्रीय (विदेश), मध्य प्रदेश (भोपाल, इंदौर), राजनीति व संसद, शिक्षा व करियर, खेल (क्रिकेट), व्यापार (शेयर बाज़ार), तकनीक (AI), और सिनेमा व मनोरंजन।
- **जेमिनी 3.8 फ़्लैश AI सिंथेसिस**:
  - समाचार के मूल तथ्यों का विश्लेषण कर मौलिक, शुद्ध और स्वाभाविक हिंदी (देवनागरी लिपि) में पुनर्लेखन।
  - आकर्षक व तथ्यात्मक शीर्षक, संक्षिप्त सारांश, संपूर्ण विवरण, श्रेणियां, स्थान पहचान (राज्य/शहर), और एसईओ (SEO) टैग्स का स्वचालित निर्माण।
- **डुप्लीकेट डिटेक्शन (Jaccard Similarity & URL Matching)**:
  - पूर्व में प्रकाशित समाचारों के साथ टोकन समानता (Token overlap similarity >= 0.6) और लिंक विश्लेषण द्वारा दोहराव की रोकथाम।
- **संपादकीय संवेदनशीलता एवं जोखिम सुरक्षा द्वार (Editorial Risk Gating)**:
  - सांप्रदायिक/धार्मिक तनाव, जीवित व्यक्तियों पर अपराध आरोप, चुनावी धांधली दावे, स्वास्थ्य आपातकाल अफवाहों जैसी संवेदनशील ख़बरों को स्वतः लाइव नहीं किया जाता; उन्हें वरिष्ठ संपादक की समीक्षा हेतु **Review Queue** में रोका जाता है।
  - सामान्य व सत्यापित समाचार (खेल परिणाम, अंतरिक्ष/विज्ञान, व्यापार, मौसम, सरकारी आदेश) 24/7 बिना मानवीय हस्तक्षेप के स्वतः लाइव होते हैं।
- **कॉपीराइट सुरक्षा व स्रोत आभार (Attribution)**:
  - कभी भी कॉपीराइट सामग्री की हूबहू नकल नहीं की जाती। प्रत्येक लेख के अंत में मूल स्रोत का नाम, यूआरएल, प्रकाशन समय और सत्यापन मेटाडेटा स्पष्ट रूप से दर्ज किया जाता है।

### 2. 🎛️ एडमिन ऑटोमेशन कंट्रोल रूम (Admin Automation Room)
- **आपातकालीन ठहराव (Emergency Pause / Resume Switch)**: किसी भी समय ऑटोमेशन को रोकने या पुनः प्रारंभ करने की तत्काल सुविधा।
- **प्रकाशन आवृत्ति नियंत्रण (Frequency Selector)**: 5 मिनट, 10 मिनट, 15 मिनट, 30 मिनट अथवा 60 मिनट की अवधि निर्धारित करें।
- **कस्टम RSS स्रोत प्रबंधन**: नए अधिकृत समाचार स्रोत जोड़ें, चालू/बंद करें या हटाएं।
- **संवेदनशील समीक्षा कतार (Pending Review Queue)**: रोके गए समाचारों की समीक्षा, मूल लिंक की जांच, और 1-क्लिक में **"स्वीकार व लाइव करें"** या **"अस्वीकार करें"**।
- **रीयल-टाइम ऑडिट लॉग्स (Realtime Audit Logs)**: संग्रहण, डुप्लीकेट फ़िल्टर, एआई प्रोसेसिंग और पब्लिशिंग का विस्तृत इतिहास।

### 3. 📰 प्रीमियम पाठक अनुभव एवं यूआई (Modern Hindi News UI)
- **फिक्स्ड ब्रेकिंग न्यूज़ टिकर**: वास्तविक समय की ताज़ा ब्रेकिंग न्यूज़।
- **ट्रेंडिंग बार**: हैशटैग्स आधारित ट्रेंडिंग विषयों का त्वरित चयन।
- **ऑडियो वॉइस न्यूज़ रीडर**: शुद्ध हिंदी उच्चारण में समाचार सुनने की सुविधा (Web Speech API)।
- **राज्य व शहर चयन**: मध्य प्रदेश (भोपाल, इंदौर, ग्वालियर, जबलपुर), उत्तर प्रदेश, दिल्ली आदि के लिए विशेष रीजनल चयन।
- **डार्क / लाइट मोड व फॉन्ट आकार नियंत्रण**: आरामदायक पठन के लिए A- / A+ ज़ूम और डार्क थीम।
- **ई-पेपर एवं डिजिटल संस्करण**: भोपाल, इंदौर, दिल्ली, लखनऊ संस्करण।
- **इंस्टॉलेबल PWA (Progressive Web App)**: ऑफ़लाइन कैशिंग और मोबाइल ऐप जैसा अनुभव।
- **सोशल शेयरिंग व टिप्पणियां**: WhatsApp, Telegram, Twitter/X, Facebook शेयर व पाठक टिप्पणियां।

---

## 🏗️ वास्तुकला (System Architecture)

```
[RSS Feeds & News APIs]
          │
          ▼
[Feed Ingestion Engine] ───> [Deduplication Engine (Jaccard >= 0.6)]
                                          │ (Fresh only)
                                          ▼
                         [Gemini 3.8 Flash (Server-Side)]
                         - Original Hindi Synthesis
                         - Category & Location Extraction
                         - Strict Risk & Sensitivity Check
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │                                             │
      [Decision: hold_for_review]                  [Decision: auto_publish]
                   │                                             │
                   ▼                                             ▼
       [Admin Review Queue]                        [Firestore Database ('articles')]
     (Senior Editor Approval)                                    │
                   │ (Approved)                                  ▼
                   └───────────────────────────────────> [Live Readers (Web / PWA)]
```

---

## 🚀 परिनियोजन (Deployment Guide)

### विकल्प A: Vercel परिनियोजन (Frontend & Fullstack API)

1. रिपॉजिटरी से डाउनलोड की गई **`kabira-news.zip`** फ़ाइल को निकालें या अपने GitHub खाते में पुश करें।
2. [vercel.com](https://vercel.com) पर नया प्रोजेक्ट इम्पोर्ट करें।
3. **Environment Variables** में निम्नलिखित जोड़ें:

```env
# Gemini AI Secret (Server-side Only)
GEMINI_API_KEY="your-gemini-api-key"

# Firebase Public Config
VITE_FIREBASE_API_KEY="AIzaSyDB5VYnUMA9nneECJuDi8huWOphxxWE-VA"
VITE_FIREBASE_AUTH_DOMAIN="tactile-sweep-464417-p2.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tactile-sweep-464417-p2"
VITE_FIREBASE_STORAGE_BUCKET="tactile-sweep-464417-p2.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="943501902947"
VITE_FIREBASE_APP_ID="1:943501902947:web:6383e4f86193ab9d29e456"

# App Hosting URL
APP_URL="https://your-kabira-news.vercel.app"
```

4. **Deploy** पर क्लिक करें। `vercel.json` रूट कॉन्फ़िगरेशन द्वारा संपूर्ण पोर्टल सक्रिय हो जाएगा।

---

### विकल्प B: Firebase Cloud Functions व Cloud Scheduler (सर्वरलेस 24/7)

`functions/` डायरेक्टरी में पूर्णतः कॉन्फ़िगर की गई **Firebase Cloud Functions v2** उपलब्ध है।

```bash
cd functions
npm install
firebase deploy --only functions
```

- यह Google Cloud Scheduler के माध्यम से हर 15 मिनट (`every 15 minutes`, Asia/Kolkata timezone) पर स्वतः बैकग्राउंड में समाचार संग्रहण, एआई रीराइटिंग और फायरस्टोर में प्रकाशन निष्पादित करता है।

---

## 🔒 फ़ायरबेस सुरक्षा नियम (Firebase Security Rules)

### Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    match /articles/{articleId} {
      allow read: if true;
      allow create, update, delete: if isAuthenticated();
    }
    match /pending_articles/{articleId} {
      allow read, write: if isAuthenticated();
    }
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.resource.data.commentText is string;
      allow update, delete: if isAuthenticated();
    }
    match /users/{userId} {
      allow read, write: if isAuthenticated();
    }
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
```

---

## 💻 स्थानीय विकास (Local Development)

```bash
# 1. निर्भरताएं स्थापित करें
npm install

# 2. 24/7 ऑटोमेशन और विट सर्वर चलाएं
npm run dev

# 3. प्रोडक्शन बिल्ड जांचें
npm run build
```

पोर्टल `http://localhost:3000` पर उपलब्ध होगा। एडमिन डैशबोर्ड के लिए शीर्ष नेविगेशन बार में **"संपादक"** बटन पर क्लिक करें।

---

## 📝 कानूनी एवं नीति अनुपालन
© 2026 कबीरा न्यूज़ (Kabira News). सर्वाधिकार सुरक्षित।  
सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश और डिजिटल मीडिया आचार संहिता) नियम 2021 के अनुरूप।
