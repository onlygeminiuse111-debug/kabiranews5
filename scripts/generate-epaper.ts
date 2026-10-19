import 'dotenv/config';
import 'regenerator-runtime/runtime.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as fs from 'fs';
import * as path from 'path';

// Target Phone & Channel Config
export const TARGET_PHONE = '9893537306';
export const CONTACT_PERSON = 'नितेश जोशी';
export const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbDWbmsJ93wNwW7oB60N';

interface PageDefinition {
  pageNumber: number;
  pageTitleHi: string;
  category: string;
  subtitleHi: string;
}

const PAGE_DEFS: PageDefinition[] = [
  {
    pageNumber: 1,
    pageTitleHi: 'प्रथम पृष्ठ • मुख्य राष्ट्रीय व अंतर्राष्ट्रीय समाचार',
    category: 'national',
    subtitleHi: 'देश और दुनिया की शीर्ष खबरें, ब्रेकिंग अपडेट्स और विशेष रिपोर्ट',
  },
  {
    pageNumber: 2,
    pageTitleHi: 'प्रादेशिक हलचल • मध्य प्रदेश, भोपाल, इंदौर व अंचल',
    category: 'state',
    subtitleHi: 'मध्य प्रदेश शासन के निर्णय, विकास कार्य, अपराध व स्थानीय जनसमस्याएं',
  },
  {
    pageNumber: 3,
    pageTitleHi: 'संसद, राजनीति व राष्ट्रीय समीक्षा',
    category: 'politics',
    subtitleHi: 'राजनीतिक समीकरण, संसद सत्र, निर्वाचन आयोग व नीतिगत विश्लेषण',
  },
  {
    pageNumber: 4,
    pageTitleHi: 'खेल संसार • क्रिकेट व ओलंपिक हलचल',
    category: 'sports',
    subtitleHi: 'क्रिकेट मैच स्कोरकार्ड, टीम इंडिया, अंतरराष्ट्रीय स्पर्धाएं व पदक तालिका',
  },
  {
    pageNumber: 5,
    pageTitleHi: 'व्यापार, शेयर बाज़ार, सराफा व तकनीक',
    category: 'business',
    subtitleHi: 'सेंसेक्स, निफ्टी, सोने-चांदी के भाव, 5G तकनीक व नए गैजेट्स',
  },
  {
    pageNumber: 6,
    pageTitleHi: 'सिनेमा, सेहत, शिक्षा व संपादकीय विमर्श',
    category: 'entertainment',
    subtitleHi: 'बॉलीवुड, स्वास्थ्य सलाह, प्रतियोगी परीक्षाएं व कबीरा संपादकीय',
  },
];

async function loadArticles(): Promise<any[]> {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID || 'tactile-sweep-464417-p2';
    const databaseId = process.env.FIREBASE_DATABASE_ID || 'ai-studio-kabiranews-7d7b1222-a3c8-46b5-b4a5-fea61b7ac7ed';

    if (serviceAccountJson) {
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
      const firestore = admin.firestore(admin.app(), databaseId);
      const snap = await firestore.collection('articles').orderBy('publishedAt', 'desc').limit(40).get();
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
    }
  } catch (e: any) {
    console.warn(`[EPAPER] DB load warning: ${e?.message}`);
  }

  // Fallback to local seed articles
  try {
    const seedModule = await import('../src/data/seedNews.js').catch(async () => await import('../src/data/seedNews.ts'));
    return seedModule.INITIAL_NEWS_ARTICLES || [];
  } catch {
    return [];
  }
}

export async function generateDailyEPaperPdf(): Promise<string> {
  console.log('📰 [EPAPER] Generating 6-Page Hindi Digital e-Paper PDF with Noto Sans Devanagari font...');

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Load custom Hindi font (Google Mukta - full Devanagari ligature support)
  const fontPath = path.resolve(process.cwd(), 'public/fonts/Mukta-Regular.ttf');
  const fontBytes = fs.readFileSync(fontPath);
  const hindiFont = await pdfDoc.embedFont(fontBytes, { subset: false });

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const todayStr = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
  const todayEng = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  const articles = await loadArticles();

  // Create all 6 broadsheet pages
  for (const pageDef of PAGE_DEFS) {
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    // 1. Header Masthead Background (Crimson & Gold)
    page.drawRectangle({
      x: 20,
      y: height - 105,
      width: width - 40,
      height: 85,
      color: rgb(0.77, 0.12, 0.14), // #c41e24
    });

    // Gold decorative stripe
    page.drawRectangle({
      x: 20,
      y: height - 110,
      width: width - 40,
      height: 5,
      color: rgb(0.96, 0.77, 0.19), // gold
    });

    // Masthead Title (Hindi & English)
    page.drawText('कबीरा न्यूज़', {
      x: 35,
      y: height - 62,
      size: 28,
      font: hindiFont,
      color: rgb(1, 1, 1),
    });

    page.drawText('KABIRA NEWS • DAILY DIGITAL E-PAPER', {
      x: 37,
      y: height - 82,
      size: 10,
      font: fontBold,
      color: rgb(0.98, 0.85, 0.35),
    });

    page.drawText('निष्पक्ष • निर्भीक • विश्वसनीय डिजिटल हिंदी दैनिक', {
      x: 37,
      y: height - 98,
      size: 9,
      font: hindiFont,
      color: rgb(1, 1, 1),
    });

    // Top Right Info Box
    page.drawText(`दिनांक: ${todayStr}`, {
      x: width - 230,
      y: height - 48,
      size: 9.5,
      font: hindiFont,
      color: rgb(1, 1, 1),
    });

    page.drawText(`Date: ${todayEng}`, {
      x: width - 230,
      y: height - 64,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.9, 0.9, 0.9),
    });

    page.drawText(`संस्करण: भोपाल व मध्य प्रदेश राज्य विशेष`, {
      x: width - 230,
      y: height - 80,
      size: 9,
      font: hindiFont,
      color: rgb(0.98, 0.85, 0.35),
    });

    page.drawText(`पृष्ठ: 0${pageDef.pageNumber} / 06 | डिजिटल मूल्य: निःशुल्क`, {
      x: width - 230,
      y: height - 96,
      size: 8.5,
      font: hindiFont,
      color: rgb(1, 1, 1),
    });

    // 2. Page Sub-Header Strip
    page.drawRectangle({
      x: 20,
      y: height - 135,
      width: width - 40,
      height: 22,
      color: rgb(0.93, 0.94, 0.96),
    });

    page.drawText(`${pageDef.pageTitleHi}  |  ${pageDef.subtitleHi}`, {
      x: 28,
      y: height - 126,
      size: 9.5,
      font: hindiFont,
      color: rgb(0.1, 0.15, 0.25),
    });

    // 3. Page Articles Selection
    let pageStories = articles.filter(
      (a) => a.category === pageDef.category || (pageDef.category === 'state' && a.state)
    );
    if (pageStories.length === 0) {
      pageStories = articles.slice((pageDef.pageNumber - 1) * 3, pageDef.pageNumber * 3);
    }
    const lead = pageStories[0] || articles[0];
    const side1 = pageStories[1] || articles[1];
    const side2 = pageStories[2] || articles[2];

    const colLeftW = (width - 60) * 0.62;
    const colRightW = (width - 60) * 0.38;
    const startY = height - 155;

    // Lead Story Header Tag
    page.drawRectangle({
      x: 20,
      y: startY - 22,
      width: colLeftW,
      height: 22,
      color: rgb(0.96, 0.92, 0.92),
    });

    page.drawText('प्रमुख मुख्य समाचार (EXCLUSIVE LEAD)', {
      x: 28,
      y: startY - 15,
      size: 9,
      font: hindiFont,
      color: rgb(0.77, 0.12, 0.14),
    });

    // Lead Headline
    const leadTitle = lead?.title || pageDef.pageTitleHi;
    const titleChunks = chunkText(leadTitle, 45);
    let titleY = startY - 40;
    for (const tChunk of titleChunks.slice(0, 2)) {
      page.drawText(tChunk, {
        x: 25,
        y: titleY,
        size: 13,
        font: hindiFont,
        color: rgb(0.05, 0.08, 0.15),
      });
      titleY -= 18;
    }

    // Lead Story Body Text
    const leadSummary =
      lead?.summary ||
      'कबीरा न्यूज़ डिजिटल डेस्क: निष्पक्ष और प्रामाणिक पत्रकारिता के साथ मध्य प्रदेश और देश-विदेश की हर बड़ी खबर पर पैनी नजर।';
    
    let currentY = titleY - 10;
    const summaryLines = chunkText(leadSummary, 52);
    for (const line of summaryLines.slice(0, 4)) {
      page.drawText(line, {
        x: 25,
        y: currentY,
        size: 9.5,
        font: hindiFont,
        color: rgb(0.2, 0.25, 0.3),
      });
      currentY -= 15;
    }

    currentY -= 8;
    const leadContent = lead?.content || '';
    const contentLines = chunkText(leadContent.slice(0, 700), 54);
    for (const cLine of contentLines.slice(0, 14)) {
      page.drawText(cLine, {
        x: 25,
        y: currentY,
        size: 9,
        font: hindiFont,
        color: rgb(0.15, 0.2, 0.25),
      });
      currentY -= 14;
    }

    // Bottom Left Story 2
    if (side2) {
      page.drawRectangle({
        x: 20,
        y: currentY - 12,
        width: colLeftW,
        height: 1,
        color: rgb(0.85, 0.85, 0.85),
      });

      page.drawText(`विशेष रिपोर्ट: ${(side2.title || '').slice(0, 50)}`, {
        x: 25,
        y: currentY - 28,
        size: 10.5,
        font: hindiFont,
        color: rgb(0.77, 0.12, 0.14),
      });

      const side2Lines = chunkText((side2.summary || side2.content || '').slice(0, 400), 54);
      let s2Y = currentY - 44;
      for (const sLine of side2Lines.slice(0, 7)) {
        page.drawText(sLine, {
          x: 25,
          y: s2Y,
          size: 8.5,
          font: hindiFont,
          color: rgb(0.25, 0.3, 0.35),
        });
        s2Y -= 13;
      }
    }

    // Right Column: Side Story 1 + Key Highlights
    const rightColX = 20 + colLeftW + 15;

    page.drawRectangle({
      x: rightColX,
      y: startY - 210,
      width: colRightW,
      height: 210,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: rightColX,
      y: startY - 24,
      width: colRightW,
      height: 24,
      color: rgb(0.12, 0.24, 0.45),
    });

    page.drawText('ताज़ा बुलेटिन व त्वरित समीक्षा', {
      x: rightColX + 10,
      y: startY - 16,
      size: 9,
      font: hindiFont,
      color: rgb(1, 1, 1),
    });

    const side1Title = side1?.title || 'प्रमुख नीतिगत व प्रशासनिक समाचार';
    const s1TitleChunks = chunkText(side1Title, 32);
    let s1Y = startY - 42;
    for (const tChunk of s1TitleChunks.slice(0, 2)) {
      page.drawText(tChunk, {
        x: rightColX + 10,
        y: s1Y,
        size: 9.5,
        font: hindiFont,
        color: rgb(0.1, 0.15, 0.25),
      });
      s1Y -= 14;
    }

    const side1Lines = chunkText((side1?.summary || side1?.content || '').slice(0, 350), 34);
    for (const sl of side1Lines.slice(0, 9)) {
      page.drawText(sl, {
        x: rightColX + 10,
        y: s1Y,
        size: 8.5,
        font: hindiFont,
        color: rgb(0.2, 0.25, 0.3),
      });
      s1Y -= 13;
    }

    // Right Column Contact & Advertisement Box
    const adBoxY = startY - 460;
    page.drawRectangle({
      x: rightColX,
      y: adBoxY,
      width: colRightW,
      height: 240,
      color: rgb(0.99, 0.96, 0.93),
      borderColor: rgb(0.9, 0.6, 0.2),
      borderWidth: 1.5,
    });

    page.drawRectangle({
      x: rightColX,
      y: adBoxY + 210,
      width: colRightW,
      height: 30,
      color: rgb(0.77, 0.12, 0.14),
    });

    page.drawText('विज्ञापन एवं समाचार प्रकाशन हेतु संपर्क', {
      x: rightColX + 10,
      y: adBoxY + 220,
      size: 8.5,
      font: hindiFont,
      color: rgb(1, 1, 1),
    });

    page.drawText('कबीरा न्यूज़ नेटवर्क ब्यूरो मुख्यालय', {
      x: rightColX + 10,
      y: adBoxY + 192,
      size: 9,
      font: hindiFont,
      color: rgb(0.1, 0.15, 0.25),
    });

    page.drawText(`प्रभारी: श्री ${CONTACT_PERSON} (ब्यूरो प्रमुख)`, {
      x: rightColX + 10,
      y: adBoxY + 175,
      size: 9.5,
      font: hindiFont,
      color: rgb(0.77, 0.12, 0.14),
    });

    page.drawText(`मोबाइल / WhatsApp: +91 ${TARGET_PHONE}`, {
      x: rightColX + 10,
      y: adBoxY + 158,
      size: 9,
      font: hindiFont,
      color: rgb(0.1, 0.5, 0.25),
    });

    page.drawText('विज्ञप्ति व विज्ञापन सेवाएं:', {
      x: rightColX + 10,
      y: adBoxY + 138,
      size: 8.5,
      font: hindiFont,
      color: rgb(0.2, 0.25, 0.3),
    });

    const adServices = [
      '• व्यापारिक ब्रांड विज्ञापन व डिजिटल बैनर',
      '• राजनीतिक कवरेज व प्रेस विज्ञप्ति',
      '• शिक्षण संस्थान, कोचिंग व भर्ती सूचना',
      '• जनहित समस्याएं व खोजी पत्रकारिता',
      '• दैनिक ई-पेपर व सोशल मीडिया प्रसारण',
    ];
    let asY = adBoxY + 122;
    for (const as of adServices) {
      page.drawText(as, {
        x: rightColX + 10,
        y: asY,
        size: 7.5,
        font: hindiFont,
        color: rgb(0.25, 0.3, 0.35),
      });
      asY -= 13;
    }

    page.drawText(`ईमेल: contact@kabiranews.com`, {
      x: rightColX + 10,
      y: adBoxY + 38,
      size: 8,
      font: hindiFont,
      color: rgb(0.4, 0.45, 0.5),
    });

    page.drawText(`WhatsApp चैनल: kabira-news`, {
      x: rightColX + 10,
      y: adBoxY + 22,
      size: 8,
      font: hindiFont,
      color: rgb(0.1, 0.4, 0.7),
    });

    // 4. Bottom Footer Strip
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: 24,
      color: rgb(0.1, 0.12, 0.18),
    });

    page.drawText(
      `कबीरा न्यूज़ डिजिटल ई-पेपर  |  समाचार व विज्ञापन संपर्क: ${CONTACT_PERSON} ${TARGET_PHONE}  |  पृष्ठ 0${pageDef.pageNumber} / 06`,
      {
        x: 28,
        y: 28,
        size: 8.5,
        font: hindiFont,
        color: rgb(0.9, 0.9, 0.9),
      }
    );
  }

  const pdfBytes = await pdfDoc.save();

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  const pdfPath = path.join(publicDir, 'epaper-today.pdf');
  fs.writeFileSync(pdfPath, Buffer.from(pdfBytes));

  const distDir = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'epaper-today.pdf'), Buffer.from(pdfBytes));
  }

  console.log(`✅ [EPAPER] 6-Page Hindi e-Paper PDF generated successfully: ${pdfPath} (${pdfBytes.length} bytes)`);
  return pdfPath;
}

function chunkText(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.replace(/[\r\n]+/g, ' ').split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ----------------------------------------------------
// Automatic WhatsApp Dispatcher for Daily e-Paper PDF
// ----------------------------------------------------
export async function dispatchEPaperToWhatsApp(pdfPath: string): Promise<void> {
  const webhookUrl = process.env.WHATSAPP_CHANNEL_WEBHOOK_URL;
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const customApiUrl = process.env.WHATSAPP_API_URL;
  const targetPhone = TARGET_PHONE;

  const todayStr = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  const downloadUrl = `https://kabira-news.vercel.app/epaper-today.pdf`;

  const broadcastMessage =
    `📰 *कबीरा न्यूज़ (Kabira News) - आज का सम्पूर्ण डिजिटल ई-पेपर* 📰\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 *दिनांक:* ${todayStr}\n` +
    `📍 *संस्करण:* भोपाल, इंदौर, जबलपुर, ग्वालियर व राज्य विशेष\n` +
    `📄 *कुल पृष्ठ:* सम्पूर्ण 6 पृष्ठ (Full Broadsheet Edition)\n\n` +
    `📥 *आज का सम्पूर्ण 6-पेजी ई-पेपर PDF यहाँ से डाउनलोड करें:*\n` +
    `${downloadUrl}\n\n` +
    `📢 *कबीरा न्यूज़ के आधिकारिक WhatsApp चैनल से तुरंत जुड़ें:*\n` +
    `${WHATSAPP_CHANNEL_URL}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📞 *विज्ञापन व समाचार प्रसारण संपर्क:*\n` +
    `श्री ${CONTACT_PERSON} (ब्यूरो प्रमुख) - +91 ${targetPhone}`;

  console.log(`\n📲 [WHATSAPP DISPATCH] Sending Daily e-Paper to Channel & +91 ${targetPhone}...`);

  let dispatched = false;

  // 1. Generic Webhook (Make / Zapier / Ultramsg / CallMeBot)
  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const payload = {
        type: 'epaper_pdf',
        recipient: `91${targetPhone}`,
        phone: targetPhone,
        channelFollowUrl: WHATSAPP_CHANNEL_URL,
        pdfUrl: downloadUrl,
        date: todayStr,
        message: broadcastMessage,
      };
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        console.log(`   ✅ [WHATSAPP] e-Paper broadcasted successfully via Webhook!`);
        dispatched = true;
      }
    } catch (e: any) {
      console.warn(`   ⚠️ [WHATSAPP] Webhook dispatch warning: ${e?.message}`);
    }
  }

  // 2. Meta WhatsApp Cloud API (Send direct text & media message)
  if (!dispatched && whatsappToken && phoneNumberId) {
    try {
      const graphUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
      const cloudPayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: `91${targetPhone}`,
        type: 'text',
        text: { body: broadcastMessage },
      };
      await fetch(graphUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloudPayload),
      });
      console.log(`   ✅ [WHATSAPP] e-Paper sent directly to +91 ${targetPhone} via Cloud API!`);
      dispatched = true;
    } catch (e: any) {
      console.warn(`   ⚠️ [WHATSAPP] Cloud API warning: ${e?.message}`);
    }
  }

  // 3. Custom Gateway (e.g. UltraMsg / Green API)
  if (!dispatched && customApiUrl && customApiUrl.startsWith('http')) {
    try {
      await fetch(customApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: `91${targetPhone}`,
          body: broadcastMessage,
          document: downloadUrl,
          filename: `Kabira-News-EPaper-${new Date().toISOString().split('T')[0]}.pdf`,
        }),
      });
      console.log(`   ✅ [WHATSAPP] e-Paper PDF sent via Custom WhatsApp Gateway!`);
      dispatched = true;
    } catch (e: any) {
      console.warn(`   ⚠️ [WHATSAPP] Custom Gateway warning: ${e?.message}`);
    }
  }

  console.log(`\n📑 [BROADCAST READY] Daily e-Paper Message prepared:`);
  console.log(broadcastMessage);
}

// Self-executing runner
generateDailyEPaperPdf()
  .then(async (pdfPath) => {
    await dispatchEPaperToWhatsApp(pdfPath);
    console.log('🏁 Daily e-Paper PDF workflow completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error in e-Paper generation:', err);
    process.exit(1);
  });
