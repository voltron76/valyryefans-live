// ============================================================
// ValyryeFans — Gallery View
// Filterable content gallery with paywall overlays, tips & video
// ============================================================

import { getState, canAccessTier, showToast, addTip } from '../store.js';
import { navigate } from '../router.js';

const icons = {
  heart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  lock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  play: `<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  video: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
  carousel: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
};

const filters = [
  { key: 'all',       label: 'All' },
  { key: 'image',     label: '📸 Photos' },
  { key: 'video',     label: '🎬 Videos' },
  { key: 'free',      label: '🆓 Free' },
  { key: 'exclusive', label: '✨ Exclusive' },
];

function buildCard(item, idx) {
  const locked = !canAccessTier(item.minTier);
  const stagger = `stagger-${Math.min((idx % 12) + 1, 12)}`;
  const tierLabel = item.minTier === 'gold' ? 'Gold' : '';
  const isVideo = item.type === 'video';
  const isCarousel = item.type === 'carousel';

  if (locked) {
    return `
      <div class="gallery-card gallery-card--locked animate-fade-in-up ${stagger}"
           data-id="${item.id}" data-type="${item.type}" data-tier="${item.minTier}" data-locked="true" oncontextmenu="return false;">
        <img class="gallery-card__image" src="${item.thumbnail}" alt="${item.title}" loading="lazy" style="pointer-events: none; user-select: none; -webkit-user-drag: none;">
        ${isVideo ? `<div class="gallery-card__play-btn">${icons.play}</div>` : ''}
        <div class="gallery-card__overlay">
          <div class="lock-icon">${icons.lock}</div>
          <div class="lock-label">${tierLabel} Exclusive</div>
          <button class="btn btn-primary btn-sm subscribe-cta">Subscribe to Unlock</button>
        </div>
      </div>`;
  }

  return `
    <div class="gallery-card animate-fade-in-up ${stagger}"
       data-id="${item.id}" data-type="${item.type}" data-tier="${item.minTier}" style="cursor:pointer;" oncontextmenu="return false;">
      <div style="display:block;width:100%;height:100%;position:relative;" class="gallery-card__link">
        <img class="gallery-card__image" src="${item.thumbnail}" alt="${item.title}" loading="lazy" style="pointer-events: none; user-select: none; -webkit-user-drag: none;">
        <div class="drm-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;"></div>
        ${isCarousel ? `<div style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);padding:4px 8px;border-radius:12px;color:#fff;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;z-index:6;">${icons.carousel} 1/${item.media.length}</div>` : ''}
      </div>
      ${isVideo ? `<div class="gallery-card__play-btn" style="z-index:6;">${icons.play}</div>` : ''}
      <button class="gallery-card__tip-btn" data-tip-id="${item.id}" title="Send Tip" style="z-index:6;">💝</button>
      <div class="gallery-card__overlay" style="z-index:6;">
        <div class="gallery-card__title">
          ${isVideo ? `<span style="margin-right:var(--space-1);">${icons.video}</span>` : ''}${item.title}
        </div>
        <div class="gallery-card__meta">
          <span>${icons.heart} ${item.likes}</span>
          <span>·</span>
          <span>${item.createdAt}</span>
        </div>
      </div>
    </div>`;
}

export function renderGallery() {
  const state = getState();
  const { content } = state;
  const photoCount = content.filter(c => c.type === 'photo').length;
  const videoCount = content.filter(c => c.type === 'video').length;

  const html = `
    <div class="section" style="padding-top: var(--space-10);">
      <!-- Page Header -->
      <div class="section__header animate-fade-in-up" style="flex-direction: column; align-items: flex-start; gap: var(--space-2);">
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          ${icons.grid}
          <h1 class="section__title font-display">Gallery</h1>
        </div>
        <p class="section__subtitle">Browse Valyrye's collection — ${photoCount} photos${videoCount > 0 ? ` & ${videoCount} videos` : ''}</p>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs animate-fade-in-up stagger-2" id="gallery-filters" style="margin-bottom: var(--space-8); width: fit-content;">
        ${filters.map((f, i) => `
          <button class="filter-tab${i === 0 ? ' active' : ''}" data-filter="${f.key}">
            ${f.label}
          </button>
        `).join('')}
      </div>

      <!-- Content count -->
      <div class="animate-fade-in-up stagger-3" style="margin-bottom: var(--space-6); color: var(--text-muted); font-size: var(--text-sm);">
        <span id="gallery-count">${content.length}</span> items
      </div>

      <!-- Gallery Grid -->
      <div class="gallery-grid" id="gallery-grid">
        ${content.map((item, i) => buildCard(item, i)).join('')}
      </div>

      <!-- Empty state for filtered results -->
      <div class="empty-state hidden" id="gallery-empty" style="padding: var(--space-16);">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title">No content found</h3>
        <p class="empty-state__text">Try a different filter to explore more content.</p>
      </div>
    </div>

    <!-- Tip Modal -->
    <div class="tip-modal-overlay" id="gallery-tip-modal">
      <div class="tip-modal">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-6);">
          <h3 class="font-display" style="font-size:var(--text-xl);">💝 Send a Tip</h3>
          <button class="btn btn-ghost btn-sm" id="tip-modal-close" style="padding:var(--space-1);">✕</button>
        </div>
        <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--space-6);">Show your appreciation to Valyrye!</p>
        <div class="tip-amounts">
          <button class="tip-amount-btn" data-amount="5">$5</button>
          <button class="tip-amount-btn selected" data-amount="10">$10</button>
          <button class="tip-amount-btn" data-amount="25">$25</button>
          <button class="tip-amount-btn" data-amount="50">$50</button>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
          <label class="form-label">Custom Amount</label>
          <input class="form-input" type="number" id="tip-custom-amount" placeholder="Enter amount..." min="1" step="1">
        </div>
        <div class="form-group" style="margin-bottom:var(--space-6);">
          <label class="form-label">Message (optional)</label>
          <input class="form-input" type="text" id="tip-message" placeholder="Love your content!" maxlength="200">
        </div>
        <button class="btn btn-primary btn-lg w-full" id="tip-send-btn" style="justify-content:center;">
          Send Tip — <span id="tip-send-amount">$10</span>
        </button>
      </div>
    </div>
  `;

  return {
    html,
    afterRender() {
      const filtersEl = document.getElementById('gallery-filters');
      const grid = document.getElementById('gallery-grid');
      const countEl = document.getElementById('gallery-count');
      const emptyEl = document.getElementById('gallery-empty');

      // Filter tab clicks
      filtersEl?.addEventListener('click', (e) => {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;

        filtersEl.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;
        const cards = grid.querySelectorAll('.gallery-card');
        let visibleCount = 0;

        cards.forEach(card => {
          const type = card.dataset.type;
          const tier = card.dataset.tier;
          let show = true;

          switch (filter) {
            case 'image':     show = type === 'photo' || type === 'carousel'; break;
            case 'video':     show = type === 'video'; break;
            case 'free':      show = tier === 'free'; break;
            case 'exclusive': show = tier !== 'free'; break;
            default:          show = true;
          }

          card.style.display = show ? '' : 'none';
          if (show) visibleCount++;
        });

        countEl.textContent = visibleCount;
        emptyEl.classList.toggle('hidden', visibleCount > 0);
        grid.classList.toggle('hidden', visibleCount === 0);
      });

      // Subscribe CTA buttons on locked cards
      document.querySelectorAll('.subscribe-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate('/subscribe');
        });
      });

      // Locked cards click
      document.querySelectorAll('.gallery-card[data-locked="true"]').forEach(card => {
        card.addEventListener('click', () => navigate('/subscribe'));
      });

      // Unlocked cards click
      document.querySelectorAll('.gallery-card:not([data-locked="true"])').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.gallery-card__tip-btn')) return;
          navigate(`/content/${card.dataset.id}`);
        });
      });

      // --- Tip Modal ---
      const tipModal = document.getElementById('gallery-tip-modal');
      const tipClose = document.getElementById('tip-modal-close');
      const tipSendBtn = document.getElementById('tip-send-btn');
      const tipSendAmount = document.getElementById('tip-send-amount');
      const tipCustom = document.getElementById('tip-custom-amount');
      const tipMessage = document.getElementById('tip-message');
      let selectedAmount = 10;
      let tipContentId = null;

      // Open tip modal
      document.querySelectorAll('.gallery-card__tip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const state = getState();
          if (!state.isAuthenticated) {
            import('../main.js').then(({ openAuthModal }) => openAuthModal('login'));
            return;
          }
          
          // Card on file logic
          const hasCard = state.user?.cardOnFile || state.user?.tier === 'gold';
          if (!hasCard) {
            navigate(`/checkout?tip=10&contentId=${btn.dataset.tipId}`);
            return;
          }

          tipContentId = btn.dataset.tipId;
          tipModal?.classList.add('active');
        });
      });

      // Close tip modal
      tipClose?.addEventListener('click', () => tipModal?.classList.remove('active'));
      tipModal?.addEventListener('click', (e) => {
        if (e.target === tipModal) tipModal.classList.remove('active');
      });

      // Preset amount buttons
      document.querySelectorAll('.tip-amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tip-amount-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedAmount = parseFloat(btn.dataset.amount);
          if (tipCustom) tipCustom.value = '';
          if (tipSendAmount) tipSendAmount.textContent = `$${selectedAmount}`;
        });
      });

      // Custom amount
      tipCustom?.addEventListener('input', () => {
        const val = parseFloat(tipCustom.value);
        if (val > 0) {
          document.querySelectorAll('.tip-amount-btn').forEach(b => b.classList.remove('selected'));
          selectedAmount = val;
          if (tipSendAmount) tipSendAmount.textContent = `$${val}`;
        }
      });

      // Send tip
      tipSendBtn?.addEventListener('click', async () => {
        if (selectedAmount <= 0) return;
        const msg = tipMessage?.value || '';
        const targetId = tipContentId;
        const amount = selectedAmount;

        tipModal?.classList.remove('active');
        if (tipCustom) tipCustom.value = '';
        if (tipMessage) tipMessage.value = '';

        import('../store.js').then(async ({ tipPost, showToast }) => {
          const res = await tipPost(targetId, amount);
          if (res && !res.success) {
            if (res.error === 'no_card_on_file') {
              navigate(`/checkout?tip=${amount}&contentId=${targetId}`);
            } else if (res.error === 'payment_failed') {
              showToast('Saved card payment failed. Redirecting to checkout...', 'error');
              setTimeout(() => {
                navigate(`/checkout?tip=${amount}&contentId=${targetId}`);
              }, 1500);
            }
          }
        });
      });
    }
  };
}
