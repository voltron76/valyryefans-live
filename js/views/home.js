// ============================================================
// ValyryesFans — Home View (Social Post Feed)
// Premium OnlyFans-style creator feed
// ============================================================

import { getState, canAccessTier, showToast, toggleLike, addComment, tipPost, toggleBookmark, isBookmarked, polls, votePoll, incrementStoryView, subscribe } from '../store.js';
import { navigate } from '../router.js';

const verifiedBadgeSvg = '<span class="verified-badge"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>';

let activeProgressInterval = null;

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ------------------------------------
// SVG Icons
// ------------------------------------
const icons = {
  heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartFilled: `<svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-primary)" stroke="var(--accent-primary)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  comment: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  bookmark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  bookmarkFilled: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  lock: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  verified: `<svg class="verified-badge" width="18" height="18" viewBox="0 0 24 24" fill="#1da1f2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" stroke-width="2" fill="#1da1f2"/></svg>`,
};

// ------------------------------------
// Promo Banner
// ------------------------------------
function renderPromoBanner(promo) {
  if (!promo) return '';
  // Don't show banner if user already dismissed it this session
  if (sessionStorage.getItem('promo-dismissed') === 'true') return '';

  // Hide banner for Gold subscribers or Admin
  const state = getState();
  if (state.isAuthenticated && (state.currentTier === 'gold' || state.isAdmin)) return '';

  const color = promo.color || '#E91E8C';
  let countdownHtml = '';
  if (promo.expiresAt) {
    countdownHtml = `<span id="promo-countdown" style="opacity:0.9;font-size:12px;">⏰ ...</span>`;
  }
  return `
    <div class="promo-banner-top animate-fade-in-up" id="promo-banner" style="background: linear-gradient(135deg, ${color}, ${color}dd, ${color}); color: #fff;">
      <div class="promo-banner__shimmer"></div>
      <div class="promo-banner-scroller">
        <div class="promo-banner-scroller__inner">
          <span style="font-weight:800;letter-spacing:-0.3px;position:relative;z-index:1;">🔥 ${promo.discount}% OFF</span>
          <span style="opacity:0.9;position:relative;z-index:1;">${promo.description || 'Limited time offer!'}</span>
          <span style="padding:2px 10px;background:rgba(255,255,255,0.2);border-radius:var(--radius-full);font-weight:700;font-family:monospace;font-size:12px;position:relative;z-index:1;">Code: ${promo.code}</span>
          ${countdownHtml ? `<span style="position:relative;z-index:1;">${countdownHtml}</span>` : ''}
        </div>
      </div>
      <a href="#/subscribe" style="padding:4px 14px;background:#fff;color:${color};font-weight:700;border-radius:var(--radius-full);font-size:12px;text-decoration:none;position:relative;z-index:1;flex-shrink:0;">Subscribe →</a>
      <button id="close-promo" aria-label="Close promotion" style="background:rgba(255,255,255,0.25);border:none;color:#fff;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;position:relative;z-index:2;margin-left:var(--space-2);flex-shrink:0;">✕</button>
    </div>`;
}

// ------------------------------------
// Creator Profile Header
// ------------------------------------
function renderCreatorHeader(creatorProfile, isGold) {
  const banners = creatorProfile.banners && creatorProfile.banners.length > 0
    ? creatorProfile.banners
    : [creatorProfile.banner || 'assets/images/hero-01.jpg'];

  return `
    <div class="creator-header">
      <div class="creator-header__banner" style="position: relative; overflow: hidden; height: 240px; border-radius: 0 0 var(--radius-lg) var(--radius-lg);">
        ${banners.map((src, i) => `
          <img src="${src}" alt="Banner ${i+1}" class="creator-header__banner-slide" style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: ${i === 0 ? 1 : 0};
            transition: opacity 1.5s ease-in-out;
          ">
        `).join('')}
      </div>
      <div class="creator-header__info">
        <div class="creator-header__avatar-wrap">
          <img src="${creatorProfile.avatar}" alt="${creatorProfile.name}" class="creator-header__avatar">
          <span class="online-dot"></span>
        </div>
        <div class="creator-header__details">
          <h1 class="creator-header__name">
            ${creatorProfile.name}
            ${icons.verified}
          </h1>
          <p class="creator-header__handle">${creatorProfile.handle}</p>
          <p class="creator-header__bio">${creatorProfile.bio.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="creator-header__stats">
          <div class="stat-item"><strong>${creatorProfile.stats.posts}</strong><span>Posts</span></div>
          <div class="stat-item"><strong>${creatorProfile.stats.photos}</strong><span>Photos</span></div>
          <div class="stat-item"><strong>${creatorProfile.stats.videos}</strong><span>Videos</span></div>
          <div class="stat-item"><strong>${creatorProfile.stats.fans}</strong><span>Fans</span></div>
        </div>
        ${!isGold
          ? `<a href="#/subscribe" class="btn btn-primary btn-lg w-full" style="justify-content:center;margin-top:var(--space-4);">Subscribe — $14.99/mo</a>`
          : `<div class="btn btn-secondary w-full" style="justify-content:center;margin-top:var(--space-4);pointer-events:none;">✅ Gold Member</div>`
        }
      </div>
    </div>`;
}

// ------------------------------------
// Stories Bar
// ------------------------------------
function renderStoriesBar(allStories, isAdmin) {
  return `
    <div class="stories-bar">
      ${isAdmin ? `
        <div class="story-item story-item--add" id="add-story-btn">
          <div class="story-ring"><span>+</span></div>
          <span class="story-label">New Story</span>
        </div>
      ` : ''}
      ${allStories.map((story, i) => `
        <div class="story-item" data-story-index="${i}">
          <div class="story-ring story-ring--unseen">
            <img src="${story.thumbnail}" alt="${story.title}">
          </div>
          <span class="story-label">${story.title}</span>
        </div>
      `).join('')}
    </div>`;
}

// ------------------------------------
// Feed Tabs
// ------------------------------------
function renderFeedTabs() {
  return `
    <div class="feed-tabs">
      <button class="feed-tab active" data-tab="all">All Posts</button>
      <button class="feed-tab" data-tab="photos">Photos</button>
      <button class="feed-tab" data-tab="videos">Videos</button>
    </div>`;
}

// ------------------------------------
// Poll Card
// ------------------------------------
function renderPollCard(poll, creatorProfile) {
  const totalVotes = poll.totalVotes || 0;
  const showResults = poll.userVote || poll.isExpired;
  return `
    <div class="post-card post-card--poll animate-fade-in-up" data-poll-id="${poll.id}">
      <div class="post-card__header">
        <img src="${creatorProfile.avatar}" class="post-card__avatar" alt="Avatar">
        <div>
          <span class="post-card__name">${creatorProfile.name} ${icons.verified}</span>
          <span class="post-card__time">${poll.createdAt || 'Just now'}</span>
        </div>
        <button class="post-card__menu" aria-label="Post options">⋯</button>
      </div>
      <div class="poll-card">
        <h3 class="poll-card__question">${poll.question}</h3>
        <div class="poll-card__options">
          ${poll.options.map(opt => `
            <button class="poll-option ${poll.userVote === opt.id ? 'poll-option--voted' : ''} ${showResults ? 'poll-option--results' : ''}" data-poll="${poll.id}" data-option="${opt.id}" ${showResults ? 'disabled' : ''}>
              <span class="poll-option__text">${opt.text}</span>
              ${showResults ? `<span class="poll-option__pct">${totalVotes > 0 ? Math.round(opt.votes / totalVotes * 100) : 0}%</span>` : ''}
              ${showResults ? `<div class="poll-option__bar" style="width:${totalVotes > 0 ? Math.round(opt.votes / totalVotes * 100) : 0}%"></div>` : ''}
            </button>
          `).join('')}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:var(--space-3); font-size:var(--text-xs); color:var(--text-muted);">
          <span>${totalVotes.toLocaleString()} votes</span>
          <span class="poll-timer-home" data-expiry="${poll.expiresAt}" style="font-weight:600; color:${poll.isExpired ? 'var(--text-muted)' : 'var(--accent)'};">
            ${poll.isExpired ? 'Completed' : 'Calculating time...'}
          </span>
        </div>
      </div>
    </div>`;
}

// ------------------------------------
// Post Card
// ------------------------------------
function renderPostCard(item, creatorProfile) {
  const locked = !canAccessTier(item.minTier);
  const bookmarked = typeof isBookmarked === 'function' && isBookmarked(item.id);
  const commentsArr = item.comments || [];
  const lastComments = commentsArr.slice(-2);

  // Media rendering
  let mediaHtml = '';
  if (locked) {
    mediaHtml = `
      <div class="post-card__media post-card__media--locked" oncontextmenu="return false;">
        <img src="${item.thumbnail}" alt="Locked" class="post-card__img post-card__img--blur" style="pointer-events: none; user-select: none; -webkit-user-drag: none;">
        <div class="post-card__lock-overlay">
          ${icons.lock}
          <span>Subscribe to unlock</span>
          <a href="#/subscribe" class="btn btn-primary btn-sm">Unlock — $14.99/mo</a>
        </div>
      </div>`;
  } else if (item.type === 'video') {
    mediaHtml = `
      <div class="post-card__media" oncontextmenu="return false;" style="position: relative;">
        <video data-drm-src="${item.videoUrl || item.media?.[0] || item.thumbnail}" controls controlslist="nodownload" disablepictureinpicture poster="${item.thumbnail}" class="post-card__video protect-media" style="-webkit-user-drag: none;"></video>
      </div>`;
  } else if (item.media?.length > 1) {
    mediaHtml = `
      <div class="post-card__media post-card__carousel" data-post-id="${item.id}" oncontextmenu="return false;" style="position: relative;">
        <div class="post-card__carousel-track">
          ${item.media.map((src, i) => `<img data-drm-src="${src}" alt="${item.title} ${i + 1}" class="post-card__img protect-media ${i === 0 ? 'active' : ''}" style="pointer-events: none; user-select: none; -webkit-user-drag: none;">`).join('')}
        </div>
        <div class="drm-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; pointer-events: none;"></div>
        <button class="carousel-arrow carousel-arrow--left" data-dir="-1" aria-label="Previous slide" style="z-index: 6;">&#8249;</button>
        <button class="carousel-arrow carousel-arrow--right" data-dir="1" aria-label="Next slide" style="z-index: 6;">&#8250;</button>
        <div class="post-card__carousel-dots" style="z-index: 6;">
          ${item.media.map((_, i) => `<span class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
      </div>`;
  } else {
    mediaHtml = `
      <div class="post-card__media" oncontextmenu="return false;" style="position: relative;">
        <img data-drm-src="${item.media?.[0] || item.thumbnail}" alt="${item.title}" class="post-card__img protect-media" style="pointer-events: none; user-select: none; -webkit-user-drag: none;">
        <div class="drm-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; pointer-events: none;"></div>
      </div>`;
  }

  return `
    <div class="post-card animate-fade-in-up" data-post-id="${item.id}" data-type="${item.type || 'photo'}">
      <!-- Header -->
      <div class="post-card__header">
        <img src="${creatorProfile.avatar}" class="post-card__avatar" alt="Avatar">
        <div>
          <span class="post-card__name">${creatorProfile.name} ${icons.verified}</span>
          <span class="post-card__time">${item.createdAt || 'Just now'}</span>
        </div>
        <button class="post-card__menu" aria-label="Post options">⋯</button>
      </div>

      <!-- Caption -->
      ${item.caption || item.title ? `<p class="post-card__caption">${item.caption || item.title}</p>` : ''}

      <!-- Media -->
      ${mediaHtml}

      ${!locked ? `
      <!-- Action Bar -->
      <div class="post-card__actions">
        <button class="post-action ${item.likedByUser ? 'post-action--active' : ''}" data-action="like" data-id="${item.id}" aria-label="Like post. ${item.likes || 0} likes">
          ${item.likedByUser ? icons.heartFilled : icons.heart} <span class="like-count" aria-hidden="true">${item.likes || 0}</span>
        </button>
        <button class="post-action" data-action="comment" data-id="${item.id}" aria-label="Comment on post. ${commentsArr.length || 0} comments">
          ${icons.comment} <span aria-hidden="true">${commentsArr.length || 0}</span>
        </button>
        <button class="post-action" data-action="tip" data-id="${item.id}">
          💰 Tip
        </button>
        <button class="post-action ${bookmarked ? 'post-action--active' : ''}" data-action="bookmark" data-id="${item.id}" style="margin-left:auto;" aria-label="Bookmark post">
          ${bookmarked ? icons.bookmarkFilled : icons.bookmark}
        </button>
      </div>

      <!-- Comments Section -->
      <div class="post-card__comments" id="comments-${item.id}">
        ${lastComments.map(c => {
          const showBadge = c.isCreator || c.tier === 'gold';
          return `
          <div class="post-comment">
            <strong class="${c.isCreator ? 'creator-name' : ''}">${escapeHtml(c.userName)}${showBadge ? verifiedBadgeSvg : ''}</strong>
            <span>${escapeHtml(c.text)}</span>
          </div>
        `;
        }).join('')}
        ${commentsArr.length > 2 ? `<button class="post-comments__more" data-id="${item.id}">View all ${commentsArr.length} comments</button>` : ''}
        <div class="post-comment-input" data-id="${item.id}">
          <input type="text" placeholder="Add a comment..." class="comment-input" data-id="${item.id}">
          <button class="comment-send" data-id="${item.id}">Post</button>
        </div>
      </div>
      ` : ''}
    </div>`;
}

// ------------------------------------
// Suggested Creators
// ------------------------------------
function renderSuggestedCreators() {
  const suggested = ['Luna', 'Aria', 'Mia'];
  return `
    <div class="suggested-section">
      <h3>Suggested Creators</h3>
      <div class="suggested-list">
        ${suggested.map((name, i) => `
          <div class="suggested-card card-glass">
            <div class="suggested-avatar" style="background:hsl(${i * 120},70%,60%);">${name[0]}</div>
            <span class="suggested-name">${name}</span>
            <span class="suggested-handle">@${name.toLowerCase()}</span>
            <button class="btn btn-sm btn-secondary">Follow</button>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ------------------------------------
// Tip Modal (inline)
// ------------------------------------
function renderTipModal() {
  return `
    <div class="tip-modal-overlay" id="tip-modal" style="display:none;">
      <div class="tip-modal card-glass">
        <div class="tip-modal__header">
          <h3>Send a Tip 💰</h3>
          <button class="tip-modal__close" id="tip-modal-close" aria-label="Close tip modal">✕</button>
        </div>
        <div class="tip-modal__amounts">
          <button class="tip-amount-btn" data-amount="5">$5</button>
          <button class="tip-amount-btn" data-amount="10">$10</button>
          <button class="tip-amount-btn" data-amount="25">$25</button>
          <button class="tip-amount-btn" data-amount="50">$50</button>
        </div>
        <div style="margin-top:var(--space-3);">
          <input type="number" min="1" step="0.01" class="tip-modal__message" placeholder="Custom amount ($)" id="tip-custom-amount" style="width:100%;">
        </div>
        <input type="text" class="tip-modal__message" placeholder="Add a message (optional)" id="tip-message">
        <button class="btn btn-primary w-full" id="tip-confirm" style="justify-content:center;margin-top:var(--space-3);">Send Tip</button>
      </div>
    </div>`;
}

// ============================================================
// Main Render
// ============================================================
export function renderHome() {
  const state = getState();
  const { creatorProfile, content, currentTier } = state;
  const isGold = currentTier === 'gold' || state.user?.tier === 'gold';

  let storeUnsubscribe = null;
  let pollTimerInterval = null;
  let bannerInterval = null;

  // Promo data from state
  const promo = state.activePromo;

  // Polls data (may be undefined if not exported from store)
  const pollList = typeof polls !== 'undefined' && Array.isArray(polls) ? polls : [];

  // Separate pinned posts and stories
  const stories = content.filter(c => c.category === 'story');
  const pinnedPosts = content.filter(c => c.pinned && c.category !== 'story' && c.category !== 'promo');
  const regularPosts = content.filter(c => !c.pinned && c.category !== 'story' && c.category !== 'promo');

  const allStories = stories;

  const html = `
    <!-- Promo Banner -->
    ${renderPromoBanner(promo)}

    <!-- Creator Header -->
    ${renderCreatorHeader(creatorProfile, isGold)}

    <!-- Stories Bar -->
    ${renderStoriesBar(allStories, state.isAdmin)}

    <!-- Feed Tabs -->
    ${renderFeedTabs()}

    <!-- Feed Container -->
    <div class="feed-container" id="feed-container">

      <!-- Pinned Posts -->
      ${pinnedPosts.map(item => `
        <div class="pinned-badge-wrap">
          <span class="pinned-badge">📌 Pinned</span>
          ${renderPostCard(item, creatorProfile)}
        </div>
      `).join('')}

      <!-- Poll Cards -->
      ${pollList.map(poll => renderPollCard(poll, creatorProfile)).join('')}

      <!-- Content Feed -->
      ${regularPosts.map(item => renderPostCard(item, creatorProfile)).join('')}

    </div>

    <!-- Suggested Creators -->
    ${renderSuggestedCreators()}

    <!-- Tip Modal -->
    ${renderTipModal()}
  `;

  let tipTargetId = null;

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

      // ---- Auto-scrolling Hero Banner Carousel ----
      const bannerSlides = document.querySelectorAll('.creator-header__banner-slide');
      if (bannerSlides.length > 1) {
        let currentSlide = 0;
        bannerInterval = setInterval(() => {
          bannerSlides[currentSlide].style.opacity = 0;
          currentSlide = (currentSlide + 1) % bannerSlides.length;
          bannerSlides[currentSlide].style.opacity = 1;
        }, 5000);
      }

      // ---- Close Promo Banner ----
      document.getElementById('close-promo')?.addEventListener('click', () => {
        const banner = document.getElementById('promo-banner');
        if (banner) {
          banner.style.opacity = '0';
          banner.style.transform = 'translateY(-100%)';
          setTimeout(() => banner.remove(), 300);
          sessionStorage.setItem('promo-dismissed', 'true');
        }
      });

      // ---- Promo Countdown Timer ----
      const countdownEl = document.getElementById('promo-countdown');
      if (countdownEl) {
        const state = getState();
        const expiresAt = state.activePromo?.expiresAt;
        if (expiresAt) {
          const updateCountdown = () => {
            const now = Date.now();
            const end = new Date(expiresAt).getTime();
            const diff = end - now;
            if (diff <= 0) {
              countdownEl.textContent = '⏰ Expired';
              const banner = document.getElementById('promo-banner');
              if (banner) { banner.style.opacity = '0.5'; }
              return;
            }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            let text = '⏰ ';
            if (d > 0) text += `${d}d `;
            text += `${h}h ${m}m ${s}s`;
            countdownEl.textContent = text;
          };
          updateCountdown();
          setInterval(updateCountdown, 1000);
        }
      }

      // ---- Feed Tab Switching ----
      document.querySelectorAll('.feed-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const filter = tab.dataset.tab;
          document.querySelectorAll('.post-card:not(.post-card--poll)').forEach(card => {
            if (filter === 'all') {
              card.style.display = '';
            } else if (filter === 'photos') {
              card.style.display = card.dataset.type === 'photo' || card.dataset.type === 'carousel' ? '' : 'none';
            } else if (filter === 'videos') {
              card.style.display = card.dataset.type === 'video' ? '' : 'none';
            }
          });
        });
      });

      // ---- Poll Voting ----
      document.querySelectorAll('.poll-option:not(.poll-option--results)').forEach(btn => {
        btn.addEventListener('click', () => {
          const pollId = btn.dataset.poll;
          const optionId = btn.dataset.option;
          if (typeof votePoll === 'function') {
            votePoll(pollId, optionId);
          }
          showToast('Vote recorded! 🗳️');
          // Visual feedback — disable all options in this poll
          const parent = btn.closest('.poll-card__options');
          if (parent) {
            parent.querySelectorAll('.poll-option').forEach(o => {
              o.classList.add('poll-option--results');
              o.disabled = true;
            });
            btn.classList.add('poll-option--voted');
          }
        });
      });

      // ---- Like Buttons ----
      document.querySelectorAll('[data-action="like"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          if (typeof toggleLike === 'function') {
            toggleLike(id);
          }
        });
      });

      // ---- Comment Submit ----
      document.querySelectorAll('.comment-send').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const input = document.querySelector(`.comment-input[data-id="${id}"]`);
          if (!input || !input.value.trim()) return;
          const text = input.value.trim();
          if (typeof addComment === 'function') {
            addComment(id, text);
          }
          // Append comment visually
          const commentsContainer = document.getElementById(`comments-${id}`);
          if (commentsContainer) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'post-comment animate-fade-in-up';
            const isGold = state.currentTier === 'gold';
            commentDiv.innerHTML = `<strong>${escapeHtml(state.user?.name || 'You')}${isGold ? verifiedBadgeSvg : ''}</strong> <span>${escapeHtml(text)}</span>`;
            const inputWrap = commentsContainer.querySelector('.post-comment-input');
            commentsContainer.insertBefore(commentDiv, inputWrap);
          }
          input.value = '';
          showToast('Comment added! 💬');
        });
      });

      // Enter key for comment input
      document.querySelectorAll('.comment-input').forEach(input => {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const sendBtn = document.querySelector(`.comment-send[data-id="${input.dataset.id}"]`);
            sendBtn?.click();
          }
        });
      });

      // ---- View all comments ----
      document.querySelectorAll('.post-comments__more').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const post = state.content.find(c => c.id === id);
          if (!post || !post.comments) return;

          const commentsContainer = document.getElementById(`comments-${id}`);
          if (commentsContainer) {
            // Remove existing comment nodes
            commentsContainer.querySelectorAll('.post-comment').forEach(el => el.remove());

            // Render all comments
            const inputWrap = commentsContainer.querySelector('.post-comment-input');
            post.comments.forEach(c => {
              const commentDiv = document.createElement('div');
              commentDiv.className = 'post-comment animate-fade-in-up';
              const showBadge = c.isCreator || c.tier === 'gold';
              commentDiv.innerHTML = `<strong>${escapeHtml(c.userName)}${showBadge ? verifiedBadgeSvg : ''}</strong> <span>${escapeHtml(c.text)}</span>`;
              commentsContainer.insertBefore(commentDiv, inputWrap);
            });

            // Remove the "View all" button
            btn.remove();
          }
        });
      });

      // ---- Tip Buttons ----
      const tipModal = document.getElementById('tip-modal');
      document.querySelectorAll('[data-action="tip"]').forEach(btn => {
        btn.addEventListener('click', () => {
          tipTargetId = btn.dataset.id;
          if (tipModal) tipModal.style.display = 'flex';
        });
      });

      document.getElementById('tip-modal-close')?.addEventListener('click', () => {
        if (tipModal) tipModal.style.display = 'none';
        tipTargetId = null;
      });

      tipModal?.addEventListener('click', (e) => {
        if (e.target === tipModal) {
          tipModal.style.display = 'none';
          tipTargetId = null;
        }
      });

      let selectedTipAmount = null;
      const tipCustomInput = document.getElementById('tip-custom-amount');
      document.querySelectorAll('.tip-amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tip-amount-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedTipAmount = parseInt(btn.dataset.amount);
          if (tipCustomInput) tipCustomInput.value = '';
        });
      });
      tipCustomInput?.addEventListener('input', () => {
        const val = parseFloat(tipCustomInput.value);
        if (val > 0) {
          selectedTipAmount = val;
          document.querySelectorAll('.tip-amount-btn').forEach(b => b.classList.remove('active'));
        }
      });

      document.getElementById('tip-confirm')?.addEventListener('click', async () => {
        if (!selectedTipAmount) {
          showToast('Please select a tip amount', 'error');
          return;
        }
        const message = document.getElementById('tip-message')?.value || '';
        const targetId = tipTargetId;
        const amount = selectedTipAmount;

        if (tipModal) tipModal.style.display = 'none';
        selectedTipAmount = null;
        tipTargetId = null;
        const msgInput = document.getElementById('tip-message');
        if (msgInput) msgInput.value = '';
        document.querySelectorAll('.tip-amount-btn').forEach(b => b.classList.remove('active'));

        if (typeof tipPost === 'function') {
          const result = await tipPost(targetId, amount, message, '#/');
          if (result && !result.success && !result.redirecting) {
            showToast(result.error || 'Tip failed — please try again', 'error');
          }
        }
      });

      // ---- Bookmark Buttons ----
      document.querySelectorAll('[data-action="bookmark"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          if (typeof toggleBookmark === 'function') {
            toggleBookmark(id);
          }
          const isActive = btn.classList.toggle('post-action--active');
          btn.innerHTML = isActive ? icons.bookmarkFilled : icons.bookmark;
        });
      });

      // ---- Story Clicks ----
      const addStoryBtn = document.getElementById('add-story-btn');
      addStoryBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('/admin');
      });

      document.querySelectorAll('.story-item[data-story-index]').forEach(item => {
        item.addEventListener('click', (e) => {
          const index = parseInt(item.dataset.storyIndex);
          openStoryViewer(index);
        });
      });

      function formatRelativeTime(dateString) {
        if (!dateString) return 'Just now';
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHr = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHr / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin}m`;
        if (diffHr < 24) return `${diffHr}h`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      function openStoryViewer(startCircleIndex) {
        let currentCircleIndex = startCircleIndex;
        let currentSlideIndex = 0;
        let storyProgress = 0;
        const duration = 5000; // 5 seconds per story slide
        const intervalTime = 50; // Update every 50ms
        let isPaused = false;
        const viewedStoryIds = new Set();
        
        let modal = document.getElementById('story-viewer-modal');
        if (!modal) {
          const viewerHtml = `
            <div class="story-viewer" id="story-viewer-modal">
              <div class="story-viewer__container">
                <div class="story-viewer__progress-container" id="story-progress-container"></div>
                <div class="story-viewer__header">
                  <img src="${creatorProfile.avatar}" class="story-viewer__avatar">
                  <div class="story-viewer__creator-info">
                    <span class="story-viewer__name">${creatorProfile.name}</span>
                    <span class="story-viewer__time" id="story-viewer-time"></span>
                  </div>
                  <button class="story-viewer__close" id="story-viewer-close" aria-label="Close story viewer">✕</button>
                </div>
                <div class="story-viewer__content">
                  <div class="story-viewer__click-left" id="story-click-left"></div>
                  <div class="story-viewer__click-right" id="story-click-right"></div>
                  <button class="story-viewer__nav-arrow story-viewer__nav-arrow--left" id="story-nav-left" aria-label="Previous story" style="pointer-events: auto; z-index: 15;">&lt;</button>
                  <button class="story-viewer__nav-arrow story-viewer__nav-arrow--right" id="story-nav-right" aria-label="Next story" style="pointer-events: auto; z-index: 15;">&gt;</button>
                  <div class="story-viewer__media-container" id="story-media-container"></div>
                </div>
                <div class="story-viewer__footer">
                  <div class="story-viewer__footer-left">
                    <span class="story-viewer__caption" id="story-viewer-caption"></span>
                    <div class="story-viewer__stats-row" id="story-viewer-stats" style="margin-top:var(--space-2); display:flex; gap:var(--space-3); font-size:12px; color:rgba(255,255,255,0.6);">
                    </div>
                  </div>
                  <div class="story-viewer__footer-right" style="display:flex; gap:var(--space-2); align-items:center;">
                    <button class="story-viewer__tip-btn" id="story-viewer-tip" style="background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:var(--space-2) var(--space-4); border-radius:var(--radius-full); cursor:pointer; display:flex; align-items:center; gap:var(--space-1); transition:all 0.2s; font-size:12px; z-index:15;">💰 Tip</button>
                    <button class="story-viewer__like-btn" id="story-viewer-like" style="z-index:15;"></button>
                  </div>
                </div>
              </div>
            </div>
          `;
          document.body.insertAdjacentHTML('beforeend', viewerHtml);
          modal = document.getElementById('story-viewer-modal');
        }

        const progressContainer = document.getElementById('story-progress-container');
        const mediaContainer = document.getElementById('story-media-container');
        const captionEl = document.getElementById('story-viewer-caption');
        const timeEl = document.getElementById('story-viewer-time');
        const likeBtn = document.getElementById('story-viewer-like');
        const closeBtn = document.getElementById('story-viewer-close');
        const clickLeft = document.getElementById('story-click-left');
        const clickRight = document.getElementById('story-click-right');
        const navLeft = document.getElementById('story-nav-left');
        const navRight = document.getElementById('story-nav-right');
        const tipBtn = document.getElementById('story-viewer-tip');

        let activeSlides = [];
        
        const getSlidesForStory = (story) => {
          if (!story) return [];
          if (story.type === 'carousel' && story.media && story.media.length > 0) {
            return story.media.map(url => ({ type: 'image', url: url }));
          } else if (story.type === 'video') {
            return [{ type: 'video', url: story.videoUrl || story.media?.[0] || story.thumbnail }];
          } else {
            return [{ type: 'image', url: story.thumbnail || story.media?.[0] }];
          }
        };

        const renderProgressBars = () => {
          progressContainer.innerHTML = activeSlides.map((_, i) => `
            <div class="story-viewer__progress-bar">
              <div class="story-viewer__progress-fill" id="story-fill-${i}"></div>
            </div>
          `).join('');
        };

        const updateStats = () => {
          const story = allStories[currentCircleIndex];
          if (!story) return;
          
          const statsEl = document.getElementById('story-viewer-stats');
          if (statsEl) {
            const originalItem = state.content.find(c => c.id === story.id);
            const likesCount = originalItem ? (originalItem.likes || 0) : (story.likes || 0);
            const viewsCount = originalItem ? (originalItem.views || 0) : (story.views || 0);
            statsEl.innerHTML = `
              <span>❤️ ${likesCount} likes</span>
              <span>👁️ ${viewsCount} views</span>
            `;
          }
        };

        const updateLikeBtn = () => {
          const story = allStories[currentCircleIndex];
          if (!story) return;
          
          const originalItem = state.content.find(c => c.id === story.id);
          const liked = originalItem ? originalItem.likedByUser : story.likedByUser;
          
          likeBtn.className = `story-viewer__like-btn ${liked ? 'story-viewer__like-btn--active' : ''}`;
          likeBtn.innerHTML = liked ? icons.heartFilled : icons.heart;
        };

        const showCircle = (circleIndex, startSlideIndex = 0) => {
          currentCircleIndex = circleIndex;
          modal.setAttribute('data-current-circle-index', circleIndex);
          const story = allStories[currentCircleIndex];
          if (!story) {
            closeStoryViewer();
            return;
          }
          
          activeSlides = getSlidesForStory(story);
          renderProgressBars();
          showSlide(startSlideIndex);
        };

        const showSlide = (slideIndex) => {
          currentSlideIndex = slideIndex;
          storyProgress = 0;
          const story = allStories[currentCircleIndex];
          const slide = activeSlides[currentSlideIndex];
          
          if (!story || !slide) {
            closeStoryViewer();
            return;
          }

          // Reset progress fills
          for (let i = 0; i < activeSlides.length; i++) {
            const fill = document.getElementById(`story-fill-${i}`);
            if (fill) {
              if (i < currentSlideIndex) fill.style.width = '100%';
              else if (i > currentSlideIndex) fill.style.width = '0%';
            }
          }

          timeEl.textContent = formatRelativeTime(story.rawCreatedAt) || 'Just now';
          captionEl.textContent = story.title || '';

          mediaContainer.innerHTML = '';
          if (slide.type === 'video') {
            const video = document.createElement('video');
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('controlslist', 'nodownload');
            video.setAttribute('disablepictureinpicture', 'true');
            video.setAttribute('oncontextmenu', 'return false;');
            video.className = 'story-viewer__media protect-media';
            mediaContainer.appendChild(video);
            
            // Resolve Blob url
            import('../store.js').then(async ({ loadDrmBlob }) => {
              video.src = await loadDrmBlob(slide.url);
            });
          } else {
            const img = document.createElement('img');
            img.className = 'story-viewer__media protect-media';
            img.style.pointerEvents = 'none';
            img.style.userSelect = 'none';
            img.setAttribute('oncontextmenu', 'return false;');
            mediaContainer.appendChild(img);
            
            // Resolve Blob url
            import('../store.js').then(async ({ loadDrmBlob }) => {
              img.src = await loadDrmBlob(slide.url);
            });
          }

          updateLikeBtn();
          updateStats();
          
          if (typeof incrementStoryView === 'function' && story.id && !viewedStoryIds.has(story.id)) {
            viewedStoryIds.add(story.id);
            incrementStoryView(story.id);
            setTimeout(updateStats, 100);
          }
          
          startTimer();
        };

        const startTimer = () => {
          clearInterval(activeProgressInterval);
          activeProgressInterval = setInterval(() => {
            const tipModalVisible = document.getElementById('tip-modal')?.style.display === 'flex';
            if (isPaused || tipModalVisible) return;

            storyProgress += (intervalTime / duration) * 100;
            if (storyProgress >= 100) {
              storyProgress = 100;
              clearInterval(activeProgressInterval);
              
              if (currentSlideIndex < activeSlides.length - 1) {
                showSlide(currentSlideIndex + 1);
              } else if (currentCircleIndex < allStories.length - 1) {
                showCircle(currentCircleIndex + 1, 0);
              } else {
                closeStoryViewer();
              }
            }

            const activeFill = document.getElementById(`story-fill-${currentSlideIndex}`);
            if (activeFill) {
              activeFill.style.width = `${storyProgress}%`;
            }
          }, intervalTime);
        };

        const closeStoryViewer = () => {
          clearInterval(activeProgressInterval);
          modal?.remove();
        };

        closeBtn?.addEventListener('click', closeStoryViewer);
        
        const goNext = () => {
          if (currentSlideIndex < activeSlides.length - 1) {
            showSlide(currentSlideIndex + 1);
          } else if (currentCircleIndex < allStories.length - 1) {
            showCircle(currentCircleIndex + 1, 0);
          } else {
            closeStoryViewer();
          }
        };

        const goPrev = () => {
          if (currentSlideIndex > 0) {
            showSlide(currentSlideIndex - 1);
          } else if (currentCircleIndex > 0) {
            const prevStory = allStories[currentCircleIndex - 1];
            const prevSlides = getSlidesForStory(prevStory);
            showCircle(currentCircleIndex - 1, prevSlides.length - 1);
          } else {
            showSlide(0);
          }
        };

        clickLeft?.addEventListener('click', goPrev);
        clickRight?.addEventListener('click', goNext);
        navLeft?.addEventListener('click', (e) => { e.stopPropagation(); goPrev(); });
        navRight?.addEventListener('click', (e) => { e.stopPropagation(); goNext(); });

        const pauseStory = () => { isPaused = true; };
        const resumeStory = () => { isPaused = false; };
        
        const contentArea = modal.querySelector('.story-viewer__content');
        contentArea?.addEventListener('mousedown', pauseStory);
        contentArea?.addEventListener('mouseup', resumeStory);
        contentArea?.addEventListener('touchstart', pauseStory);
        contentArea?.addEventListener('touchend', resumeStory);

        likeBtn?.addEventListener('click', async (e) => {
          e.stopPropagation();
          const story = allStories[currentCircleIndex];
          if (!story) return;

          if (typeof toggleLike === 'function') {
            await toggleLike(story.id);
          }

          updateLikeBtn();
          updateStats();

          const feedCard = document.querySelector(`.post-action[data-id="${story.id}"][data-action="like"]`);
          if (feedCard) {
            const originalItem = state.content.find(c => c.id === story.id);
            const likesCount = originalItem ? (originalItem.likes || 0) : story.likes;
            const liked = originalItem ? originalItem.likedByUser : story.likedByUser;
            
            feedCard.classList.toggle('post-action--active', liked);
            feedCard.innerHTML = (liked ? icons.heartFilled : icons.heart) + ` <span class="like-count" aria-hidden="true">${likesCount}</span>`;
            feedCard.setAttribute('aria-label', `Like post. ${likesCount} likes`);
          }
        });

        tipBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          const story = allStories[currentCircleIndex];
          if (!story) return;
          tipTargetId = story.id;
          isPaused = true;
          const tipModal = document.getElementById('tip-modal');
          if (tipModal) tipModal.style.display = 'flex';
        });

        showCircle(currentCircleIndex, 0);
      }

      // ---- Subscribe CTAs on locked posts ----
      document.querySelectorAll('.post-card__lock-overlay .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          navigate('/subscribe');
        });
      });

      // ---- Locked media click ----
      document.querySelectorAll('.post-card__media--locked').forEach(media => {
        media.style.cursor = 'pointer';
        media.addEventListener('click', () => navigate('/subscribe'));
      });

      // ---- Carousel Interaction ----
      document.querySelectorAll('.post-card__carousel').forEach(carousel => {
        const track = carousel.querySelector('.post-card__carousel-track');
        const dots = carousel.querySelectorAll('.carousel-dot');
        const arrowLeft = carousel.querySelector('.carousel-arrow--left');
        const arrowRight = carousel.querySelector('.carousel-arrow--right');
        const totalSlides = dots.length;
        let currentIndex = 0;

        // Slide to a given index
        const goToSlide = (index) => {
          if (index < 0) index = 0;
          if (index >= totalSlides) index = totalSlides - 1;
          currentIndex = index;
          track.style.transform = `translateX(-${currentIndex * 100}%)`;

          // Update dots
          dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
          });

          // Update arrow disabled state
          if (arrowLeft) arrowLeft.disabled = currentIndex === 0;
          if (arrowRight) arrowRight.disabled = currentIndex === totalSlides - 1;
        };

        // Initialize arrow state
        if (arrowLeft) arrowLeft.disabled = true;
        if (arrowRight && totalSlides <= 1) arrowRight.disabled = true;

        // Arrow clicks
        if (arrowLeft) {
          arrowLeft.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(currentIndex - 1);
          });
        }
        if (arrowRight) {
          arrowRight.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(currentIndex + 1);
          });
        }

        // Dot clicks
        dots.forEach(dot => {
          dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(dot.dataset.index, 10);
            if (!isNaN(idx)) goToSlide(idx);
          });
        });

        // Touch / Swipe support
        let touchStartX = 0;
        let touchStartY = 0;
        let touchDeltaX = 0;
        let isSwiping = false;
        const swipeThreshold = 40;

        carousel.addEventListener('touchstart', (e) => {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchDeltaX = 0;
          isSwiping = false;
          track.classList.add('is-dragging');
        }, { passive: true });

        carousel.addEventListener('touchmove', (e) => {
          const dx = e.touches[0].clientX - touchStartX;
          const dy = e.touches[0].clientY - touchStartY;

          // Only start swiping if horizontal movement dominates
          if (!isSwiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
            isSwiping = true;
          }

          if (isSwiping) {
            e.preventDefault();
            touchDeltaX = dx;
            const carouselWidth = carousel.offsetWidth;
            const baseOffset = -currentIndex * carouselWidth;
            track.style.transform = `translateX(${baseOffset + touchDeltaX}px)`;
          }
        }, { passive: false });

        carousel.addEventListener('touchend', () => {
          track.classList.remove('is-dragging');
          if (isSwiping) {
            if (touchDeltaX < -swipeThreshold && currentIndex < totalSlides - 1) {
              goToSlide(currentIndex + 1);
            } else if (touchDeltaX > swipeThreshold && currentIndex > 0) {
              goToSlide(currentIndex - 1);
            } else {
              goToSlide(currentIndex); // snap back
            }
          }
          touchDeltaX = 0;
          isSwiping = false;
        }, { passive: true });
      });

      // ---- Comment toggle (focus input) ----
      document.querySelectorAll('[data-action="comment"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const input = document.querySelector(`.comment-input[data-id="${id}"]`);
          if (input) input.focus();
        });
      });

      // ---- Home Polls Countdown Timers ----
      pollTimerInterval = setInterval(() => {
        document.querySelectorAll('.poll-timer-home').forEach(timerEl => {
          const expiry = timerEl.dataset.expiry;
          if (!expiry || expiry === 'null' || expiry === 'undefined' || timerEl.textContent.trim() === 'Completed') return;

          const now = Date.now();
          const end = new Date(expiry).getTime();
          if (isNaN(end)) { timerEl.textContent = 'Completed'; return; }
          const diff = end - now;

          if (diff <= 0) {
            timerEl.textContent = 'Completed';
            timerEl.style.color = 'var(--text-muted)';
            
            const card = timerEl.closest('.poll-card');
            if (card) {
              card.querySelectorAll('.poll-option').forEach(btn => {
                btn.classList.add('poll-option--results');
                btn.setAttribute('disabled', 'true');
              });
            }
            return;
          }

          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          timerEl.textContent = `⏰ ${h}h ${m}m ${s}s remaining`;
        });
      }, 1000);

      // ---- Real-time Store Subscription ----
      storeUnsubscribe = subscribe(['content', 'polls'], (newState) => {
        // 1. Update Poll UI dynamically
        newState.polls?.forEach(poll => {
          const pollCard = document.querySelector(`[data-poll-id="${poll.id}"] .poll-card`);
          if (pollCard) {
            const showResults = poll.userVote || poll.isExpired;
            poll.options.forEach(opt => {
              const btn = pollCard.querySelector(`.poll-option[data-option="${opt.id}"]`);
              if (btn) {
                btn.classList.toggle('poll-option--results', !!showResults);
                btn.classList.toggle('poll-option--voted', poll.userVote === opt.id);
                if (showResults) {
                  btn.setAttribute('disabled', 'true');
                  const pct = poll.totalVotes > 0 ? Math.round(opt.votes / poll.totalVotes * 100) : 0;
                  
                  let pctEl = btn.querySelector('.poll-option__pct');
                  if (!pctEl) {
                    pctEl = document.createElement('span');
                    pctEl.className = 'poll-option__pct';
                    btn.appendChild(pctEl);
                  }
                  pctEl.textContent = `${pct}%`;
                  
                  let barEl = btn.querySelector('.poll-option__bar');
                  if (!barEl) {
                    barEl = document.createElement('div');
                    barEl.className = 'poll-option__bar';
                    btn.appendChild(barEl);
                  }
                  barEl.style.width = `${pct}%`;
                } else {
                  btn.removeAttribute('disabled');
                  btn.querySelector('.poll-option__pct')?.remove();
                  btn.querySelector('.poll-option__bar')?.remove();
                }
              }
            });
            
            const votesEl = pollCard.querySelector('div > span:first-child');
            if (votesEl) {
              votesEl.textContent = `${(poll.totalVotes || 0).toLocaleString()} votes`;
            }
          }
        });

        // 2. Update Feed Post Likes UI dynamically
        newState.content?.forEach(item => {
          const likeBtn = document.querySelector(`.post-action[data-id="${item.id}"][data-action="like"]`);
          if (likeBtn) {
            const liked = !!item.likedByUser;
            likeBtn.classList.toggle('post-action--active', liked);
            likeBtn.innerHTML = (liked ? icons.heartFilled : icons.heart) + ` <span class="like-count" aria-hidden="true">${item.likes || 0}</span>`;
            likeBtn.setAttribute('aria-label', `Like post. ${item.likes || 0} likes`);
          }
        });

        // 3. Update active story viewer stats dynamically if open
        const storyViewer = document.getElementById('story-viewer-modal');
        if (storyViewer) {
          const circleIdx = parseInt(storyViewer.getAttribute('data-current-circle-index'));
          if (!isNaN(circleIdx)) {
            const story = allStories[circleIdx];
            if (story) {
              const originalItem = newState.content.find(c => c.id === story.id);
              if (originalItem) {
                // Update stats
                const statsEl = document.getElementById('story-viewer-stats');
                if (statsEl) {
                  statsEl.innerHTML = `
                    <span>❤️ ${originalItem.likes || 0} likes</span>
                    <span>👁️ ${originalItem.views || 0} views</span>
                  `;
                }
                // Update like button
                const likeBtn = document.getElementById('story-viewer-like');
                if (likeBtn) {
                  const liked = originalItem.likedByUser;
                  likeBtn.className = `story-viewer__like-btn ${liked ? 'story-viewer__like-btn--active' : ''}`;
                  likeBtn.innerHTML = liked ? icons.heartFilled : icons.heart;
                }
              }
            }
          }
        }
      });
    },

    cleanup() {
      if (storeUnsubscribe) storeUnsubscribe();
      if (pollTimerInterval) clearInterval(pollTimerInterval);
      if (activeProgressInterval) clearInterval(activeProgressInterval);
      if (bannerInterval) clearInterval(bannerInterval);
      document.getElementById('story-viewer-modal')?.remove();
    }
  };
}
