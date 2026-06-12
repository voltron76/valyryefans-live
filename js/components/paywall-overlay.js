// ============================================================
// ValyryesFans — Paywall Overlay Component
// ============================================================

export function renderPaywallOverlay(options = {}) {
  const {
    title = 'Exclusive Content',
    text = 'Subscribe to unlock this premium content and get access to exclusive photos, videos, and more.',
    ctaText = 'Subscribe Now',
    ctaHref = '#/subscribe'
  } = options;

  return `
    <div class="paywall-overlay animate-fade-in-up">
      <div class="paywall-overlay__icon animate-pulse-glow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="36" height="36">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
      <h2 class="paywall-overlay__title font-display">${title}</h2>
      <p class="paywall-overlay__text">${text}</p>
      <a href="${ctaHref}" class="btn btn-primary btn-lg">${ctaText}</a>
    </div>
  `;
}
