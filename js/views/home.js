// ============================================================
// ValyryeFans — Home View
// Stunning landing page with hero, latest content, & tiers
// ============================================================

import { getState, canAccessTier } from '../store.js';
import { navigate } from '../router.js';

// SVG icons
const icons = {
  check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L6.6 9.6l5.3-5.3a1 1 0 0 1 1.4 0z" fill="currentColor"/></svg>`,
  x: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4.3 4.3a1 1 0 0 1 1.4 0L8 6.6l2.3-2.3a1 1 0 1 1 1.4 1.4L9.4 8l2.3 2.3a1 1 0 0 1-1.4 1.4L8 9.4l-2.3 2.3a1 1 0 0 1-1.4-1.4L6.6 8 4.3 5.7a1 1 0 0 1 0-1.4z" fill="currentColor"/></svg>`,
  heart: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  lock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
};

function renderContentCard(item, index) {
  const locked = !canAccessTier(item.minTier);
  const stagger = `stagger-${Math.min(index + 1, 12)}`;
  const typeBadge = item.type === 'video' ? '🎬 Video' : '📷 Photo';
  const tierLabel = item.minTier === 'free' ? '' : item.minTier === 'gold' ? 'Gold' : 'VIP';

  if (locked) {
    return `
      <div class="gallery-card gallery-card--locked animate-fade-in-up ${stagger}" data-id="${item.id}" data-locked="true">
        <img class="gallery-card__image" src="${item.thumbnail}" alt="${item.title}" loading="lazy">
        <span class="gallery-card__type-badge">${typeBadge}</span>
        <div class="gallery-card__overlay">
          <div class="lock-icon">${icons.lock}</div>
          <div class="lock-label">${tierLabel} Exclusive</div>
          <button class="btn btn-primary btn-sm subscribe-cta">Subscribe to Unlock</button>
        </div>
      </div>`;
  }

  return `
    <a href="#/content/${item.id}" class="gallery-card animate-fade-in-up ${stagger}" data-id="${item.id}">
      <img class="gallery-card__image" src="${item.thumbnail}" alt="${item.title}" loading="lazy">
      <span class="gallery-card__type-badge">${typeBadge}</span>
      <div class="gallery-card__overlay">
        <div class="gallery-card__title">${item.title}</div>
        <div class="gallery-card__meta">
          <span>${icons.heart} ${item.likes}</span>
          <span>·</span>
          <span>${item.createdAt}</span>
        </div>
      </div>
    </a>`;
}

function renderTierCard(tier, index, currentTier) {
  const isPopular = tier.popular;
  const isCurrent = currentTier === tier.id;
  const stagger = `stagger-${Math.min(index + 1, 12)}`;

  return `
    <div class="tier-card${isPopular ? ' tier-card--popular' : ''} animate-fade-in-up ${stagger}">
      ${isPopular ? '<div class="tier-badge">Most Popular</div>' : ''}
      <div class="tier-card__name">${tier.name}</div>
      <div class="tier-card__price">
        <span class="tier-card__amount">${tier.price === 0 ? 'Free' : '$' + tier.price.toFixed(2)}</span>
        ${tier.period ? `<span class="tier-card__period">${tier.period}</span>` : ''}
      </div>
      <ul class="tier-card__features">
        ${tier.features.map(f => `
          <li class="tier-card__feature${f.included ? '' : ' tier-card__feature--disabled'}">
            ${f.included ? icons.check : icons.x}
            <span>${f.text}</span>
          </li>
        `).join('')}
      </ul>
      ${isCurrent
        ? `<div class="btn btn-secondary w-full" style="pointer-events: none; opacity: 0.7; justify-content: center;">
             ${icons.check} Current Plan
           </div>`
        : `<a href="#/subscribe" class="btn ${isPopular ? 'btn-primary' : 'btn-secondary'} btn-lg w-full" style="justify-content: center;">
             ${tier.cta} ${icons.arrow}
           </a>`
      }
    </div>`;
}

export function renderHome() {
  const state = getState();
  const { creatorProfile, content, tiers, currentTier } = state;
  const latestContent = content.slice(0, 4);

  const html = `
    <!-- ===== HERO ===== -->
    <section class="hero">
      <div class="hero__bg" id="hero-carousel">
        ${(creatorProfile.banners || [creatorProfile.banner]).map((src, i) => `
          <img src="${src}" alt="Hero banner ${i + 1}" class="hero__carousel-img ${i === 0 ? 'active' : ''}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${i === 0 ? 1 : 0};transition:opacity 1.5s ease;">
        `).join('')}
      </div>
      <div class="hero__content">
        <div class="hero__avatar animate-fade-in-up stagger-1">
          <img src="${creatorProfile.avatar}" alt="${creatorProfile.name}">
        </div>

        <h1 class="hero__name animate-fade-in-up stagger-2">
          <span class="text-gradient">${creatorProfile.name}</span>
        </h1>

        <div class="hero__handle animate-fade-in-up stagger-3">${creatorProfile.handle}</div>

        <p class="hero__bio animate-fade-in-up stagger-4">${creatorProfile.bio}</p>

        <div class="hero__stats animate-fade-in-up stagger-5">
          <div class="hero__stat">
            <div class="hero__stat-value">${creatorProfile.stats.posts}</div>
            <div class="hero__stat-label">Posts</div>
          </div>
          <div class="hero__stat">
            <div class="hero__stat-value">${creatorProfile.stats.photos}</div>
            <div class="hero__stat-label">Photos</div>
          </div>
          <div class="hero__stat">
            <div class="hero__stat-value">${content.filter(c => c.minTier === 'gold').length}+</div>
            <div class="hero__stat-label">Exclusive</div>
          </div>
          <div class="hero__stat">
            <div class="hero__stat-value">${creatorProfile.stats.fans}</div>
            <div class="hero__stat-label">Fans</div>
          </div>
        </div>

        <div class="hero__actions animate-fade-in-up stagger-6">
          <button class="btn btn-primary btn-lg" id="hero-subscribe-btn">
            ${icons.star} Subscribe Now
          </button>
          <a href="#/gallery" class="btn btn-secondary btn-lg">
            View Gallery ${icons.arrow}
          </a>
        </div>
      </div>
    </section>

    <!-- ===== LATEST CONTENT ===== -->
    <section class="section reveal">
      <div class="section__header">
        <div>
          <h2 class="section__title font-display">Latest Content</h2>
          <p class="section__subtitle">Fresh drops from Valyrye's exclusive collection</p>
        </div>
        <a href="#/gallery" class="btn btn-ghost">
          View All ${icons.arrow}
        </a>
      </div>
      <div class="gallery-grid">
        ${latestContent.map((item, i) => renderContentCard(item, i)).join('')}
      </div>
    </section>

    <!-- ===== SUBSCRIPTION TIERS ===== -->
    <section class="section reveal">
      <div class="section__header" style="justify-content: center; text-align: center; flex-direction: column; align-items: center;">
        <h2 class="section__title font-display">Unlock <span class="text-gradient">Exclusive</span> Access</h2>
        <p class="section__subtitle" style="max-width: 500px;">Choose the tier that's right for you and start enjoying premium content, direct messaging, and more.</p>
      </div>
      <div class="tiers-grid">
        ${tiers.map((tier, i) => renderTierCard(tier, i, currentTier)).join('')}
      </div>
    </section>

    <!-- ===== SOCIAL PROOF / FOOTER CTA ===== -->
    <section class="section reveal" style="text-align: center; padding-bottom: var(--space-24);">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="font-size: 48px; margin-bottom: var(--space-4);">✨</div>
        <h2 class="font-display" style="font-size: var(--text-3xl); margin-bottom: var(--space-4);">
          Join <span class="text-gradient">${creatorProfile.stats.fans}</span> Fans
        </h2>
        <p style="color: var(--text-secondary); margin-bottom: var(--space-8); font-size: var(--text-lg);">
          Don't miss out on exclusive content, behind-the-scenes access, and personal interactions with Valyrye.
        </p>
        <button class="btn btn-primary btn-lg" id="footer-subscribe-btn">
          ${icons.star} Get Started Today
        </button>
      </div>
    </section>
  `;

  return {
    html,
    afterRender() {
      // Hero carousel
      const carousel = document.getElementById('hero-carousel');
      if (carousel) {
        const imgs = carousel.querySelectorAll('.hero__carousel-img');
        if (imgs.length > 1) {
          let current = 0;
          setInterval(() => {
            imgs[current].style.opacity = '0';
            current = (current + 1) % imgs.length;
            imgs[current].style.opacity = '1';
          }, 4000);
        }
      }

      // Subscribe buttons
      document.getElementById('hero-subscribe-btn')?.addEventListener('click', () => navigate('/subscribe'));
      document.getElementById('footer-subscribe-btn')?.addEventListener('click', () => navigate('/subscribe'));

      // Locked card subscribe CTAs
      document.querySelectorAll('.subscribe-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate('/subscribe');
        });
      });

      // Locked cards themselves
      document.querySelectorAll('.gallery-card[data-locked="true"]').forEach(card => {
        card.addEventListener('click', () => navigate('/subscribe'));
        card.style.cursor = 'pointer';
      });
    }
  };
}
