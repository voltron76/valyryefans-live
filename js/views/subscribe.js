// ============================================================
// ValyryeFans — Subscribe View
// Subscription tiers selection with FAQ
// ============================================================

import { getState, canAccessTier, showToast } from '../store.js';
import { navigate } from '../router.js';

const icons = {
  check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L6.6 9.6l5.3-5.3a1 1 0 0 1 1.4 0z" fill="currentColor"/></svg>`,
  x: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4.3 4.3a1 1 0 0 1 1.4 0L8 6.6l2.3-2.3a1 1 0 1 1 1.4 1.4L9.4 8l2.3 2.3a1 1 0 0 1-1.4 1.4L8 9.4l-2.3 2.3a1 1 0 0 1-1.4-1.4L6.6 8 4.3 5.7a1 1 0 0 1 0-1.4z" fill="currentColor"/></svg>`,
  star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  chevDown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
  heart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  zap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  crown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17l3-12 5 7 2-10 2 10 5-7 3 12z"/><path d="M2 17h20"/></svg>`,
};

const tierIcons = { free: icons.heart, gold: icons.zap };

const faqItems = [
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely! You can cancel your subscription at any time from your profile settings. You\'ll continue to have access until the end of your current billing period.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. All payments are processed securely through Stripe.'
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes! You can change your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the change takes effect at the end of your current billing period.'
  },
  {
    q: 'Is my payment information secure?',
    a: 'Your security is our priority. All payment processing is handled by Stripe, a PCI-DSS Level 1 certified payment provider. We never store your credit card details on our servers.'
  },
  {
    q: 'What\'s included in custom content requests?',
    a: 'Gold subscribers can request personalized photos and messages. Custom requests are fulfilled within 5-7 business days and are completely exclusive to you.'
  },
  {
    q: 'How often is new content posted?',
    a: 'New content is posted 3-5 times per week, including exclusive photos and behind-the-scenes content. Gold members get early access to all new drops.'
  },
];

function renderTierCard(tier, index, currentTier) {
  const isPopular = tier.popular;
  const isCurrent = currentTier === tier.id;
  const stagger = `stagger-${Math.min(index + 1, 12)}`;
  const icon = tierIcons[tier.id] || icons.star;

  return `
    <div class="tier-card${isPopular ? ' tier-card--popular' : ''} animate-fade-in-up ${stagger}">
      ${isPopular ? '<div class="tier-badge">✨ Most Popular</div>' : ''}
      ${isCurrent ? `<div class="tier-badge" style="background: var(--success); top: -12px;">${icons.check} Current Plan</div>` : ''}

      <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);">
        <div style="width: 36px; height: 36px; border-radius: var(--radius-full); background: ${isPopular ? 'var(--gradient-accent)' : 'var(--accent-subtle)'}; display: flex; align-items: center; justify-content: center; color: ${isPopular ? 'var(--btn-primary-text)' : 'var(--accent-light)'};">
          ${icon}
        </div>
        <div class="tier-card__name" style="margin-bottom: 0;">${tier.name}</div>
      </div>

      <div class="tier-card__price">
        <span class="tier-card__amount">${tier.price === 0 ? 'Free' : '$' + tier.price.toFixed(2)}</span>
        ${tier.period ? `<span class="tier-card__period">${tier.period}</span>` : ''}
      </div>

      ${tier.price > 0 ? `
        <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-6); margin-top: calc(-1 * var(--space-4));">
          Billed monthly · Cancel anytime
        </div>
      ` : `
        <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-6); margin-top: calc(-1 * var(--space-4));">
          No credit card required
        </div>
      `}

      <ul class="tier-card__features">
        ${tier.features.map(f => `
          <li class="tier-card__feature${f.included ? '' : ' tier-card__feature--disabled'}">
            <span style="color: ${f.included ? 'var(--accent)' : 'var(--text-muted)'};">
              ${f.included ? icons.check : icons.x}
            </span>
            <span>${f.text}</span>
          </li>
        `).join('')}
      </ul>

      ${isCurrent
        ? `<div class="btn btn-secondary w-full" style="pointer-events: none; justify-content: center; opacity: 0.6;">
             ${icons.check} Your Current Plan
           </div>`
        : `<button class="btn ${isPopular ? 'btn-primary' : 'btn-secondary'} btn-lg w-full tier-select-btn" data-tier="${tier.id}" style="justify-content: center;">
             ${tier.cta}
           </button>`
      }
    </div>`;
}

export function renderSubscribe() {
  const state = getState();
  const { tiers, currentTier, creatorProfile } = state;

  const tiersHtml = tiers.map((tier, i) => renderTierCard(tier, i, currentTier)).join('');

  const html = `
    <div style="min-height: calc(100vh - var(--nav-height));">
      <!-- Header -->
      <div class="section" style="text-align: center; padding-bottom: 0;">
        <div class="animate-fade-in-up stagger-1" style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: var(--radius-full); background: var(--accent-subtle); border: 2px solid var(--border-accent); margin-bottom: var(--space-6);">
          ${icons.crown}
        </div>
        <h1 class="font-display animate-fade-in-up stagger-2" style="font-size: var(--text-4xl); margin-bottom: var(--space-4);">
          Choose Your <span class="text-gradient">Plan</span>
        </h1>
        <p class="animate-fade-in-up stagger-3" style="color: var(--text-secondary); max-width: 500px; margin: 0 auto; font-size: var(--text-lg);">
          Unlock exclusive content, direct messaging, and personal interactions with ${creatorProfile.name}.
        </p>
      </div>

      <!-- Tiers Grid -->
      <div class="section" style="padding-top: var(--space-10);">
        <div class="tiers-grid">
          ${tiersHtml}
        </div>
      </div>

      <!-- Trust badges -->
      <div class="section reveal" style="padding-top: 0; padding-bottom: var(--space-8);">
        <div style="display: flex; justify-content: center; gap: var(--space-10); flex-wrap: wrap; color: var(--text-muted); font-size: var(--text-sm);">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            ${icons.shield} Secure Payments
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            ${icons.check} Cancel Anytime
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            ${icons.star} Instant Access
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="section reveal" style="max-width: 700px;">
        <h2 class="section__title font-display" style="text-align: center; margin-bottom: var(--space-10);">
          Frequently Asked Questions
        </h2>

        <div id="faq-list" style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${faqItems.map((item, i) => `
            <div class="card animate-fade-in-up stagger-${Math.min(i + 1, 12)}" style="border-radius: var(--radius-md); overflow: hidden;">
              <button class="faq-toggle" data-faq="${i}" style="width: 100%; padding: var(--space-5) var(--space-6); display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); text-align: left; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); cursor: pointer;">
                <span>${item.q}</span>
                <span class="faq-chevron" style="flex-shrink: 0; color: var(--text-muted); transition: transform var(--transition-base);">
                  ${icons.chevDown}
                </span>
              </button>
              <div class="faq-answer" data-faq-answer="${i}" style="max-height: 0; overflow: hidden; transition: max-height var(--transition-base), padding var(--transition-base);">
                <div style="padding: 0 var(--space-6) var(--space-5); color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.7;">
                  ${item.a}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="section reveal" style="text-align: center; padding-bottom: var(--space-24);">
        <p style="color: var(--text-muted); font-size: var(--text-sm);">
          Have more questions? <a href="#/messages" style="color: var(--accent-light);">Send a message</a> and I'll be happy to help!
        </p>
      </div>
    </div>
  `;

  return {
    html,
    afterRender() {
      // Tier select buttons
      document.querySelectorAll('.tier-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tier = btn.dataset.tier;
          const state = getState();

          if (!state.isAuthenticated) {
            import('../main.js').then(({ openAuthModal }) => openAuthModal('signup'));
            return;
          }

          if (tier === 'gold') {
            // Route through Stripe checkout
            navigate('/checkout');
          } else {
            // Free tier — just set it
            state.currentTier = 'free';
            showToast('You\'re on the Free plan!', 'success');
            navigate('/profile');
          }
        });
      });

      // FAQ accordion
      document.querySelectorAll('.faq-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
          const idx = toggle.dataset.faq;
          const answer = document.querySelector(`[data-faq-answer="${idx}"]`);
          const chevron = toggle.querySelector('.faq-chevron');

          if (!answer) return;

          const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';

          // Close all
          document.querySelectorAll('.faq-answer').forEach(a => a.style.maxHeight = '0px');
          document.querySelectorAll('.faq-chevron').forEach(c => c.style.transform = 'rotate(0deg)');

          if (!isOpen) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
          }
        });
      });
    }
  };
}
