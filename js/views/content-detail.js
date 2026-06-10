// ============================================================
// ValyryeFans — Content Detail View
// Individual content page with paywall & related section
// ============================================================

import { getState, canAccessTier, showToast, addTip } from '../store.js';
import { navigate } from '../router.js';

const icons = {
  heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartFilled: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  share: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  lock: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  back: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
  calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderRelatedCard(item) {
  const locked = !canAccessTier(item.minTier);
  const typeBadge = item.type === 'video' ? '🎬' : '📷';

  if (locked) {
    return `
      <div class="gallery-card gallery-card--locked" data-id="${item.id}" data-locked="true" style="cursor:pointer;">
        <img class="gallery-card__image" src="${item.thumbnail}" alt="${item.title}" loading="lazy">
        <span class="gallery-card__type-badge">${typeBadge}</span>
        <div class="gallery-card__overlay">
          <div class="lock-icon" style="width: 36px; height: 36px; font-size: var(--text-base);">🔒</div>
          <div class="lock-label">Exclusive</div>
        </div>
      </div>`;
  }

  return `
    <a href="#/content/${item.id}" class="gallery-card" data-id="${item.id}">
      <img class="gallery-card__image" src="${item.thumbnail}" alt="${item.title}" loading="lazy">
      <span class="gallery-card__type-badge">${typeBadge}</span>
      <div class="gallery-card__overlay">
        <div class="gallery-card__title">${item.title}</div>
      </div>
    </a>`;
}

export function renderContentDetail(params) {
  const state = getState();
  const { content } = state;
  const item = content.find(c => c.id === params.id);

  // Not found
  if (!item) {
    return `
      <div class="empty-state" style="min-height: calc(100vh - var(--nav-height));">
        <div class="empty-state__icon">🔍</div>
        <h2 class="empty-state__title">Content not found</h2>
        <p class="empty-state__text">The content you're looking for doesn't exist or has been removed.</p>
        <a href="#/gallery" class="btn btn-secondary mt-8">Back to Gallery</a>
      </div>`;
  }

  const locked = !canAccessTier(item.minTier);
  const tierName = item.minTier === 'gold' ? 'Gold' : item.minTier === 'vip' ? 'VIP' : 'Free';

  // Related content: same type or similar tier, exclude current
  const related = content
    .filter(c => c.id !== item.id)
    .sort((a, b) => {
      // Prioritize same type
      const aScore = (a.type === item.type ? 2 : 0) + (a.minTier === item.minTier ? 1 : 0);
      const bScore = (b.type === item.type ? 2 : 0) + (b.minTier === item.minTier ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, 3);

  // Locked view (paywall)
  if (locked) {
    const html = `
      <div class="content-detail animate-fade-in-up">
        <!-- Back nav -->
        <a href="#/gallery" class="btn btn-ghost" style="margin-bottom: var(--space-6); gap: var(--space-2);">
          ${icons.back} Back to Gallery
        </a>

        <!-- Blurred preview -->
        <div class="content-detail__media" style="position: relative; overflow: hidden;">
          <img src="${item.thumbnail}" alt="${item.title}" style="filter: blur(30px) brightness(0.4); transform: scale(1.1);">
          <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
            <div class="paywall-overlay" style="background: transparent; min-height: auto; padding: var(--space-8);">
              <div class="paywall-overlay__icon animate-pulse-glow">${icons.lock}</div>
              <h2 class="paywall-overlay__title font-display">${tierName} Exclusive Content</h2>
              <p class="paywall-overlay__text">Subscribe to the ${tierName} tier or higher to unlock "${item.title}" and all other exclusive content.</p>
              <a href="#/subscribe" class="btn btn-primary btn-lg">
                ${icons.star} Subscribe to Unlock
              </a>
            </div>
          </div>
        </div>

        <!-- Title info (still visible) -->
        <div style="margin-top: var(--space-6);">
          <h1 class="content-detail__title font-display">${item.title}</h1>
          <div class="content-detail__date" style="display: flex; align-items: center; gap: var(--space-2);">
            ${icons.calendar} ${formatDate(item.createdAt)}
            <span style="margin-left: var(--space-3);" class="sub-badge sub-badge--${item.minTier}">${tierName}</span>
          </div>
        </div>

        <!-- Related Content -->
        ${related.length ? `
          <div style="margin-top: var(--space-16);">
            <h2 class="section__title font-display" style="margin-bottom: var(--space-6);">More Content</h2>
            <div class="gallery-grid" style="grid-template-columns: repeat(3, 1fr);">
              ${related.map(r => renderRelatedCard(r)).join('')}
            </div>
          </div>
        ` : ''}
      </div>`;

    return {
      html,
      afterRender() {
        document.querySelectorAll('[data-locked="true"]').forEach(card => {
          card.addEventListener('click', () => navigate('/subscribe'));
        });
      }
    };
  }

  // Unlocked content view
  const html = `
    <div class="content-detail animate-fade-in-up">
      <!-- Back nav -->
      <a href="#/gallery" class="btn btn-ghost" style="margin-bottom: var(--space-6); gap: var(--space-2);">
        ${icons.back} Back to Gallery
      </a>

      <!-- Media -->
      <div class="content-detail__media animate-fade-in-up stagger-1" style="position:relative;">
        <div class="content-detail-media protect-media" style="position:relative; width: 100%; border-radius: var(--radius-xl); overflow: hidden; margin-bottom: var(--space-6); background: #000;">
        ${item.type === 'video'
          ? `<video data-drm-src="${item.videoUrl || item.thumbnail}" poster="${item.thumbnail}" controls controlslist="nodownload" disablepictureinpicture class="protect-media" style="width:100%;display:block;" oncontextmenu="return false;"></video>`
          : item.type === 'carousel'
          ? `<div class="carousel-container" style="position:relative;width:100%;overflow:hidden;background:#000;" oncontextmenu="return false;">
               <div class="carousel-track" style="display:flex;transition:transform 0.3s ease-in-out;width:100%;">
                 ${item.media.map((m, i) => `
                   <div class="content-detail-img-wrap" data-index="${i}" style="position:relative;cursor:pointer;width:100%;flex-shrink:0;display:flex;justify-content:center;background:#000;">
                     <img data-drm-src="${m}" class="content-detail-img protect-media" style="width:100%;object-fit:contain;max-height:80vh;pointer-events:none;user-select:none;-webkit-user-drag:none;" />
                     <div class="drm-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;"></div>
                   </div>`).join('')}
               </div>
               ${item.media.length > 1 ? `
               <button class="carousel-btn carousel-prev" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;z-index:6;display:flex;align-items:center;justify-content:center;">❮</button>
               <button class="carousel-btn carousel-next" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;z-index:6;display:flex;align-items:center;justify-content:center;">❯</button>
               <div class="carousel-dots" style="position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:6px;z-index:6;">
                 ${item.media.map((_, i) => `<div class="carousel-dot${i===0?' active':''}" style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,${i===0?'1':'0.5'});transition:background 0.2s;"></div>`).join('')}
               </div>
               ` : ''}
             </div>`
          : `<div class="content-detail-img-wrap" style="position:relative;cursor:pointer;width:100%;display:flex;justify-content:center;background:#000;" oncontextmenu="return false;">
               <img data-drm-src="${item.thumbnail}" alt="${item.title}" class="content-detail-img protect-media" style="width: 100%;pointer-events:none;user-select:none;-webkit-user-drag:none;">
               <div class="drm-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;"></div>
             </div>`
        }
        </div>
      </div>

      <!-- Header -->
      <div class="content-detail__header animate-fade-in-up stagger-2">
        <div>
          <h1 class="content-detail__title font-display">${item.title}</h1>
          <div class="content-detail__date" style="display: flex; align-items: center; gap: var(--space-2);">
            ${icons.calendar} ${formatDate(item.createdAt)}
            <span style="margin-left: var(--space-3);" class="sub-badge sub-badge--${item.minTier}">${tierName}</span>
          </div>
        </div>
        <div class="content-detail__actions">
          <button class="btn btn-secondary btn-icon" id="like-btn" aria-label="Like" title="Like this content">
            ${icons.heart}
          </button>
          <button class="btn btn-secondary btn-icon" id="tip-btn" aria-label="Tip" title="Send a tip" style="color:var(--accent-light);">
            💝
          </button>
          <button class="btn btn-ghost btn-icon" id="share-btn" aria-label="Share" title="Share">
            ${icons.share}
          </button>
        </div>
      </div>

      <!-- Like count -->
      <div class="animate-fade-in-up stagger-3" style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-6); color: var(--text-muted); font-size: var(--text-sm);">
        <span style="color: var(--accent-light);">${icons.heart}</span>
        <span id="like-count">${item.likes.toLocaleString()}</span> likes
      </div>

      <!-- Description -->
      <div class="content-detail__description animate-fade-in-up stagger-4" style="margin-bottom: var(--space-8);">
        <p>${item.description}</p>
      </div>

      <!-- Creator info mini -->
      <div class="card-glass animate-fade-in-up stagger-5" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-6); border-radius: var(--radius-lg); margin-bottom: var(--space-16);">
        <div style="width: 48px; height: 48px; border-radius: var(--radius-full); overflow: hidden; border: 2px solid var(--border-accent); flex-shrink: 0;">
          <img src="${state.creatorProfile.avatar}" alt="${state.creatorProfile.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600;">${state.creatorProfile.name}</div>
          <div style="font-size: var(--text-sm); color: var(--accent-light);">${state.creatorProfile.handle}</div>
        </div>
        <a href="#/" class="btn btn-secondary btn-sm">View Creator</a>
      </div>

      <!-- Related Content -->
      ${related.length ? `
        <div class="reveal">
          <h2 class="section__title font-display" style="margin-bottom: var(--space-6);">More to Explore</h2>
          <div class="gallery-grid" style="grid-template-columns: repeat(3, 1fr);">
            ${related.map(r => renderRelatedCard(r)).join('')}
          </div>
        </div>
      ` : ''}
    </div>`;

  return {
    html,
    afterRender() {
      // ---- Resolve DRM Blob URLs ----
      document.querySelectorAll('[data-drm-src]').forEach(async (el) => {
        const rawUrl = el.getAttribute('data-drm-src');
        if (rawUrl) {
          const { loadDrmBlob } = await import('../store.js');
          const blobUrl = await loadDrmBlob(rawUrl);
          el.src = blobUrl;
          el.removeAttribute('data-drm-src');
        }
      });

      let liked = false;
      const likeBtn = document.getElementById('like-btn');
      const likeCount = document.getElementById('like-count');

      likeBtn?.addEventListener('click', () => {
        liked = !liked;
        const count = item.likes + (liked ? 1 : 0);
        likeCount.textContent = count.toLocaleString();
        likeBtn.innerHTML = liked ? icons.heartFilled : icons.heart;
        likeBtn.classList.toggle('card-accent', liked);
        likeBtn.style.color = liked ? 'var(--accent-light)' : '';
      });

      document.getElementById('share-btn')?.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({ title: item.title, url: window.location.href });
        } else {
          navigator.clipboard?.writeText(window.location.href);
          import('../store.js').then(({ showToast }) => showToast('Link copied!'));
        }
      });

      document.querySelectorAll('[data-locked="true"]').forEach(card => {
        card.addEventListener('click', () => navigate('/subscribe'));
      });

      // Tip button
      document.getElementById('tip-btn')?.addEventListener('click', async () => {
        const state = getState();
        if (!state.isAuthenticated) {
          import('../main.js').then(({ openAuthModal }) => openAuthModal('login'));
          return;
        }

        const hasCard = state.user?.cardOnFile || state.user?.tier === 'gold';
        const amount = prompt('Enter tip amount ($):', '10');
        if (!amount || parseFloat(amount) <= 0) return;

        if (hasCard) {
          import('../store.js').then(async ({ chargeSavedCard, showToast }) => {
            showToast('Processing payment...', 'info');
            const res = await chargeSavedCard(parseFloat(amount), item.id);
            if (res.success) {
              showToast(`💝 $${parseFloat(amount).toFixed(2)} tip sent! Thank you!`, 'success');
            } else {
              showToast('Saved card payment failed. Redirecting to checkout...', 'error');
              setTimeout(() => {
                navigate(`/checkout?tip=${amount}&contentId=${item.id}`);
              }, 1500);
            }
          });
        } else {
          navigate(`/checkout?tip=${amount}&contentId=${item.id}`);
        }
      });

      // Carousel wiring
      if (item.type === 'carousel' && item.media?.length > 1) {
        const track = document.querySelector('.carousel-track');
        const dots = document.querySelectorAll('.carousel-dot');
        let currentSlide = 0;

        function updateSlide() {
          track.style.transform = `translateX(-${currentSlide * 100}%)`;
          dots.forEach((dot, i) => {
            dot.style.background = i === currentSlide ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)';
          });
        }

        document.querySelector('.carousel-prev')?.addEventListener('click', () => {
          currentSlide = currentSlide > 0 ? currentSlide - 1 : item.media.length - 1;
          updateSlide();
        });
        document.querySelector('.carousel-next')?.addEventListener('click', () => {
          currentSlide = currentSlide < item.media.length - 1 ? currentSlide + 1 : 0;
          updateSlide();
        });
      }

      // Lightbox expansion for images
      document.querySelectorAll('.content-detail-img-wrap').forEach(wrap => {
        wrap.addEventListener('click', () => {
          import('../main.js').then(({ openLightbox }) => {
            const img = wrap.querySelector('img');
            let src = img?.getAttribute('src') || '';
            let date = formatDate(item.createdAt);
            let title = item.title;
            if (item.type === 'carousel') {
               const idx = wrap.getAttribute('data-index');
               title = `${item.title} (${parseInt(idx) + 1}/${item.media.length})`;
            }
            openLightbox({
              type: 'image',
              src: src,
              title: title,
              date: date
            });
          });
        });
      });
    }
  };
}
