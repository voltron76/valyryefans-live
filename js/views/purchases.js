// ============================================================
// ValyryesFans — Purchases / Media Collection View
// ============================================================

import { getState, canAccessTier } from '../store.js';
import { navigate } from '../router.js';

const icons = {
  media: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  heart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
};

function buildPurchaseCard(item, idx) {
  const stagger = `stagger-${Math.min((idx % 12) + 1, 12)}`;

  return `
    <div class="gallery-card animate-fade-in-up ${stagger}" data-id="${item.id}" data-tier="${item.minTier}" style="position: relative;">
      <a href="#/content/${item.id}" style="display: block; width: 100%; height: 100%;">
        <img class="gallery-card__image" src="${item.thumbnail}" alt="${item.title}" loading="lazy">
        <div class="gallery-card__overlay">
          <div class="gallery-card__title">${item.title}</div>
          <div class="gallery-card__meta">
            <span>${icons.heart} ${item.likes}</span>
            <span>·</span>
            <span>${item.createdAt}</span>
          </div>
        </div>
      </a>
    </div>`;
}

export function renderPurchases() {
  const state = getState();

  // Auth check
  if (!state.isAuthenticated) {
    return {
      html: `
        <div class="empty-state" style="min-height: calc(100vh - var(--nav-height));">
          <div class="empty-state__icon">🔐</div>
          <h2 class="empty-state__title font-display">Sign in to view your media collection</h2>
          <p class="empty-state__text">Create an account or sign in to access your unlocked and purchased content.</p>
          <button class="btn btn-primary btn-lg" id="purchases-auth-btn">Sign In</button>
        </div>
      `,
      afterRender() {
        document.getElementById('purchases-auth-btn')?.addEventListener('click', () => {
          import('../main.js').then(({ openAuthModal }) => openAuthModal('login'));
        });
      }
    };
  }

  // Get items the user has explicitly paid for or has access to via Gold tier
  // For now, if they are gold, they have access to everything that is minTier='gold'.
  const isGold = state.currentTier === 'gold' || state.user?.tier === 'gold';
  
  let purchasedItems = [];
  if (isGold) {
    purchasedItems = state.content.filter(item => item.minTier === 'gold' || item.minTier === 'free');
  } else {
    // Free users only have access to free tier content, but "purchased media" usually implies PPV
    // Since we don't have PPV tracked yet, show an empty state for free users.
    purchasedItems = []; 
  }

  // Empty state
  if (purchasedItems.length === 0) {
    return {
      html: `
        <div class="section" style="padding-top: var(--space-10);">
          <div class="section__header animate-fade-in-up" style="flex-direction: column; align-items: flex-start; gap: var(--space-2);">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              ${icons.media}
              <h1 class="section__title font-display">Media Collection</h1>
            </div>
            <p class="section__subtitle">Your unlocked premium content</p>
          </div>

          <div class="empty-state" style="padding: var(--space-24) var(--space-8);">
            <div class="empty-state__icon">🖼️</div>
            <h3 class="empty-state__title font-display">No media unlocked yet</h3>
            <p class="empty-state__text">Subscribe to Gold to unlock Valyryes' exclusive premium collection.</p>
            <a href="#/subscribe" class="btn btn-primary btn-lg" id="purchases-sub-btn">View Subscriptions</a>
          </div>
        </div>
      `,
      afterRender() {
        document.getElementById('purchases-sub-btn')?.addEventListener('click', (e) => {
          e.preventDefault();
          navigate('/subscribe');
        });
      }
    };
  }

  // Render purchased/unlocked content
  const html = `
    <div class="section" style="padding-top: var(--space-10);">
      <div class="section__header animate-fade-in-up" style="flex-direction: column; align-items: flex-start; gap: var(--space-2);">
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          ${icons.media}
          <h1 class="section__title font-display">Media Collection</h1>
        </div>
        <p class="section__subtitle">${purchasedItems.length} unlocked item${purchasedItems.length !== 1 ? 's' : ''}</p>
      </div>

      <div class="gallery-grid" id="purchases-grid">
        ${purchasedItems.map((item, i) => buildPurchaseCard(item, i)).join('')}
      </div>
    </div>
  `;

  return {
    html,
    afterRender() {}
  };
}
