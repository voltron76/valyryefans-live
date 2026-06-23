// ============================================================
// ValyryesFans — Footer Component
// Social Hub style footer with creator info, socials, and links
// ============================================================

import { getState } from '../store.js';

const socialIcons = {
  instagram: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  tiktok: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z"/></svg>`,
  twitter: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  youtube: '',
};

export function renderFooter() {
  const state = getState();
  const creatorProfile = state.creatorProfile;
  const currentYear = new Date().getFullYear();

  // Don't show footer on admin pages
  const pathname = window.location.pathname;
  if (pathname.includes('admin')) return '';

  return `
    <footer class="site-footer" id="site-footer">
      <div class="site-footer__glow"></div>
      <div class="site-footer__inner">
 
        <!-- Left: Creator Info -->
        <div class="site-footer__creator">
          <div class="site-footer__avatar-wrap">
            <img src="${creatorProfile.avatar}" alt="${creatorProfile.name}" class="site-footer__avatar">
          </div>
          <div>
            <div class="site-footer__name">${creatorProfile.name}</div>
            <div class="site-footer__handle">${creatorProfile.handle}</div>
          </div>
        </div>
 
        <!-- Center: Social Icons -->
        <div class="site-footer__socials">
          <a href="https://instagram.com/valyryes" target="_blank" rel="noopener" class="site-footer__social-link" aria-label="Instagram">
            ${socialIcons.instagram}
          </a>
          <a href="https://www.tiktok.com/@valyryes" target="_blank" rel="noopener" class="site-footer__social-link" aria-label="TikTok">
            ${socialIcons.tiktok}
          </a>
          <a href="https://x.com/valyryes" target="_blank" rel="noopener" class="site-footer__social-link" aria-label="X / Twitter">
            ${socialIcons.twitter}
          </a>
        </div>
 
        <!-- Right: Nav Links -->
        <nav class="site-footer__links">
          <a href="/">Home</a>
          <a href="/gallery">Gallery</a>
          <a href="/subscribe">Subscribe</a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </nav>
      </div>

      <!-- Bottom Bar -->
      <div class="site-footer__bottom">
        <span>Created by <strong>Voltrax Labs</strong></span>
        <span class="site-footer__dot">·</span>
        <span>© Valerie Reyes ${currentYear}</span>
      </div>
    </footer>`;
}
