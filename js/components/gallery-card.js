// ============================================================
// ValyryesFans — Gallery Card Component
// ============================================================

import { canAccessTier } from '../store.js';

export function renderGalleryCard(item, index = 0) {
  const accessible = item.isPublic || canAccessTier(item.minTier);
  const staggerClass = index < 12 ? `stagger-${index + 1}` : '';
  const typeIcon = item.type === 'video' ? '🎬' : '📷';
  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (!accessible) {
    return `
      <div class="gallery-card gallery-card--locked animate-fade-in-up ${staggerClass}" data-id="${item.id}" data-type="${item.type}" data-tier="${item.minTier}" data-public="false">
        <img class="gallery-card__image" src="${item.thumbnail}" alt="${item.title}" loading="lazy">
        <div class="gallery-card__type-badge">${typeIcon} ${item.type === 'video' ? 'Video' : 'Photo'}</div>
        <div class="gallery-card__overlay">
          <div class="lock-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <div class="lock-label">
            <span class="sub-badge sub-badge--${item.minTier}" style="margin-bottom: 8px; display: inline-flex;">${item.minTier.toUpperCase()}</span>
          </div>
          <p style="color: var(--text-muted); font-size: var(--text-xs); margin-bottom: var(--space-4);">Subscribe to unlock this content</p>
          <a href="#/subscribe" class="btn btn-primary btn-sm">Unlock Now</a>
        </div>
      </div>
    `;
  }

  return `
    <a href="#/content/${item.id}" class="gallery-card animate-fade-in-up ${staggerClass}" data-id="${item.id}" data-type="${item.type}" data-tier="${item.minTier}" data-public="${item.isPublic}">
      <img class="gallery-card__image" src="${item.thumbnail}" alt="${item.title}" loading="lazy">
      <div class="gallery-card__type-badge">${typeIcon} ${item.type === 'video' ? 'Video' : 'Photo'}</div>
      <div class="gallery-card__overlay">
        <div class="gallery-card__title">${item.title}</div>
        <div class="gallery-card__meta">
          <span>${formattedDate}</span>
          <span>•</span>
          <span style="display:flex;align-items:center;gap:4px;">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="12" height="12" style="color:var(--error);"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>
            ${item.likes}
          </span>
        </div>
      </div>
    </a>
  `;
}
