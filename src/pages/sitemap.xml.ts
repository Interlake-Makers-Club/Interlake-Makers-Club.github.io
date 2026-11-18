// One-page site, so the sitemap lists just the home page. Submit
// https://interlake-makers-club.github.io/sitemap.xml in Google Search Console.
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const home = new URL('/', site).href;
  const lastmod = new Date().toISOString().slice(0, 10); // build date
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${home}</loc><lastmod>${lastmod}</lastmod></url>
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
