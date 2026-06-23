// ============================================================
// ValyryesFans — Dynamic SEO & Head Tag Manager
// Handles Title, Meta, Open Graph, Twitter Cards, and JSON-LD
// ============================================================

import { CONFIG } from './config.js';

// Base SEO Defaults
const DEFAULTS = {
  title: 'ValyryesFans — Exclusive Content by Valyryes',
  description: 'ValyryesFans — Exclusive content, behind-the-scenes access, and personal messaging with Valyryes. Subscribe for premium photos, videos, and more.',
  image: 'assets/images/avatar.jpg', // Fallback relative path
  url: window.location.origin,
  type: 'website'
};

/**
 * Dynamically updates the page's HTML head elements for SEO, dynamic previews,
 * and structured JSON-LD schemas.
 * @param {Object} metadata
 * @param {string} [metadata.title] Page title
 * @param {string} [metadata.description] Page meta description
 * @param {string} [metadata.image] Absolute or relative image URL for social previews
 * @param {string} [metadata.type] Page type: 'website', 'profile', or 'article'
 * @param {Object} [metadata.schema] Optional JSON-LD structured schema object
 */
export function updateSEO(metadata = {}) {
  const seo = {
    title: metadata.title ? `${metadata.title} | ValyryesFans` : DEFAULTS.title,
    description: metadata.description ? cleanDescription(metadata.description) : DEFAULTS.description,
    image: metadata.image || DEFAULTS.image,
    url: window.location.href,
    type: metadata.type || DEFAULTS.type
  };

  // Convert relative image path to absolute URL
  if (seo.image && !seo.image.startsWith('http')) {
    if (seo.image.startsWith('/')) {
      seo.image = window.location.origin + seo.image;
    } else if (seo.image.startsWith('assets/') || seo.image.startsWith('uploads/')) {
      seo.image = window.location.origin + '/' + seo.image;
    } else {
      // Supabase relative path fallback
      seo.image = `${CONFIG.SUPABASE_URL}/storage/v1/object/public/media/${seo.image}`;
    }
  }

  // 1. Update Title tag
  document.title = seo.title;

  // 2. Update Standard Metas
  setMetaTag('name', 'description', seo.description);

  // 3. Update Open Graph (OG) Metas
  setMetaTag('property', 'og:title', seo.title);
  setMetaTag('property', 'og:description', seo.description);
  setMetaTag('property', 'og:image', seo.image);
  setMetaTag('property', 'og:url', seo.url);
  setMetaTag('property', 'og:type', seo.type);
  setMetaTag('property', 'og:site_name', 'ValyryesFans');

  // 4. Update Twitter Card Metas
  setMetaTag('name', 'twitter:card', seo.type === 'article' ? 'summary_large_image' : 'summary');
  setMetaTag('name', 'twitter:title', seo.title);
  setMetaTag('name', 'twitter:description', seo.description);
  setMetaTag('name', 'twitter:image', seo.image);

  // 5. Inject JSON-LD Schema
  injectJSONLD(seo, metadata.schema);
}

/**
 * Helper to set or create a meta tag.
 */
function setMetaTag(attributeName, attributeValue, content) {
  if (content === undefined || content === null) return;
  
  let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attributeName, attributeValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Cleans descriptions of markdown/HTML elements and truncates to SEO safe length.
 */
function cleanDescription(text) {
  if (!text) return '';
  // Strip HTML tags
  let cleaned = text.replace(/<\/?[^>]+(>|$)/g, '');
  // Strip common markdown elements
  cleaned = cleaned.replace(/[*_#`~[\]()]/g, '');
  // Collapse whitespaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  if (cleaned.length > 160) {
    return cleaned.substring(0, 157) + '...';
  }
  return cleaned;
}

/**
 * Injects a JSON-LD <script> block in document head.
 */
function injectJSONLD(seo, customSchema) {
  // Remove existing JSON-LD scripts
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => script.remove());

  let schemaData = null;

  if (customSchema) {
    schemaData = customSchema;
  } else {
    // Generate default ProfilePage schema for Valyryes
    schemaData = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      'mainEntity': {
        '@type': 'Person',
        'name': 'Valyryes',
        'alternateName': '@valyryes',
        'description': 'Official Valyryes Fans platform. Exclusive behind-the-scenes content, photos, videos, and private messaging.',
        'image': window.location.origin + '/assets/images/avatar.jpg',
        'sameAs': [
          'https://valyreyes.com',
          'https://twitter.com/valyryes',
          'https://instagram.com/valyryes'
        ]
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'ValyryesFans',
        'url': window.location.origin
      }
    };
  }

  try {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
  } catch (e) {
    console.error('[SEO] JSON-LD injection failed:', e);
  }
}
