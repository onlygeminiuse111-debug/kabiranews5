# 🚀 कबीरा न्यूज़ (Kabira News) - GitHub Actions & Vercel Deployment Guide

यह दस्तावेज़ कबीरा न्यूज़ पोर्टल को **GitHub** पर अपलोड करने, **GitHub Actions** द्वारा 24/7 स्वचालित समाचार प्रकाशन संचालित करने, और **Vercel** पर वेबसाइट लाइव करने की सम्पूर्ण व प्रामाणिक निर्देशिका है।

---

## 📑 विषय-सूची (Table of Contents)
1. [वास्तुकला व प्राथमिक शेड्यूलर अनुशंसा (Primary Scheduler Recommendation)](#1-वास्तुकला-व-प्राथमिक-शेड्यूलर-अनुशंसा)
2. [गिटहब पर कोड अपलोड करने के चरण (GitHub Upload Steps)](#2-गिटहब-पर-कोड-अपलोड-करने-के-चरण)
3. [आवश्यक GitHub Actions Secrets व उन्हें प्राप्त करने की विधि](#3-आवश्यक-github-actions-secrets-व-उन्हें-प्राप्त-करने-की-विधि)
4. [Firebase अनुमतियां व सुरक्षा नियम (Firebase Permissions)](#4-firebase-अनुमतियां-व-सुरक्षा-नियम)
5. [GitHub Actions वर्कफ़्लो को सक्रिय व टेस्ट करना](#5-github-actions-वर्कफ़्लो-को-सक्रिय-व-टेस्ट-करना)
6. [Vercel पर वेबसाइट डिप्लॉयमेंट (Vercel Deployment Guide)](#6-vercel-पर-वेबसाइट-डिप्लॉयमेंट)
7. [GitHub Actions शेड्यूलिंग सीमाएं व सावधानियां](#7-github-actions-शेड्यूलिंग-सीमाएं-व-सावधानियां)
8. [अंतिम चेकलिस्ट (Pre-Launch Checklist)](#8-अंतिम-चेकलिस्ट)

---

## 1. वास्तुकला व प्राथमिक शेड्यूलर अनुशंसा

### 💡 अनुशंसित प्राथमिक शेड्यूलर: **GitHub Actions**
कबीरा न्यूज़ में 3 संभावित शेड्यूलिंग माध्यम उपलब्ध हैं:
1. **GitHub Actions (`.github/workflows/auto-news.yml`)** — 🌟 **अनुशंसित (Recommended Primary)**
   - **कारण**: 
     - पूर्णतः निःशुल्क (प्रत्येक GitHub खाते को प्रति माह 2,000 मिनट मुफ़्त मिलते हैं)।
     - किसी भी Google Cloud Paid/Blaze प्लान की आवश्यकता नहीं।
     - 15 मिनट तक की समय-सीमा (Time Limit) मिलती है, जिससे सभी 9 RSS फ़ीड्स और जेमिनी AI प्रोसेसिंग बिना टाइमआउट के पूरी होती है।
     - विस्तृत कंसोल लॉग्स, मैनुअल ट्रिगर (`workflow_dispatch`), और ड्राई-रन मोड उपलब्ध हैं।
2. **Firebase Cloud Functions (`functions/src/index.ts`)**:
   - इसके लिए Google Cloud का **Blaze (Pay-as-you-go)** प्लान और Cloud Scheduler आवश्यक है। यदि आप क्रेडिट कार्ड या बिलिंग नहीं जोड़ना चाहते, तो इसे डिप्लॉय न करें।
3. **Vercel Crons (`/api/cron`)**:
   - Vercel के निःशुल्क हॉबी प्लान पर क्रॉन दिन में केवल 1 बार चल सकता है और सर्वरलेस फंक्शन की 10-सेकंड की कठोर समय-सीमा होती है जो भारी RSS व AI कॉल्स के लिए अपर्याप्त है।

> ⚠️ **दोहराव (Duplicate Prevention) चेतावनी**:  
> समाचारों के दोहराव और अनावश्यक AI कोटा खपत से बचने के लिए **केवल एक ही शेड्यूलर (GitHub Actions)** को सक्रिय रखें।

---

## 2. गिटहब पर कोड अपलोड करने के चरण

Vercel सीधे ज़िप (ZIP) फ़ाइल अपलोड का समर्थन नहीं करता; वह केवल **GitHub/GitLab/Bitbucket** रिपॉजिटरी या **Vercel CLI** से डिप्लॉयमेंट स्वीकार करता है।

### चरण 1: GitHub पर नई रिपॉजिटरी बनाएं
1. [github.com](https://github.com) पर लॉगिन करें।
2. ऊपर दाईं ओर **`+`** आइकन पर क्लिक कर **`New repository`** चुनें।
3. रिपॉजिटरी का नाम दें: `kabira-news`।
4. दृश्यता को **Public** या **Private** (अपनी इच्छानुसार) रखें।
5. "Initialize this repository with a README" को **अनचेक (Unchecked)** रहने दें।
6. **Create repository** पर क्लिक करें।

### चरण 2: अपने कंप्यूटर से प्रोजेक्ट अपलोड करें
अपने टर्मिनल / कमांड प्रॉम्प्ट में प्रोजेक्ट डायरेक्टरी खोलें और निम्न कमांड्स चलाएं:

```bash
# यदि गिट इनिशियलाइज़ नहीं है
git init

# सभी फाइलों को स्टेज करें (node_modules व .env स्वतः सुरक्षित रूप से बाहर रहेंगे)
git add .

# पहला कमिट बनाएं
git commit -m "feat: Kabira News 24/7 automated portal with GitHub Actions and Vercel"

# मुख्य शाखा को main नाम दें
git branch -M main

# अपनी गिटहब रिपॉजिटरी का यूआरएल जोड़ें (YOUR_USERNAME को बदलें)
git remote add origin https://github.com/YOUR_USERNAME/kabira-news.git

# कोड को गिटहब पर पुश करें
git push -u origin main
```

---

## 3. आवश्यक GitHub Actions Secrets व उन्हें प्राप्त करने की विधि

GitHub Actions को संवेदनशील क्रेडेंशियल्स सुरक्षित रूप से उपलब्ध कराने के लिए रिपॉजिटरी में Secrets जोड़ें:

1. अपनी GitHub रिपॉजिटरी में जाएं।
2. **Settings** टैब पर क्लिक करें।
3. बाईं साइडबार में **Secrets and variables** > **Actions** चुनें।
4. **New repository secret** बटन पर क्लिक करें।

नीचे दी गई तालिका के अनुसार सीक्रेट्स जोड़ें:

| Secret का नाम | विवरण | कैसे प्राप्त करें |
|---|---|---|
| `GEMINI_API_KEY` | गूगल जेमिनी AI एपीआई कुंजी (समाचार रीराइटिंग हेतु) | [Google AI Studio](https://aistudio.google.com/app/apikey) से मुफ़्त में 'Create API key' करें। |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | फ़ायरबेस एडमिन सर्विस अकाउंट JSON (सर्वर-साइड राइट हेतु) | [Firebase Console](https://console.firebase.google.com) > Project Settings > **Service accounts** > **Generate new private key**। डाउनलोड की गई पूरी JSON फ़ाइल का टेक्स्ट पेस्ट करें। |
| `FIREBASE_PROJECT_ID` | फ़ायरबेस प्रोजेक्ट आईडी | `tactile-sweep-464417-p2` |
| `FIREBASE_DATABASE_ID` | कस्टम फ़ायरस्टोर डेटाबेस आईडी | `ai-studio-kabiranews-7d7b1222-a3c8-46b5-b4a5-fea61b7ac7ed` |
| `VITE_FIREBASE_API_KEY` | फ़ायरबेस वेब API Key (वैकल्पिक फॉलबैक) | `.env.example` अथवा `firebase-applet-config.json` से लें। |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth Domain | `tactile-sweep-464417-p2.firebaseapp.com` |
| `VITE_FIREBASE_STORAGE_BUCKET`| स्टोरेज बकेट | `tactile-sweep-464417-p2.firebasestorage.app` |
| `VITE_FIREBASE_APP_ID` | वेब ऐप आईडी | `1:943501902947:web:6383e4f86193ab9d29e456` |
| `WHATSAPP_CHANNEL_WEBHOOK_URL`| व्हाट्सएप चैनल ऑटोमेशन वेबहुक (वैकल्पिक) | Make.com, Zapier, Ultramsg, Green-API, या CallMeBot से प्राप्त वेबहुक URL। हर प्रकाशित खबर स्वतः आपके व्हाट्सएप चैनल पर भेजी जाएगी। |
| `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp Cloud API Token (वैकल्पिक) | [Meta for Developers](https://developers.facebook.com) WhatsApp Cloud API से प्राप्त टोकन। |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business Phone Number ID | Meta App डैशबोर्ड से प्राप्त फ़ोन नंबर आईडी। |
| `WHATSAPP_CHANNEL_ID` | WhatsApp चैनल आईडी या ग्रुप आईडी | चैनल का आईडी या स्टेटस ब्रॉडकास्ट कोड। |
| `TELEGRAM_BOT_TOKEN` | टेलीग्राम बॉट टोकन (वैकल्पिक बैकअप) | @BotFather से प्राप्त बॉट टोकन। |
| `TELEGRAM_CHAT_ID` | टेलीग्राम चैनल यूजरनेम | `@yourchannel` |

---

### 📲 व्हाट्सएप चैनल (WhatsApp Channel) पर ऑटोमैटिक न्यूज़ ब्रॉडकास्टिंग कैसे सेट करें

कबीरा न्यूज़ का ऑटोमेशन इंजन हर नई खबर को फ़ायरस्टोर में प्रकाशित करने के तुरंत बाद आपके **WhatsApp चैनल** पर स्वतः शेयर करता है।

#### सबसे आसान तरीका: नि:शुल्क Webhook (Make / Zapier / Ultramsg / CallMeBot)
1. **Make.com या Zapier** पर एक साधारण 'Custom Webhook' ट्रिगर बनाएं।
2. अगला स्टेप 'Send WhatsApp Message' चुनें (जिसमें आपके चैनल का लिंक या ब्रॉडकास्ट ग्रुप जुड़ा हो)।
3. प्राप्त Webhook URL को कॉपी करें।
4. GitHub रिपॉजिटरी > **Settings** > **Secrets and variables** > **Actions** में जाकर Secret बनाएं:
   - Name: `WHATSAPP_CHANNEL_WEBHOOK_URL`
   - Value: आपका Webhook URL (जैसे `https://hook.eu1.make.com/...` या `https://api.ultramsg.com/...`)
5. इसके बाद हर 30 मिनट में GitHub Actions चलने पर ताज़ा खबर अपने आप आपके WhatsApp चैनल पर पोस्ट हो जाएगी!


## 4. Firebase अनुमतियां व सुरक्षा नियम

1. **Firestore Database**:
   - प्रोजेक्ट पहले से ही `ai-studio-kabiranews-7d7b1222-a3c8-46b5-b4a5-fea61b7ac7ed` डेटाबेस के साथ कॉन्फ़िगर है।
2. **Firestore Security Rules**:
   - रिपॉजिटरी में मौजूद `firestore.rules` फ़ाइल यह सुनिश्चित करती है कि सार्वजनिक पाठक समाचार पढ़ सकें, और प्रमाणित एडमिन/संपादक या बैकएंड पाइपलाइन सत्यापित समाचार प्रकाशित कर सकें।
3. **Admin SDK Privileges**:
   - `FIREBASE_SERVICE_ACCOUNT_KEY` का उपयोग करने पर GitHub Actions को फ़ायरस्टोर में सीधी एडमिन अनुमति मिलती है, जिससे सुरक्षा नियमों को तोड़े बिना सीधे `articles` और `pending_articles` में राइट किया जा सकता है।

---

## 5. GitHub Actions वर्कफ़्लो को सक्रिय व टेस्ट करना

### वर्कफ़्लो को टेस्ट करने के चरण:
1. अपनी रिपॉजिटरी में **Actions** टैब पर क्लिक करें।
2. यदि Actions बंद हैं, तो **"I understand my workflows, go ahead and enable them"** पर क्लिक करें।
3. बाईं सूची में **"Kabira News 24/7 Automated Publisher"** पर क्लिक करें।
4. दाईं ओर स्थित **Run workflow** ड्रॉपडाउन बटन पर क्लिक करें।
5. परीक्षण हेतु:
   - `dry_run`: `true` चुन सकते हैं (बिना डेटाबेस में लिखे जांच करने के लिए)।
   - `limit_per_feed`: `1` चुन सकते हैं (त्वरित परीक्षण हेतु)।
6. हरे रंग के **Run workflow** बटन पर क्लिक करें।
7. कुछ ही सेकंडों में नया जॉब शुरू हो जाएगा। उस पर क्लिक करके लाइव लॉग्स देखें।

---

## 6. Vercel पर वेबसाइट डिप्लॉयमेंट

### चरण 1: Vercel पर प्रोजेक्ट जोड़ें
1. [vercel.com](https://vercel.com) पर जाएं और लॉगिन करें।
2. **Add New...** > **Project** पर क्लिक करें।
3. अपनी `kabira-news` GitHub रिपॉजिटरी को चुनें और **Import** पर क्लिक करें।

### चरण 2: बिल्ड सेटिंग्स
- **Framework Preset**: Vite (स्वतः पहचाना जाएगा)
- **Root Directory**: `./` (खाली रहने दें)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### चरण 3: पर्यावरण चर (Environment Variables) जोड़ें
Vercel प्रोजेक्ट सेटिंग्स में **Environment Variables** सेक्शन में निम्न चर जोड़ें:
- `VITE_FIREBASE_API_KEY`: `AIzaSyDB5VYnUMA9nneECJuDi8huWOphxxWE-VA`
- `VITE_FIREBASE_AUTH_DOMAIN`: `tactile-sweep-464417-p2.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID`: `tactile-sweep-464417-p2`
- `VITE_FIREBASE_STORAGE_BUCKET`: `tactile-sweep-464417-p2.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: `943501902947`
- `VITE_FIREBASE_APP_ID`: `1:943501902947:web:6383e4f86193ab9d29e456`
- `VITE_FIREBASE_DATABASE_ID`: `ai-studio-kabiranews-7d7b1222-a3c8-46b5-b4a5-fea61b7ac7ed`
- `GEMINI_API_KEY`: आपका जेमिनी API Key

### चरण 4: Deploy
**Deploy** पर क्लिक करें। 1-2 मिनट में आपकी कबीरा न्यूज़ वेबसाइट लाइव (Production URL) हो जाएगी।

---

## 7. GitHub Actions शेड्यूलिंग सीमाएं व सावधानियां

1. **शेड्यूलिंग समय (Cron Execution Window)**:
   - GitHub Actions का क्रॉन जॉब UTC समय के अनुसार चलता है।
   - GitHub के आधिकारिक दस्तावेज़ों के अनुसार, पीक घंटों के दौरान शेड्यूल्ड जॉब्स में 5-15 मिनट का सामान्य कतार विलंब (Queue Delay) हो सकता है।
2. **निष्क्रिय रिपॉजिटरी नियम (Repository Inactivity Policy)**:
   - यदि किसी पब्लिक रिपॉजिटरी में 60 दिनों तक कोई कमिट या गतिविधि नहीं होती, तो GitHub शेड्यूल्ड वर्कफ़्लोज़ को स्वतः पॉज़ (Pause) कर देता है। इसे सक्रिय रखने के लिए Actions टैब में जाकर "Enable workflow" दबाएं या 60 दिन में कभी भी छोटा अपडेट कमिट करें।
3. **निःशुल्क सीमा (Free Quota)**:
   - GitHub फ्री टीयर प्रति माह 2,000 मिनट देता है। हर 30 मिनट में 2 मिनट चलने पर ~2,800 मिनट हो सकते हैं। यदि आपके मिनट समाप्त होने लगें, तो क्रॉन को `.github/workflows/auto-news.yml` में `0 * * * *` (प्रति घंटा) पर सेट कर लें, जो प्रति माह केवल ~1,400 मिनट का उपभोग करेगा और निःशुल्क सीमा के भीतर रहेगा।

---

## 8. अंतिम चेकलिस्ट

- [x] `.github/workflows/auto-news.yml` निर्मित और मान्य।
- [x] `scripts/auto-publish.ts` द्वारा स्वचालित इनजेशन, AI सिंथेसिस, और डुप्लीकेट रोकथाम सत्यापित।
- [x] `.env.example` में सभी आवश्यक सीक्रेट्स का पूर्ण विवरण।
- [x] `package.json` में `"auto-news"` और `"auto-news:dry"` कमांड्स जोड़े गए।
- [x] `firestore.rules` में `articles` और `pending_articles` दोनों के नियम अपडेटेड।
- [x] Vercel SPA रूटिंग, PWA मैनिफेस्ट और सर्विस वर्कर कॉन्फ़िगर।
- [x] प्रोडक्शन बिल्ड (`npm run build`) त्रुटिहीन संकलित।
