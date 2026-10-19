import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  startAutomationScheduler,
  stopAutomationScheduler,
  runIngestionCycle,
  getAutomationState,
  updateSourceStatus,
  approveHeldStory,
  rejectHeldStory,
  setOnPublishArticleCallback,
  addCustomSource,
  deleteSource,
  updatePublishFrequency,
} from './src/server/automationEngine';
import { publishArticleToFirestore, getPublishedArticlesForSitemap } from './src/server/firestoreBridge';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Connect automation engine to Firestore publishing bridge
setOnPublishArticleCallback(async (article) => {
  await publishArticleToFirestore(article);
});

// ----------------------------------------------------
// Automation API Routes
// ----------------------------------------------------

// 1. Get current automation status & stats
app.get('/api/automation/status', (req, res) => {
  const state = getAutomationState();
  res.json({ success: true, data: state });
});

// 2. Trigger manual instant ingestion cycle
app.post('/api/automation/run-now', async (req, res) => {
  try {
    const result = await runIngestionCycle();
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Cycle failed' });
  }
});

// 3. Toggle automation (Emergency Pause / Resume)
app.post('/api/automation/toggle', (req, res) => {
  const { active, intervalMinutes } = req.body;
  if (active) {
    startAutomationScheduler(intervalMinutes || 15);
  } else {
    stopAutomationScheduler();
  }
  const state = getAutomationState();
  res.json({ success: true, data: state });
});

// 4. Update publishing frequency interval
app.post('/api/automation/frequency', (req, res) => {
  const { minutes } = req.body;
  const ok = updatePublishFrequency(Number(minutes) || 15);
  res.json({ success: ok, data: getAutomationState() });
});

// 5. Toggle specific feed source
app.post('/api/automation/sources/:id', (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;
  const updated = updateSourceStatus(id, Boolean(enabled));
  res.json({ success: updated, data: getAutomationState().sources });
});

// 6. Add new custom RSS source
app.post('/api/automation/sources', (req, res) => {
  const { name, category, url, state, city } = req.body;
  if (!name || !url || !category) {
    res.status(400).json({ success: false, error: 'Name, Category, and URL are required' });
    return;
  }
  const source = addCustomSource({ name, category, url, state, city });
  res.json({ success: true, data: source, sources: getAutomationState().sources });
});

// 7. Delete feed source
app.delete('/api/automation/sources/:id', (req, res) => {
  const { id } = req.params;
  const ok = deleteSource(id);
  res.json({ success: ok, sources: getAutomationState().sources });
});

// 5. Get review queue
app.get('/api/automation/pending', (req, res) => {
  const state = getAutomationState();
  res.json({ success: true, data: state.pendingQueue });
});

// 6. Approve or Reject held story
app.post('/api/automation/review/:id/:action', async (req, res) => {
  const { id, action } = req.params;
  if (action === 'approve') {
    const ok = await approveHeldStory(id);
    res.json({ success: ok, action: 'approved' });
  } else if (action === 'reject') {
    const ok = rejectHeldStory(id);
    res.json({ success: ok, action: 'rejected' });
  } else {
    res.status(400).json({ success: false, error: 'Invalid action' });
  }
});

// 7. Get logs
app.get('/api/automation/logs', (req, res) => {
  const state = getAutomationState();
  res.json({ success: true, data: state.logs });
});

// ----------------------------------------------------
// Google SEO & Google News Sitemap & Robots.txt
// ----------------------------------------------------
app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'https';
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Googlebot-News
Allow: /

User-agent: Mediapartners-Google
Allow: /

User-agent: AdsBot-Google
Allow: /

Sitemap: ${protocol}://${host}/sitemap.xml
`);
});

app.get('/sitemap.xml', async (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'https';
  const baseUrl = `${protocol}://${host}`;

  const articles = await getPublishedArticlesForSitemap();
  const currentDate = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>`;

  for (const art of articles) {
    const loc = `${baseUrl}/?article=${encodeURIComponent(art.id)}`;
    xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${art.publishedAt || currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

// Direct zip download endpoint
app.get('/kabira-news.zip', (req, res) => {
  const zipPath = path.resolve(__dirname, 'kabira-news.zip');
  res.download(zipPath, 'kabira-news.zip');
});

// ----------------------------------------------------
// Dev vs Production Setup
// ----------------------------------------------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Kabira News] Server running on http://localhost:${PORT}`);
    // Start background 24/7 scheduler at 30 minutes interval
    startAutomationScheduler(30);
  });
}

startServer();
