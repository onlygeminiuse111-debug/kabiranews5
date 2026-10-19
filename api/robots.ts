export default function handler(req: any, res: any) {
  const host = req.headers.host || 'kabira-news.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || 'https';

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  return res.status(200).send(`User-agent: *
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
}
