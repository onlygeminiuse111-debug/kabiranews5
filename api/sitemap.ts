import { getPublishedArticlesForSitemap } from '../src/server/firestoreBridge';

export default async function handler(req: any, res: any) {
  const host = req.headers.host || 'kabira-news.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
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

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return res.status(200).send(xml);
}
