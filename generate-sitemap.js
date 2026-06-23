import fs from 'fs';
import { CONFIG } from './js/config.js';

const SITE_URL = 'https://valyreyes.com';

async function generateSitemap() {
  console.log('[Sitemap] Fetching content from Supabase...');
  
  const headers = {
    'apikey': CONFIG.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
  };
  
  const staticPaths = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/gallery', priority: '0.8', changefreq: 'daily' },
    { path: '/subscribe', priority: '0.9', changefreq: 'weekly' },
    { path: '/profile', priority: '0.7', changefreq: 'weekly' },
    { path: '/terms', priority: '0.3', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
    { path: '/help', priority: '0.5', changefreq: 'weekly' },
    { path: '/support', priority: '0.5', changefreq: 'weekly' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // 1. Add static paths
  staticPaths.forEach(sp => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${sp.path}</loc>\n`;
    xml += `    <changefreq>${sp.changefreq}</changefreq>\n`;
    xml += `    <priority>${sp.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // 2. Fetch dynamic content paths
  try {
    const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/content?select=id,created_at&category=not.in.(story,promo)&order=created_at.desc`, { headers });
    
    if (!res.ok) {
      throw new Error(`Supabase API responded with status ${res.status}`);
    }
    
    const content = await res.json();
    console.log(`[Sitemap] Found ${content.length} content items.`);

    content.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/content/${item.id}</loc>\n`;
      xml += `    <lastmod>${date}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    });
  } catch (e) {
    console.error('[Sitemap] Failed to fetch dynamic content:', e.message);
    console.log('[Sitemap] Generating sitemap with static paths only.');
  }

  xml += '</urlset>\n';

  fs.writeFileSync('./sitemap.xml', xml, 'utf-8');
  console.log('[Sitemap] sitemap.xml generated successfully in root!');
}

generateSitemap();
