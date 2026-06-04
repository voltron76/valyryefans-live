// ============================================================
// ValyryeFans — Bookmarks View
// Saved content gallery with remove functionality
// ============================================================

import { getState, canAccessTier, showToast } from '../store.js';
import { navigate } from '../router.js';

const icons = {
  bookmark: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  bookmarkOutline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  heart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  lock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  x: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
};

function buildBookmarkCard(item, idx) {
  const locked = !canAccessTier(item.minTier);
  const stagger = `stagger-${Math.min((idx % 12) + 1, 12)}`;

  if (locked) {
    return `
      <div class="gallery-card gallery-card--locked animate-fade-in-up ${stagger}"
           data-id="${item.id}" data-tier="${item.minTier}" data-locked="true">
        <img class="gallery-card__image" src="${item.thumbnail}" alt="${item.title}" loading="lazy">
        <div class="gallery-card__overlay">
          <div class="lock-icon">${icons.lock}</div>
          <div class="lock-label">Gold Exclusive</div>
          <button class="btn btn-primary btn-sm subscribe-cta">Subscribe to Unlock</button>
        </div>
        <button class="bookmark-remove-btn" data-id="${item.id}" title="Remove bookmark" style="
          position: absolute; top: var(--space-3); right: var(--space-3); z-index: 5;
          width: 32px; height: 32px; border-radius: var(--radius-full);
          background: var(--bg-card); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); cursor: pointer;
          transition: all var(--transition-fast);
        ">${icons.x}</button>
      </div>`;
  }

  return `
    <div class="gallery-card animate-fade-in-up ${stagger}"
         data-id="${item.id}" data-tier="${item.minTier}" style="position: relative;">
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
      <button class="bookmark-remove-btn" data-id="${item.id}" title="Remove bookmark" style="
        position: absolute; top: var(--space-3); right: var(--space-3); z-index: 5;
        width: 32px; height: 32px; border-radius: var(--radius-full);
        background: var(--bg-card); border: 1px solid var(--border);
        display: flex; align-items: center; justify-content: center;
        color: var(--accent); cursor: pointer;
        transition: all var(--transition-fast);
      ">${icons.bookmark}</button>
    </div>`;
}

export function renderBookmarks() {
  const state = getState();

  // Auth check
  if (!state.isAuthenticated) {
    return {
      html: `
        <div class="empty-state" style="min-height: calc(100vh - var(--nav-height));">
          <div class="empty-state__icon">🔐</div>
          <h2 class="empty-state__title font-display">Sign in to view bookmarks</h2>
          <p class="empty-state__text">Create an account or sign in to save and view your bookmarked content.</p>
          <button class="btn btn-primary btn-lg" id="bookmarks-auth-btn">Sign In</button>
        </div>
      `,
      afterRender() {
        document.getElementById('bookmarks-auth-btn')?.addEventListener('click', () => {
          import('../main.js').then(({ openAuthModal }) => openAuthModal('login'));
        });
      }
    };
  }

  // Get bookmarked items
  const bookmarks = state.bookmarks || [];
  const bookmarkedItems = state.content.filter(item => bookmarks.includes(item.id));

  // Empty state
  if (bookmarkedItems.length === 0) {
    return {
      html: `
        <div class="section" style="padding-top: var(--space-10);">
          <div class="section__header animate-fade-in-up" style="flex-direction: column; align-items: flex-start; gap: var(--space-2);">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              ${icons.bookmarkOutline}
              <h1 class="section__title font-display">Bookmarks</h1>
            </div>
            <p class="section__subtitle">Your saved content</p>
          </div>

          <div class="empty-state" style="padding: var(--space-24) var(--space-8);">
            <div class="empty-state__icon">🔖</div>
            <h3 class="empty-state__title font-display">No bookmarks yet</h3>
            <p class="empty-state__text">Start saving your favorite content by tapping the bookmark icon on any post.</p>
            <a href="#/gallery" class="btn btn-secondary btn-lg" id="bookmarks-gallery-link">Browse Gallery</a>
          </div>
        </div>
      `,
      afterRender() {
        document.getElementById('bookmarks-gallery-link')?.addEventListener('click', (e) => {
          e.preventDefault();
          navigate('/gallery');
        });
      }
    };
  }

  // Render bookmarked content
  const html = `
    <div class="section" style="padding-top: var(--space-10);">
      <div class="section__header animate-fade-in-up" style="flex-direction: column; align-items: flex-start; gap: var(--space-2);">
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          ${icons.bookmark}
          <h1 class="section__title font-display">Bookmarks</h1>
        </div>
        <p class="section__subtitle">${bookmarkedItems.length} saved item${bookmarkedItems.length !== 1 ? 's' : ''}</p>
      </div>

      <div class="gallery-grid" id="bookmarks-grid">
        ${bookmarkedItems.map((item, i) => buildBookmarkCard(item, i)).join('')}
      </div>
    </div>
  `;

  return {
    html,
    afterRender() {
      // Remove bookmark buttons
      document.querySelectorAll('.bookmark-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.dataset.id;
          const s = getState();

          // Remove from bookmarks
          s.bookmarks = (s.bookmarks || []).filter(bId => bId !== id);
          showToast('Bookmark removed', 'success');

          // Re-render the card out with animation
          const card = btn.closest('.gallery-card');
          if (card) {
            card.style.transition = 'opacity 0.3s, transform 0.3s';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
              card.remove();
              // Check if grid is empty now
              const grid = document.getElementById('bookmarks-grid');
              if (grid && grid.children.length === 0) {
                // Re-render with empty state
                navigate('/bookmarks');
              }
            }, 300);
          }
        });
      });

      // Subscribe CTA buttons on locked cards
      document.querySelectorAll('.subscribe-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate('/subscribe');
        });
      });
    }
  };
}
