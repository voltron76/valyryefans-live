// ============================================================
// ValyryeFans — Home View (Social Post Feed)
// Premium OnlyFans-style creator feed
// ============================================================

import { getState, canAccessTier, showToast, toggleLike, addComment, tipPost, toggleBookmark, isBookmarked, polls, votePoll, activePromo } from '../store.js';
import { navigate } from '../router.js';

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
  if (!promo || !promo.active) return '';
  return `
    <div class="promo-banner animate-fade-in-up">
      <div class="promo-banner__content">
        <span class="promo-banner__text">${promo.text}</span>
        <span class="promo-banner__code">Code: ${promo.code}</span>
        <span class="promo-banner__timer">⏰ ${promo.expiresIn}</span>
      </div>
      <button class="promo-banner__close" id="close-promo">✕</button>
    </div>`;
}

// ------------------------------------
// Creator Profile Header
// ------------------------------------
function renderCreatorHeader(creatorProfile, isGold) {
  return `
    <div class="creator-header">
      <div class="creator-header__banner">
        <img src="${creatorProfile.banner}" alt="Banner">
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
function renderStoriesBar() {
  const storyLabels = ['BTS 🎬', 'Beach 🏖️', 'Gym 💪', 'Night Out 🌙', 'Morning ☀️'];
  return `
    <div class="stories-bar">
      <div class="story-item story-item--add">
        <div class="story-ring"><span>+</span></div>
        <span class="story-label">New</span>
      </div>
      ${storyLabels.map((label, i) => `
        <div class="story-item" data-story="${i}">
          <div class="story-ring ${i < 2 ? 'story-ring--unseen' : ''}">
            <img src="assets/images/hero-0${i + 2}.jpg" alt="${label}">
          </div>
          <span class="story-label">${label}</span>
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
  return `
    <div class="post-card post-card--poll animate-fade-in-up">
      <div class="post-card__header">
        <img src="${creatorProfile.avatar}" class="post-card__avatar" alt="Avatar">
        <div>
          <span class="post-card__name">${creatorProfile.name} ${icons.verified}</span>
          <span class="post-card__time">${poll.createdAt || 'Just now'}</span>
        </div>
        <button class="post-card__menu">⋯</button>
      </div>
      <div class="poll-card">
        <h3 class="poll-card__question">${poll.question}</h3>
        <div class="poll-card__options">
          ${poll.options.map(opt => `
            <button class="poll-option ${poll.userVote === opt.id ? 'poll-option--voted' : ''} ${poll.userVote ? 'poll-option--results' : ''}" data-poll="${poll.id}" data-option="${opt.id}">
              <span class="poll-option__text">${opt.text}</span>
              ${poll.userVote ? `<span class="poll-option__pct">${totalVotes > 0 ? Math.round(opt.votes / totalVotes * 100) : 0}%</span>` : ''}
              ${poll.userVote ? `<div class="poll-option__bar" style="width:${totalVotes > 0 ? Math.round(opt.votes / totalVotes * 100) : 0}%"></div>` : ''}
            </button>
          `).join('')}
        </div>
        <span class="poll-card__meta">${totalVotes.toLocaleString()} votes · ${poll.createdAt || ''}</span>
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
      <div class="post-card__media post-card__media--locked">
        <img src="${item.thumbnail}" alt="Locked" class="post-card__img post-card__img--blur">
        <div class="post-card__lock-overlay">
          ${icons.lock}
          <span>Subscribe to unlock</span>
          <a href="#/subscribe" class="btn btn-primary btn-sm">Unlock — $14.99/mo</a>
        </div>
      </div>`;
  } else if (item.type === 'video') {
    mediaHtml = `
      <div class="post-card__media">
        <video src="${item.videoUrl || item.media?.[0] || item.thumbnail}" controls poster="${item.thumbnail}" class="post-card__video"></video>
      </div>`;
  } else if (item.media?.length > 1) {
    mediaHtml = `
      <div class="post-card__media post-card__carousel" data-post-id="${item.id}">
        <div class="post-card__carousel-track">
          ${item.media.map((src, i) => `<img src="${src}" alt="${item.title} ${i + 1}" class="post-card__img ${i === 0 ? 'active' : ''}">`).join('')}
        </div>
        <div class="post-card__carousel-dots">
          ${item.media.map((_, i) => `<span class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
      </div>`;
  } else {
    mediaHtml = `
      <div class="post-card__media">
        <img src="${item.media?.[0] || item.thumbnail}" alt="${item.title}" class="post-card__img">
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
        <button class="post-card__menu">⋯</button>
      </div>

      <!-- Caption -->
      ${item.caption || item.title ? `<p class="post-card__caption">${item.caption || item.title}</p>` : ''}

      <!-- Media -->
      ${mediaHtml}

      <!-- Action Bar -->
      <div class="post-card__actions">
        <button class="post-action ${item.likedByUser ? 'post-action--active' : ''}" data-action="like" data-id="${item.id}">
          ${item.likedByUser ? icons.heartFilled : icons.heart} <span class="like-count">${item.likes || 0}</span>
        </button>
        <button class="post-action" data-action="comment" data-id="${item.id}">
          ${icons.comment} <span>${commentsArr.length || 0}</span>
        </button>
        <button class="post-action" data-action="tip" data-id="${item.id}">
          💰 Tip
        </button>
        <button class="post-action ${bookmarked ? 'post-action--active' : ''}" data-action="bookmark" data-id="${item.id}" style="margin-left:auto;">
          ${bookmarked ? icons.bookmarkFilled : icons.bookmark}
        </button>
      </div>

      <!-- Comments Section -->
      <div class="post-card__comments" id="comments-${item.id}">
        ${lastComments.map(c => `
          <div class="post-comment">
            <strong class="${c.isCreator ? 'creator-name' : ''}">${c.userName}</strong>
            <span>${c.text}</span>
          </div>
        `).join('')}
        ${commentsArr.length > 2 ? `<button class="post-comments__more" data-id="${item.id}">View all ${commentsArr.length} comments</button>` : ''}
        <div class="post-comment-input" data-id="${item.id}">
          <input type="text" placeholder="Add a comment..." class="comment-input" data-id="${item.id}">
          <button class="comment-send" data-id="${item.id}">Post</button>
        </div>
      </div>
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
          <button class="tip-modal__close" id="tip-modal-close">✕</button>
        </div>
        <div class="tip-modal__amounts">
          <button class="tip-amount-btn" data-amount="5">$5</button>
          <button class="tip-amount-btn" data-amount="10">$10</button>
          <button class="tip-amount-btn" data-amount="25">$25</button>
          <button class="tip-amount-btn" data-amount="50">$50</button>
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

  // Promo data (may be undefined if not exported from store)
  const promo = typeof activePromo !== 'undefined' ? activePromo : null;

  // Polls data (may be undefined if not exported from store)
  const pollList = typeof polls !== 'undefined' && Array.isArray(polls) ? polls : [];

  // Separate pinned posts
  const pinnedPosts = content.filter(c => c.pinned);
  const regularPosts = content.filter(c => !c.pinned);

  const html = `
    <!-- Promo Banner -->
    ${renderPromoBanner(promo)}

    <!-- Creator Header -->
    ${renderCreatorHeader(creatorProfile, isGold)}

    <!-- Stories Bar -->
    ${renderStoriesBar()}

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
      // ---- Close Promo Banner ----
      document.getElementById('close-promo')?.addEventListener('click', () => {
        const banner = document.querySelector('.promo-banner');
        if (banner) {
          banner.style.opacity = '0';
          banner.style.transform = 'translateY(-100%)';
          setTimeout(() => banner.remove(), 300);
        }
      });

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
          const isActive = btn.classList.toggle('post-action--active');
          const countEl = btn.querySelector('.like-count');
          if (countEl) {
            let count = parseInt(countEl.textContent) || 0;
            countEl.textContent = isActive ? count + 1 : Math.max(0, count - 1);
          }
          btn.innerHTML = (isActive ? icons.heartFilled : icons.heart) + ` <span class="like-count">${btn.querySelector('.like-count')?.textContent || countEl?.textContent || 0}</span>`;
          // Re-read count after innerHTML replacement
          const newCount = btn.querySelector('.like-count');
          if (newCount && countEl) {
            newCount.textContent = countEl.textContent;
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
            commentDiv.innerHTML = `<strong>${state.user?.name || 'You'}</strong> <span>${text}</span>`;
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
      document.querySelectorAll('.tip-amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tip-amount-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedTipAmount = parseInt(btn.dataset.amount);
        });
      });

      document.getElementById('tip-confirm')?.addEventListener('click', () => {
        if (!selectedTipAmount) {
          showToast('Please select a tip amount', 'error');
          return;
        }
        const message = document.getElementById('tip-message')?.value || '';
        if (typeof tipPost === 'function') {
          tipPost(tipTargetId, selectedTipAmount, message);
        }
        showToast(`Tip of $${selectedTipAmount} sent! 💰 Thank you!`);
        if (tipModal) tipModal.style.display = 'none';
        selectedTipAmount = null;
        tipTargetId = null;
        const msgInput = document.getElementById('tip-message');
        if (msgInput) msgInput.value = '';
        document.querySelectorAll('.tip-amount-btn').forEach(b => b.classList.remove('active'));
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
      document.querySelectorAll('.story-item').forEach(item => {
        item.addEventListener('click', () => {
          showToast('Stories coming soon! 🎬', 'info');
        });
      });

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

      // ---- Comment toggle (focus input) ----
      document.querySelectorAll('[data-action="comment"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const input = document.querySelector(`.comment-input[data-id="${id}"]`);
          if (input) input.focus();
        });
      });
    },

    cleanup() {
      // Nothing to clean up (no intervals)
    }
  };
}
